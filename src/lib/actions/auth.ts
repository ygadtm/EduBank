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

const GAGAL = "NIS/NIP atau password salah.";

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const nisNip = String(formData.get("nisNip") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = formData.get("role") === "GURU" ? "GURU" : "SISWA";

  if (!nisNip || !password) {
    return { error: "NIS/NIP dan password wajib diisi." };
  }

  const user = await prisma.user.findUnique({ where: { nisNip } });
  if (!user || !user.aktif || user.role !== role) {
    return { error: GAGAL };
  }

  const cocok = await verifyPassword(password, user.password);
  if (!cocok) return { error: GAGAL };

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  await setSessionCookie({ id: user.id, role: user.role });

  if (user.harusGantiPassword) redirect("/ganti-password");
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

  redirect(lengkap.role === "GURU" ? "/guru/beranda" : "/siswa/beranda");
}
