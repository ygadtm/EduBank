"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireSiswa } from "@/lib/auth";
import { prisma } from "@/lib/db";

type HasilId = { id: string } | { error: string };

type HasilJawaban =
  | { error: string }
  | { benar: boolean; pilihanBenarId: string | null; pembahasan: string };

export async function mulaiLatihan(paketId: string): Promise<HasilId> {
  const user = await requireSiswa();
  if (!user.kelas) return { error: "Kelas siswa belum diisi." };

  const paket = await prisma.paketLatihan.findFirst({
    where: {
      id: paketId,
      kelas: user.kelas,
      status: "TERBIT",
    },
    select: {
      id: true,
      mapelId: true,
      kelas: true,
      soal: {
        orderBy: [{ urutan: "asc" }, { soalId: "asc" }],
        select: {
          soalId: true,
          urutan: true,
          soal: { select: { status: true } },
        },
      },
    },
  });
  if (!paket) return { error: "Paket latihan tidak ditemukan." };
  if (paket.soal.length === 0) {
    return { error: "Paket latihan belum berisi soal." };
  }
  if (paket.soal.some((item) => item.soal.status !== "TERBIT")) {
    return {
      error: "Paket latihan belum siap. Ada soal yang belum terbit.",
    };
  }

  const latihan = await prisma.latihan.create({
    data: {
      siswaId: user.id,
      paketId: paket.id,
      mapelId: paket.mapelId,
      kelas: paket.kelas,
      soal: {
        create: paket.soal.map((item, index) => ({
          soalId: item.soalId,
          urutan: item.urutan ?? index,
        })),
      },
    },
    select: { id: true },
  });

  return { id: latihan.id };
}

export async function simpanJawaban(
  latihanId: string,
  soalId: string,
  pilihanId: string,
): Promise<HasilJawaban> {
  const user = await requireSiswa();

  const latihan = await prisma.latihan.findFirst({
    where: { id: latihanId, siswaId: user.id, selesai: null },
    select: {
      mapelId: true,
      kelas: true,
      soal: { select: { soalId: true } },
    },
  });
  if (!latihan) return { error: "Latihan tidak ditemukan atau sudah selesai." };

  const snapshot = new Set(latihan.soal.map((item) => item.soalId));
  if (snapshot.size > 0 && !snapshot.has(soalId)) {
    return { error: "Soal tidak termasuk dalam paket latihan ini." };
  }

  const soal = await prisma.soal.findFirst({
    where: {
      id: soalId,
      ...(snapshot.size === 0
        ? {
            mapelId: latihan.mapelId,
            kelas: latihan.kelas,
            status: "TERBIT",
          }
        : {}),
    },
    select: {
      pembahasan: true,
      pilihan: { select: { id: true, benar: true } },
    },
  });
  if (!soal) return { error: "Soal tidak ditemukan." };

  const pilihan = soal.pilihan.find((p) => p.id === pilihanId);
  if (!pilihan) return { error: "Pilihan jawaban tidak valid." };

  await prisma.jawaban.upsert({
    where: { latihanId_soalId: { latihanId, soalId } },
    create: {
      latihanId,
      soalId,
      pilihanId,
      benar: pilihan.benar,
    },
    update: {
      pilihanId,
      benar: pilihan.benar,
    },
  });

  return {
    benar: pilihan.benar,
    pilihanBenarId: soal.pilihan.find((p) => p.benar)?.id ?? null,
    pembahasan: soal.pembahasan ?? "",
  };
}

export async function selesaikanLatihan(latihanId: string): Promise<HasilId> {
  const user = await requireSiswa();

  const latihan = await prisma.latihan.findFirst({
    where: { id: latihanId, siswaId: user.id },
    select: {
      mapelId: true,
      kelas: true,
      selesai: true,
      soal: { select: { soalId: true } },
    },
  });
  if (!latihan) return { error: "Latihan tidak ditemukan." };
  if (latihan.selesai) return { id: latihanId };

  let soalIds = latihan.soal.map((item) => item.soalId);
  if (soalIds.length === 0) {
    const soal = await prisma.soal.findMany({
      where: {
        mapelId: latihan.mapelId,
        kelas: latihan.kelas,
        status: "TERBIT",
      },
      select: { id: true },
    });
    soalIds = soal.map((item) => item.id);
  }

  const sudah = await prisma.jawaban.findMany({
    where: { latihanId },
    select: { soalId: true },
  });
  const sudahSet = new Set(sudah.map((j) => j.soalId));
  const belum = soalIds.filter((soalId) => !sudahSet.has(soalId));

  await prisma.$transaction([
    ...(belum.length
      ? [
          prisma.jawaban.createMany({
            data: belum.map((soalId) => ({
              latihanId,
              soalId,
              pilihanId: null,
              benar: false,
            })),
            skipDuplicates: true,
          }),
        ]
      : []),
    prisma.latihan.update({
      where: { id: latihanId },
      data: { selesai: new Date() },
    }),
  ]);

  revalidatePath("/siswa/beranda");
  revalidatePath("/siswa/hasil-latihan");
  revalidatePath("/guru/latihan");
  revalidateTag("jawaban");
  return { id: latihanId };
}
