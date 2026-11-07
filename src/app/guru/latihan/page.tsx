import { prisma } from "@/lib/db";
import { getMapelRingkas } from "@/lib/cache";
import LatihanClient from "./latihan-client";

export default async function KelolaLatihan() {
  const [mapels, pakets] = await Promise.all([
    getMapelRingkas(),
    prisma.paketLatihan.findMany({
      orderBy: [{ kelas: "asc" }, { urutan: "asc" }, { judul: "asc" }],
      include: {
        mapel: { select: { slug: true, nama: true } },
        soal: {
          orderBy: { urutan: "asc" },
          select: {
            soalId: true,
            soal: {
              select: {
                id: true,
                teks: true,
                topik: true,
                pembahasan: true,
                pilihan: {
                  orderBy: { urutan: "asc" },
                  select: { id: true, teks: true, benar: true, urutan: true },
                },
              },
            },
          },
        },
        _count: { select: { latihan: true } },
      },
    }),
  ]);

  return <LatihanClient mapels={mapels} pakets={pakets} />;
}
