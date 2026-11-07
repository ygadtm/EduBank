"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireGuru } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";

type BarisImpor = {
  nama: string;
  nisNip: string;
  kelas: string;
};

function validNis(value: string) {
  return /^\d{4,20}$/.test(value);
}

export async function imporSiswa(rows: unknown) {
  await requireGuru();

  if (!Array.isArray(rows)) return { error: "Data impor tidak valid." };
  if (rows.length === 0) return { error: "File tidak berisi data." };
  if (rows.length > 500) return { error: "Maksimal 500 baris per impor." };

  const valid: BarisImpor[] = [];
  const gagal: string[] = [];
  const terlihat = new Set<string>();

  for (const [index, raw] of rows.entries()) {
    if (typeof raw !== "object" || raw === null) {
      gagal.push(`Baris ${index + 2}: format tidak valid.`);
      continue;
    }
    const item = raw as Record<string, unknown>;
    const nama = String(item.nama ?? "").trim();
    const nisNip = String(item.nisNip ?? "").trim();
    const kelas = String(item.kelas ?? "")
      .replace(/\D/g, "")
      .trim();

    if (!nama) {
      gagal.push(`Baris ${index + 2}: nama kosong.`);
      continue;
    }
    if (!validNis(nisNip)) {
      gagal.push(`Baris ${index + 2}: NIS harus 4-20 digit.`);
      continue;
    }
    if (kelas !== "5" && kelas !== "6") {
      gagal.push(`Baris ${index + 2}: kelas harus 5 atau 6.`);
      continue;
    }
    if (terlihat.has(nisNip)) {
      gagal.push(`Baris ${index + 2}: NIS ${nisNip} duplikat di file.`);
      continue;
    }

    terlihat.add(nisNip);
    valid.push({ nama, nisNip, kelas });
  }

  if (valid.length === 0) {
    return { error: "Tidak ada baris valid.", gagal };
  }

  const sudahAda = await prisma.user.findMany({
    where: { nisNip: { in: valid.map((item) => item.nisNip) } },
    select: { nisNip: true },
  });
  const adaSet = new Set(sudahAda.map((item) => item.nisNip));

  const siap = await Promise.all(
    valid.map(async (item) => ({
      ...item,
      password: adaSet.has(item.nisNip)
        ? null
        : await hashPassword(item.nisNip),
    })),
  );

  await prisma.$transaction(
    siap.map((item) =>
      prisma.user.upsert({
        where: { nisNip: item.nisNip },
        create: {
          nama: item.nama,
          nisNip: item.nisNip,
          password: item.password!,
          role: "SISWA",
          kelas: Number(item.kelas),
          aktif: true,
          harusGantiPassword: true,
        },
        update: {
          nama: item.nama,
          role: "SISWA",
          kelas: Number(item.kelas),
          aktif: true,
        },
      }),
    ),
  );
  revalidatePath("/guru/siswa");
  revalidateTag("siswa");

  return {
    dibuat: valid.filter((item) => !adaSet.has(item.nisNip)).length,
    diperbarui: valid.filter((item) => adaSet.has(item.nisNip)).length,
    gagal,
  };
}

export async function resetPasswordSiswa(id: string) {
  await requireGuru();

  const siswa = await prisma.user.findUnique({
    where: { id },
    select: { id: true, nisNip: true, role: true },
  });
  if (!siswa || siswa.role !== "SISWA") {
    return { error: "Siswa tidak ditemukan." };
  }

  await prisma.user.update({
    where: { id: siswa.id },
    data: {
      password: await hashPassword(siswa.nisNip),
      harusGantiPassword: true,
    },
  });

  revalidatePath("/guru/siswa");
  return { ok: true };
}
