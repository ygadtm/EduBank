import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { getSession } from "./session";

const userSelect = {
  id: true,
  nama: true,
  nisNip: true,
  role: true,
  kelas: true,
  aktif: true,
  admin: true,
  harusGantiPassword: true,
} as const;

const loadUser = cache((id: string) =>
  prisma.user.findUnique({ where: { id }, select: userSelect }),
);

export async function requireSessionUser() {
  const session = await getSession();
  if (!session) redirect("/");

  const user = await loadUser(session.userId);

  if (!user || !user.aktif) redirect("/");
  return user;
}

export async function requireUser(role?: "SISWA" | "GURU") {
  const user = await requireSessionUser();

  if (role && user.role !== role) {
    redirect(user.role === "GURU" ? "/guru/beranda" : "/siswa/beranda");
  }

  if (user.role === "GURU" && user.harusGantiPassword) redirect("/ganti-password");
  return user;
}

export function requireGuru() {
  return requireUser("GURU");
}

export async function requireAdmin() {
  const user = await requireGuru();
  if (!user.admin) redirect("/guru/beranda");
  return user;
}

export function requireSiswa() {
  return requireUser("SISWA");
}
