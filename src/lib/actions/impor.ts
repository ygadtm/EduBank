"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getGuruScope, requireGuru } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buatSignedUpload } from "@/lib/impor";
import {
  EKSTENSI_IMPOR,
  MAX_FILE_BYTES,
  MAX_SOAL_IMPOR,
  MIME_IMPOR,
  ekstensiFile,
  normalisasiDraft,
  validasiDraft,
  type ImporPayload,
} from "@/lib/impor-types";

export async function buatUploadUrl(input: {
  nama: string;
  ukuran: number;
  mime: string;
}): Promise<{ path: string; signedUrl: string } | { error: string }> {
  const user = await requireGuru();

  const ukuran = Number(input.ukuran);
  const mime = String(input.mime ?? "").toLowerCase();
  const ext = ekstensiFile(input.nama ?? "");

  if (!Number.isInteger(ukuran) || ukuran <= 0) {
    return { error: "File tidak valid." };
  }
  if (ukuran > MAX_FILE_BYTES) {
    return { error: "Ukuran file maksimal 10 MB." };
  }
  if (!EKSTENSI_IMPOR.includes(ext)) {
    return { error: "Format file harus JPG, PNG, PDF, XLSX, atau XLS." };
  }
  if (mime && !MIME_IMPOR.includes(mime)) {
    return { error: "Tipe file tidak didukung." };
  }

  try {
    const path = `imports/${user.id}/${randomUUID()}.${ext}`;
    const signedUrl = await buatSignedUpload(path);
    return { path, signedUrl };
  } catch {
    return { error: "Gagal menyiapkan unggahan file. Coba lagi." };
  }
}

export async function imporSoal(
  payload: ImporPayload,
): Promise<{ error: string }> {
  const user = await requireGuru();

  const mapelId = String(payload?.mapelId ?? "");
  const kelas = Number(payload?.kelas);
  const topik = String(payload?.topik ?? "").trim().slice(0, 200) || null;
  const status = payload?.status === "TERBIT" ? "TERBIT" : "DRAF";
  const daftar = Array.isArray(payload?.soal) ? payload.soal : [];

  if (!mapelId) return { error: "Mapel wajib dipilih." };
  if (kelas !== 5 && kelas !== 6) return { error: "Kelas tidak valid." };
  if (daftar.length === 0) return { error: "Pilih minimal satu soal." };
  if (daftar.length > MAX_SOAL_IMPOR) {
    return { error: `Maksimal ${MAX_SOAL_IMPOR} soal per impor.` };
  }

  const scope = await getGuruScope(user);
  if (scope) {
    if (!scope.mapelIds.includes(mapelId)) {
      return { error: "Mapel tidak sesuai dengan akses Anda." };
    }
    if (!scope.kelasList.includes(kelas)) {
      return { error: "Kelas tidak sesuai dengan akses Anda." };
    }
  }

  const mapel = await prisma.mapel.findUnique({ where: { id: mapelId } });
  if (!mapel) return { error: "Mapel tidak ditemukan." };

  const siap: { teks: string; topik: string | null; pembahasan: string | null; pilihan: string[]; kunci: number }[] = [];

  for (let i = 0; i < daftar.length; i += 1) {
    const draft = normalisasiDraft(daftar[i]);
    const salah = validasiDraft(draft);
    if (salah) return { error: `Soal ${i + 1}: ${salah}` };
    siap.push({
      teks: draft.teks,
      topik: draft.topik || topik,
      pembahasan: draft.pembahasan || null,
      pilihan: draft.pilihan,
      kunci: draft.kunci as number,
    });
  }

  await prisma.$transaction(
    siap.map((item) =>
      prisma.soal.create({
        data: {
          mapelId,
          kelas,
          teks: item.teks,
          topik: item.topik,
          pembahasan: item.pembahasan,
          status,
          pilihan: {
            create: item.pilihan.map((teks, urutan) => ({
              teks,
              urutan,
              benar: urutan === item.kunci,
            })),
          },
        },
      }),
    ),
  );

  revalidatePath("/guru/soal");
  revalidatePath("/guru/beranda");
  revalidateTag("soal");
  revalidateTag("mapel");
  redirect("/guru/soal");
}
