"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireGuru } from "@/lib/auth";
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

  const ada = await prisma.user.findUnique({
    where: { nisNip },
    select: { id: true },
  });
  if (ada) return { error: "NIS sudah terdaftar." };

  await prisma.user.create({
    data: {
      nama,
      nisNip,
      password: await hashPassword(nisNip),
      role: "SISWA",
      kelas: Number(kelas),
      aktif: true,
      harusGantiPassword: true,
    },
  });

  revalidatePath("/guru/siswa");
  revalidateTag("siswa");
  return { ok: true };
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
