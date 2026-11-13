"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireGuru } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";

type TambahSiswaState = { error?: string; ok?: boolean };

function validNis(value: string) {
  return /^\d{4,20}$/.test(value);
}

export async function tambahSiswa(
  _: TambahSiswaState,
  formData: FormData,
): Promise<TambahSiswaState> {
  await requireGuru();

  const nama = String(formData.get("nama") ?? "").trim();
  const nisNip = String(formData.get("nisNip") ?? "").trim();
  const kelas = String(formData.get("kelas") ?? "").trim();

  if (!nama) return { error: "Nama wajib diisi." };
  if (!validNis(nisNip)) return { error: "NIS harus 4-20 digit." };
  if (kelas !== "5" && kelas !== "6") return { error: "Kelas harus 5 atau 6." };

  const ada = await prisma.$transaction([
    prisma.user.findUnique({ where: { nisNip }, select: { id: true } }),
    prisma.user.count({
      where: { nama: { equals: nama, mode: "insensitive" }, role: "SISWA" },
    }),
  ]);
  if (ada[0]) return { error: "NIS sudah terdaftar." };
  if (ada[1] > 0) return { error: "Nama siswa sudah dipakai, gunakan nama unik." };

  await prisma.user.create({
    data: {
      nama,
      nisNip,
      password: await hashPassword(nisNip),
      role: "SISWA",
      kelas: Number(kelas),
      aktif: true,
      harusGantiPassword: false,
    },
  });

  revalidatePath("/guru/siswa");
  return { ok: true };
}

export async function resetPasswordSiswa(id: string) {
  await requireAdmin();

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
      harusGantiPassword: false,
    },
  });

  revalidatePath("/guru/siswa");
  return { ok: true };
}

export async function hapusSiswa(id: string) {
  await requireAdmin();

  const siswa = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });
  if (!siswa || siswa.role !== "SISWA") {
    return { error: "Siswa tidak ditemukan." };
  }

  await prisma.user.delete({ where: { id } });

  revalidatePath("/guru/siswa");
  return { ok: true };
}
