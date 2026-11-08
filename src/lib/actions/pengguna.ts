"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";

type TambahGuruState = { error?: string; ok?: boolean };

function validNip(value: string) {
  return /^\d{4,25}$/.test(value);
}

export async function tambahGuru(
  _: TambahGuruState,
  formData: FormData,
): Promise<TambahGuruState> {
  await requireAdmin();

  const nama = String(formData.get("nama") ?? "").trim();
  const nip = String(formData.get("nisNip") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!nama) return { error: "Nama wajib diisi." };
  if (!validNip(nip)) return { error: "NIP harus 4-25 digit." };
  if (password.length < 8) return { error: "Password minimal 8 karakter." };

  const nipTerdaftar = await prisma.user.findUnique({
    where: { nisNip: nip },
    select: { id: true },
  });
  if (nipTerdaftar) return { error: "NIP sudah terdaftar." };

  await prisma.user.create({
    data: {
      nama,
      nisNip: nip,
      password: await hashPassword(password),
      role: "GURU",
      aktif: true,
      harusGantiPassword: true,
    },
  });

  revalidatePath("/guru/pengguna");
  return { ok: true };
}

export async function hapusGuru(id: string) {
  const admin = await requireAdmin();

  const guru = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });
  if (!guru || guru.role !== "GURU") {
    return { error: "Guru tidak ditemukan." };
  }
  if (guru.id === admin.id) {
    return { error: "Tidak bisa menghapus akun sendiri." };
  }

  await prisma.user.delete({ where: { id } });

  revalidatePath("/guru/pengguna");
  return { ok: true };
}

export async function resetPasswordGuru(id: string) {
  const admin = await requireAdmin();

  const guru = await prisma.user.findUnique({
    where: { id },
    select: { id: true, nisNip: true, role: true },
  });
  if (!guru || guru.role !== "GURU") {
    return { error: "Guru tidak ditemukan." };
  }
  if (guru.id === admin.id) {
    return { error: "Tidak bisa reset akun sendiri. Ganti lewat menu ganti password." };
  }

  await prisma.user.update({
    where: { id: guru.id },
    data: {
      password: await hashPassword(guru.nisNip),
      harusGantiPassword: true,
    },
  });

  revalidatePath("/guru/pengguna");
  return { ok: true };
}

