"use server";

import { Prisma, StatusPaketLatihan, StatusSoal } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireGuru } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type PaketFormState = { error: string };

function teks(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function simpanPaket(
  _prev: PaketFormState,
  formData: FormData,
): Promise<PaketFormState> {
  await requireGuru();

  const id = teks(formData, "id");
  const mapelId = teks(formData, "mapelId");
  const kelas = Number(formData.get("kelas"));
  const judul = teks(formData, "judul");
  const deskripsi = teks(formData, "deskripsi") || null;
  const urutan = Number(formData.get("urutan") || 0);
  const durasiMenit = Number(formData.get("durasiMenit"));
  const status =
    formData.get("status") === "TERBIT"
      ? StatusPaketLatihan.TERBIT
      : StatusPaketLatihan.DRAF;
  const soalIds = [
    ...new Set(
      formData
        .getAll("soalIds")
        .map((item) => String(item).trim())
        .filter(Boolean),
    ),
  ];

  if (!mapelId) return { error: "Mapel wajib dipilih." };
  if (kelas !== 5 && kelas !== 6) return { error: "Kelas tidak valid." };
  if (!judul) return { error: "Judul paket wajib diisi." };
  if (!Number.isInteger(urutan) || urutan < 0) {
    return { error: "Urutan tidak valid." };
  }
  if (!Number.isInteger(durasiMenit) || durasiMenit < 1 || durasiMenit > 120) {
    return { error: "Durasi harus 1 sampai 120 menit." };
  }
  if (soalIds.length === 0) return { error: "Pilih minimal satu soal." };
  if (soalIds.length > 100) return { error: "Maksimal 100 soal per paket." };

  const mapel = await prisma.mapel.findUnique({
    where: { id: mapelId },
    select: { id: true, slug: true },
  });
  if (!mapel) return { error: "Mapel tidak ditemukan." };

  const soal = await prisma.soal.findMany({
    where: { id: { in: soalIds } },
    select: { id: true, mapelId: true, kelas: true, status: true },
  });
  if (soal.length !== soalIds.length) {
    return { error: "Ada soal yang tidak ditemukan." };
  }
  if (
    soal.some(
      (item) =>
        item.mapelId !== mapelId ||
        item.kelas !== kelas ||
        item.status !== "TERBIT",
    )
  ) {
    return {
      error:
        "Semua soal harus berasal dari mapel dan kelas yang sama, serta sudah terbit.",
    };
  }

  const lama = id
    ? await prisma.paketLatihan.findUnique({
        where: { id },
        select: {
          id: true,
          mapelId: true,
          kelas: true,
          _count: { select: { latihan: true } },
        },
      })
    : null;
  if (id && !lama) return { error: "Paket latihan tidak ditemukan." };
  if (
    lama &&
    lama._count.latihan > 0 &&
    (lama.mapelId !== mapelId || lama.kelas !== kelas)
  ) {
    return {
      error:
        "Paket sudah dikerjakan siswa. Mapel dan kelas tidak boleh diubah.",
    };
  }

  const data = {
    mapelId,
    kelas,
    judul,
    deskripsi,
    urutan,
    durasiMenit,
    status,
  };

  try {
    await prisma.$transaction(async (tx) => {
      const paket = id
        ? await tx.paketLatihan.update({ where: { id }, data })
        : await tx.paketLatihan.create({ data });

      if (id) {
        await tx.paketLatihanSoal.deleteMany({
          where: { paketId: paket.id },
        });
      }
      await tx.paketLatihanSoal.createMany({
        data: soalIds.map((soalId, index) => ({
          paketId: paket.id,
          soalId,
          urutan: index,
        })),
      });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        error: "Judul paket sudah dipakai untuk mapel dan kelas ini.",
      };
    }
    return { error: "Paket latihan gagal disimpan." };
  }

  revalidatePath("/guru/latihan");
  revalidatePath("/guru/beranda");
  revalidatePath("/siswa/bank-soal");
  revalidatePath(`/siswa/bank-soal/${mapel.slug}`);
  revalidatePath("/siswa/beranda");
  revalidateTag("paket");
  redirect("/guru/latihan");
}

export async function hapusPaket(
  id: string,
): Promise<{ ok: true } | { error: string }> {
  await requireGuru();

  try {
    await prisma.paketLatihan.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return { error: "Paket latihan tidak ditemukan." };
      }
      if (error.code === "P2003") {
        return {
          error: "Paket sudah dikerjakan siswa dan tidak bisa dihapus.",
        };
      }
    }
    return { error: "Paket latihan gagal dihapus." };
  }

  revalidatePath("/guru/latihan");
  revalidatePath("/guru/beranda");
  revalidatePath("/siswa/bank-soal");
  revalidatePath("/siswa/beranda");
  revalidateTag("paket");
  return { ok: true };
}

