"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  clearSessionCookie,
  getSession,
  setSessionCookie,
} from "@/lib/session";

export type AuthState = { error: string };

const GAGAL = "Nama/NIS atau kata sandi salah.";

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const role = formData.get("role") === "GURU" ? "GURU" : "SISWA";

  const pilih = {
    id: true,
    password: true,
    aktif: true,
    role: true,
  } as const;

  let user;
  if (role === "GURU") {
    const nip = String(formData.get("nisNip") ?? "").trim();
    if (!nip || !password) {
      return { error: "NIP dan kata sandi wajib diisi." };
    }
    const guru = await prisma.user.findUnique({
      where: { nisNip: nip },
      select: pilih,
    });
    user = guru && guru.aktif && (await verifyPassword(password, guru.password))
      ? guru
      : null;
  } else {
    const nama = String(formData.get("nama") ?? "").trim();
    if (!nama || !password) {
      return { error: "Nama dan kata sandi wajib diisi." };
    }
    const kandidat = await prisma.user.findMany({
      where: { nama: { equals: nama, mode: "insensitive" }, role: "SISWA" },
      select: pilih,
    });
    if (kandidat.length > 1) {
      return { error: "Nama siswa duplikat, pilih identitas unik." };
    }
    const siswa = kandidat[0];
    user = siswa && siswa.aktif && (await verifyPassword(password, siswa.password))
      ? siswa
      : null;
  }

  if (!user) return { error: GAGAL };

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  await setSessionCookie({ id: user.id, role: user.role });

  redirect(user.role === "GURU" ? "/guru/beranda" : "/siswa/beranda");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/");
}

export async function gantiPassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const user = await requireSessionUser();
  const lama = String(formData.get("lama") ?? "");
  const baru = String(formData.get("baru") ?? "");
  const ulang = String(formData.get("ulang") ?? "");
  const balik = String(formData.get("balik") ?? "");

  if (!lama || !baru || !ulang) {
    return { error: "Semua kolom wajib diisi." };
  }
  if (baru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }
  if (baru !== ulang) {
    return { error: "Konfirmasi password tidak sama." };
  }

  const lengkap = await prisma.user.findUnique({
    where: { id: user.id },
    select: { password: true, role: true },
  });
  if (!lengkap) redirect("/");

  const cocok = await verifyPassword(lama, lengkap.password);
  if (!cocok) return { error: "Password lama salah." };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hashPassword(baru),
      harusGantiPassword: false,
    },
  });

  const session = await getSession();
  if (!session) redirect("/");
  await setSessionCookie({ id: user.id, role: lengkap.role });

  const tujuan =
    balik.startsWith("/guru/") || balik.startsWith("/siswa/") ? balik : null;
  redirect(tujuan ?? (lengkap.role === "GURU" ? "/guru/beranda" : "/siswa/beranda"));
}
