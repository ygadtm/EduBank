"use server";

import { revalidatePath } from "next/cache";
import { requireGuru } from "@/lib/auth";
import { prisma } from "@/lib/db";

type VideoState = { error?: string; ok?: boolean };

function validUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function bacaForm(formData: FormData) {
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  return {
    kelas: String(formData.get("kelas") ?? "").trim(),
    judul: String(formData.get("judul") ?? "").trim(),
    ringkasan: String(formData.get("ringkasan") ?? "").trim(),
    videoUrl: /^https?:\/\//.test(videoUrl)
      ? videoUrl
      : `https://${videoUrl}`,
  };
}

function validasi(data: ReturnType<typeof bacaForm>) {
  if (data.kelas !== "5" && data.kelas !== "6") return "Kelas harus 5 atau 6.";
  if (!data.judul) return "Judul materi wajib diisi.";
  if (!validUrl(data.videoUrl)) return "Link video harus URL http(s) yang valid.";
  return null;
}

export async function tambahVideo(
  _: VideoState,
  formData: FormData,
): Promise<VideoState> {
  await requireGuru();

  const mapelId = String(formData.get("mapelId") ?? "").trim();
  if (!mapelId) return { error: "Mata pelajaran wajib dipilih." };

  const mapel = await prisma.mapel.findUnique({
    where: { id: mapelId },
    select: { slug: true },
  });
  if (!mapel) return { error: "Mata pelajaran tidak ditemukan." };

  const data = bacaForm(formData);
  const error = validasi(data);
  if (error) return { error };

  await prisma.video.create({
    data: {
      mapelId,
      kelas: Number(data.kelas),
      judul: data.judul,
      ringkasan: data.ringkasan || null,
      videoUrl: data.videoUrl,
    },
  });

  revalidatePath("/guru/video");
  revalidatePath(`/guru/video/${mapel.slug}`);
  revalidatePath("/siswa/materi");
  return { ok: true };
}

export async function ubahVideo(
  id: string,
  _: VideoState,
  formData: FormData,
): Promise<VideoState> {
  await requireGuru();

  const lama = await prisma.video.findUnique({
    where: { id },
    select: { id: true, mapel: { select: { slug: true } } },
  });
  if (!lama) return { error: "Video tidak ditemukan." };

  const data = bacaForm(formData);
  const error = validasi(data);
  if (error) return { error };

  await prisma.video.update({
    where: { id },
    data: {
      kelas: Number(data.kelas),
      judul: data.judul,
      ringkasan: data.ringkasan || null,
      videoUrl: data.videoUrl,
    },
  });

  revalidatePath("/guru/video");
  revalidatePath(`/guru/video/${lama.mapel.slug}`);
  revalidatePath("/siswa/materi");
  return { ok: true };
}

export async function hapusVideo(id: string) {
  await requireGuru();

  const lama = await prisma.video.findUnique({
    where: { id },
    select: { id: true, mapel: { select: { slug: true } } },
  });
  if (!lama) return { error: "Video tidak ditemukan." };

  await prisma.video.delete({ where: { id } });

  revalidatePath("/guru/video");
  revalidatePath(`/guru/video/${lama.mapel.slug}`);
  revalidatePath("/siswa/materi");
  return { ok: true };
}