export async function hapusPaketDanRiwayat(
  id: string,
): Promise<{ ok: true } | { error: string }> {
  await requireGuru();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.latihan.deleteMany({ where: { paketId: id } });
      await tx.paketLatihan.delete({ where: { id } });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { error: "Paket latihan tidak ditemukan." };
    }
    return { error: "Paket latihan gagal dihapus." };
  }

  revalidatePath("/guru/latihan");
  revalidatePath("/guru/rekap");
  revalidatePath("/guru/beranda");
  revalidatePath("/siswa/bank-soal");
  revalidatePath("/siswa/hasil-latihan");
  revalidatePath("/siswa/beranda");
  revalidateTag("paket");
  return { ok: true };
}

export type MetaPaketState = { error: string };

export async function simpanMetaPaket(
  _prev: MetaPaketState,
  formData: FormData,
): Promise<MetaPaketState> {
  await requireGuru();

  const id = teks(formData, "id");
  const mapelId = teks(formData, "mapelId");
  const kelas = Number(formData.get("kelas"));
  const judul = teks(formData, "judul");
  const deskripsi = teks(formData, "deskripsi") || null;
  const urutan = Number(formData.get("urutan") || 0);
  const durasiMenit = Number(formData.get("durasiMenit") || 5);
  const status =
    formData.get("status") === "TERBIT"
      ? StatusPaketLatihan.TERBIT
      : StatusPaketLatihan.DRAF;

  if (!mapelId) return { error: "Mapel wajib dipilih." };
  if (kelas !== 5 && kelas !== 6) return { error: "Kelas tidak valid." };
  if (!judul) return { error: "Judul paket wajib diisi." };
  if (!Number.isInteger(durasiMenit) || durasiMenit < 1 || durasiMenit > 120)
    return { error: "Durasi harus 1–120 menit." };

  const lama = id
    ? await prisma.paketLatihan.findUnique({
        where: { id },
        select: { mapelId: true, kelas: true, _count: { select: { latihan: true } } },
      })
    : null;
  if (id && !lama) return { error: "Paket tidak ditemukan." };
  if (lama && lama._count.latihan > 0 && (lama.mapelId !== mapelId || lama.kelas !== kelas))
    return { error: "Paket sudah dikerjakan siswa. Mapel dan kelas tidak boleh diubah." };

  const data = { mapelId, kelas, judul, deskripsi, urutan, durasiMenit, status };

  try {
    if (id) {
      await prisma.paketLatihan.update({ where: { id }, data });
    } else {
      await prisma.paketLatihan.create({ data });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
      return { error: "Judul paket sudah dipakai untuk mapel dan kelas ini." };
    return { error: "Paket gagal disimpan." };
  }

  revalidatePath("/guru/latihan");
  revalidatePath("/siswa/bank-soal");
  revalidateTag("paket");
  return { error: "" };
}

export type SoalPaketState = { error: string };

export async function simpanSoalKePaket(
  _prev: SoalPaketState,
  formData: FormData,
): Promise<SoalPaketState> {
  await requireGuru();

  const paketId = teks(formData, "paketId");
  const soalId = teks(formData, "soalId");
  const teksSoal = teks(formData, "teks");
  const topik = teks(formData, "topik") || null;
  const pembahasan = teks(formData, "pembahasan") || null;
  const kunci = Number(formData.get("kunci"));
  const pilihan = formData.getAll("pilihan").map((item) => String(item).trim());

  if (!paketId) return { error: "Paket wajib dipilih." };
  if (!teksSoal) return { error: "Pertanyaan wajib diisi." };
  if (pilihan.length !== 4 || pilihan.some((item) => !item))
    return { error: "Isi keempat pilihan jawaban." };
  if (!Number.isInteger(kunci) || kunci < 0 || kunci >= 4)
    return { error: "Pilih satu kunci jawaban." };

  const paket = await prisma.paketLatihan.findUnique({
    where: { id: paketId },
    select: { id: true, mapelId: true, kelas: true, _count: { select: { soal: true } } },
  });
  if (!paket) return { error: "Paket tidak ditemukan." };

  try {
    await prisma.$transaction(async (tx) => {
      let targetSoalId = soalId;

      if (soalId) {
        await tx.soal.update({
          where: { id: soalId },
          data: { teks: teksSoal, topik, pembahasan },
        });
        await tx.pilihan.deleteMany({ where: { soalId } });
        await tx.pilihan.createMany({
          data: pilihan.map((t, urutan) => ({
            soalId,
            teks: t,
            urutan,
            benar: urutan === kunci,
          })),
        });
      } else {
        const soalBaru = await tx.soal.create({
          data: {
            mapelId: paket.mapelId,
            kelas: paket.kelas,
            teks: teksSoal,
            topik,
            pembahasan,
            status: StatusSoal.TERBIT,
            pilihan: {
              create: pilihan.map((t, urutan) => ({
                teks: t,
                urutan,
                benar: urutan === kunci,
              })),
            },
          },
          select: { id: true },
        });
        targetSoalId = soalBaru.id;

        await tx.paketLatihanSoal.create({
          data: {
            paketId,
            soalId: targetSoalId,
            urutan: paket._count.soal,
          },
        });
      }
    });
  } catch {
    return { error: "Soal gagal disimpan." };
  }

  revalidatePath("/guru/latihan");
  revalidatePath("/siswa/bank-soal");
  revalidateTag("soal");
  revalidateTag("paket");
  return { error: "" };
}

export async function getBankSoalUntukPaket(
  paketId: string,
): Promise<{ id: string; teks: string; topik: string | null; mapelId: string; kelas: number }[]> {
  await requireGuru();
  const paket = await prisma.paketLatihan.findUnique({
    where: { id: paketId },
    select: { mapelId: true, kelas: true, soal: { select: { soalId: true } } },
  });
  if (!paket) return [];
  const sudahAda = new Set(paket.soal.map((s) => s.soalId));
  const soal = await prisma.soal.findMany({
    where: { mapelId: paket.mapelId, kelas: paket.kelas },
    orderBy: { createdAt: "asc" },
    select: { id: true, teks: true, topik: true, mapelId: true, kelas: true },
  });
  return soal.filter((s) => !sudahAda.has(s.id));
}

export async function tambahSoalBankKePaket(
  paketId: string,
  soalId: string,
): Promise<{ ok: true } | { error: string }> {
  await requireGuru();

  const paket = await prisma.paketLatihan.findUnique({
    where: { id: paketId },
    select: { mapelId: true, kelas: true, _count: { select: { soal: true } } },
  });
  if (!paket) return { error: "Paket tidak ditemukan." };

  const soal = await prisma.soal.findUnique({
    where: { id: soalId },
    select: { mapelId: true, kelas: true, status: true },
  });
  if (!soal) return { error: "Soal tidak ditemukan." };
  if (soal.mapelId !== paket.mapelId)
    return { error: "Soal bukan dari mapel yang sama." };
  if (soal.kelas !== paket.kelas)
    return { error: "Soal bukan dari kelas yang sama." };

  if (soal.status !== "TERBIT") {
    await prisma.soal.update({ where: { id: soalId }, data: { status: StatusSoal.TERBIT } });
  }

  try {
    await prisma.paketLatihanSoal.create({
      data: { paketId, soalId, urutan: paket._count.soal },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
      return { error: "Soal sudah ada di paket ini." };
    return { error: "Gagal menambahkan soal." };
  }

  revalidatePath("/guru/latihan");
  revalidatePath("/siswa/bank-soal");
  revalidateTag("soal");
  revalidateTag("paket");
  return { ok: true as const };
}

export async function hapusSoalDariPaket(
  paketId: string,
  soalId: string,
): Promise<{ ok: true } | { error: string }> {
  await requireGuru();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.paketLatihanSoal.delete({
        where: { paketId_soalId: { paketId, soalId } },
      });
      const sisaPaket = await tx.paketLatihanSoal.count({ where: { soalId } });
      const adaJawaban = await tx.jawaban.count({ where: { soalId } });
      if (sisaPaket === 0 && adaJawaban === 0) {
        await tx.soal.delete({ where: { id: soalId } });
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025")
      return { error: "Soal tidak ditemukan." };
    return { error: "Soal gagal dihapus." };
  }

  revalidatePath("/guru/latihan");
  revalidatePath("/siswa/bank-soal");
  revalidateTag("soal");
  revalidateTag("paket");
  return { ok: true };
}
