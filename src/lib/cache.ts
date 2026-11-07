import { unstable_cache } from "next/cache";
import { prisma } from "./db";

export const getMapelRingkas = unstable_cache(
  async () =>
    prisma.mapel.findMany({
      orderBy: { urutan: "asc" },
      select: { id: true, slug: true, nama: true },
    }),
  ["mapel-ringkas"],
  { revalidate: 300, tags: ["mapel"] },
);

export const getMapelDenganJumlah = unstable_cache(
  async (kelas: number) =>
    prisma.mapel.findMany({
      orderBy: { urutan: "asc" },
      select: {
        id: true,
        slug: true,
        nama: true,
        deskripsi: true,
        _count: {
          select: {
            soal: { where: { kelas, status: "TERBIT" } },
          },
        },
      },
    }),
  ["mapel-jumlah"],
  { revalidate: 30, tags: ["mapel", "soal"] },
);

export const getStatistikGuru = unstable_cache(
  async () => {
    const [totalSoal, totalSiswa, totalJawaban, totalBenar, mapels, jawabanMapel] =
      await Promise.all([
        prisma.soal.count(),
        prisma.user.count({ where: { role: "SISWA", aktif: true } }),
        prisma.jawaban.count(),
        prisma.jawaban.count({ where: { benar: true } }),
        prisma.mapel.findMany({ orderBy: { urutan: "asc" } }),
        prisma.jawaban.findMany({
          select: { benar: true, soal: { select: { mapelId: true } } },
        }),
      ]);

    const perMapel = new Map<string, { benar: number; total: number }>();
    for (const j of jawabanMapel) {
      const item = perMapel.get(j.soal.mapelId) ?? { benar: 0, total: 0 };
      item.total += 1;
      if (j.benar) item.benar += 1;
      perMapel.set(j.soal.mapelId, item);
    }

    return {
      totalSoal,
      totalSiswa,
      totalJawaban,
      totalBenar,
      mapels: mapels.map((m) => ({ id: m.id, slug: m.slug, nama: m.nama })),
      perMapel: Object.fromEntries(perMapel),
    };
  },
  ["statistik-guru"],
  { revalidate: 30, tags: ["soal", "siswa", "jawaban"] },
);
