import { prisma } from "@/lib/db";
import { getMapelRingkas } from "@/lib/cache";
import { requireGuru, getGuruScope } from "@/lib/auth";
import LatihanClient from "./latihan-client";

export default async function KelolaLatihan() {
  const user = await requireGuru();
  const scope = await getGuruScope(user);

  const [mapels, pakets] = await Promise.all([
    scope
      ? prisma.mapel.findMany({
          where: { id: { in: scope.mapelIds } },
          orderBy: { urutan: "asc" },
          select: { id: true, slug: true, nama: true },
        })
      : getMapelRingkas(),
    prisma.paketLatihan.findMany({
      where: scope
        ? { mapelId: { in: scope.mapelIds }, kelas: { in: scope.kelasList } }
        : undefined,
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
