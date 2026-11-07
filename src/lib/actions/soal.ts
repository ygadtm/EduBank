"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireGuru } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type SoalFormState = { error: string };

function teks(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function simpanSoal(
  _prev: SoalFormState,
  formData: FormData,
): Promise<SoalFormState> {
  await requireGuru();

  const id = teks(formData, "id");
  const mapelId = teks(formData, "mapelId");
  const kelas = Number(formData.get("kelas"));
  const topik = teks(formData, "topik") || null;
  const teksSoal = teks(formData, "teks");
  const pembahasan = teks(formData, "pembahasan") || null;
  const status = formData.get("status") === "TERBIT" ? "TERBIT" : "DRAF";
  const kunci = Number(formData.get("kunci"));
  const pilihan = formData
    .getAll("pilihan")
    .map((item) => String(item).trim());

  if (!mapelId) return { error: "Mapel wajib dipilih." };
  if (kelas !== 5 && kelas !== 6) return { error: "Kelas tidak valid." };
  if (!teksSoal) return { error: "Pertanyaan wajib diisi." };
  if (pilihan.length !== 4 || pilihan.some((item) => !item)) {
    return { error: "Isi keempat pilihan jawaban." };
  }
  if (!Number.isInteger(kunci) || kunci < 0 || kunci >= pilihan.length) {
    return { error: "Pilih satu kunci jawaban." };
  }

  const mapel = await prisma.mapel.findUnique({ where: { id: mapelId } });
  if (!mapel) return { error: "Mapel tidak ditemukan." };

  if (id) {
    const lama = await prisma.soal.findUnique({
      where: { id },
      select: {
        mapelId: true,
        kelas: true,
        _count: { select: { jawaban: true } },
      },
    });
    if (!lama) return { error: "Soal tidak ditemukan." };

    if (lama._count.jawaban > 0) {
      if (lama.mapelId !== mapelId || lama.kelas !== kelas) {
        return {
          error:
            "Soal sudah dikerjakan siswa. Mapel dan kelas tidak boleh diubah.",
        };
      }
      await prisma.soal.update({
        where: { id },
        data: { teks: teksSoal, topik, pembahasan, status },
      });
    } else {
      await prisma.$transaction(async (tx) => {
        await tx.soal.update({
          where: { id },
          data: {
            mapelId,
            kelas,
            teks: teksSoal,
            topik,
            pembahasan,
            status,
          },
        });
        await tx.pilihan.deleteMany({ where: { soalId: id } });
        await tx.pilihan.createMany({
          data: pilihan.map((teks, urutan) => ({
            soalId: id,
            teks,
            urutan,
            benar: urutan === kunci,
          })),
        });
      });
    }
  } else {
    await prisma.soal.create({
      data: {
        mapelId,
        kelas,
        teks: teksSoal,
        topik,
        pembahasan,
        status,
        pilihan: {
          create: pilihan.map((teks, urutan) => ({
            teks,
            urutan,
            benar: urutan === kunci,
          })),
        },
      },
    });
  }

  revalidatePath("/guru/soal");
  revalidatePath("/guru/beranda");
  revalidateTag("soal");
  revalidateTag("mapel");
  redirect("/guru/soal");
}

export async function hapusSoal(id: string) {
  await requireGuru();
  try {
    await prisma.soal.delete({ where: { id } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return { error: "Soal sudah dikerjakan siswa dan tidak bisa dihapus." };
    }
    return { error: "Soal gagal dihapus." };
  }

  revalidatePath("/guru/soal");
  revalidatePath("/guru/beranda");
  revalidateTag("soal");
  revalidateTag("mapel");
  return { ok: true };
}
