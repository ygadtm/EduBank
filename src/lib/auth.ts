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
  lastLoginAt: true,
  createdAt: true,
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

export async function requireGuruApi() {
  const session = await getSession();
  if (!session || session.role !== "GURU") return null;
  const user = await loadUser(session.userId);
  if (!user || !user.aktif || user.role !== "GURU") return null;
  return user;
}

export async function requireAdmin() {
  const user = await requireGuru();
  if (!user.admin) redirect("/guru/beranda");
  return user;
}

export function requireSiswa() {
  return requireUser("SISWA");
}

export type GuruScope = { mapelIds: string[]; kelasList: number[] } | null;

export async function getGuruScope(user: { id: string; admin: boolean }): Promise<GuruScope> {
  if (user.admin) return null;
  const rows = await prisma.guruMapel.findMany({
    where: { guruId: user.id },
    select: { mapelId: true, kelas: true },
  });
  if (rows.length === 0) return { mapelIds: [], kelasList: [] };
  return {
    mapelIds: [...new Set(rows.map((r) => r.mapelId))],
    kelasList: [...new Set(rows.map((r) => r.kelas))],
  };
}
