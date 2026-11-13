import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireGuru, getGuruScope } from "@/lib/auth";
import LatihanClient from "../latihan-client";

export default async function KelolaLatihanMapel({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireGuru();
  const scope = await getGuruScope(user);

  const mapel = await prisma.mapel.findUnique({
    where: { slug },
    select: { id: true, slug: true, nama: true, deskripsi: true },
  });

  if (!mapel) notFound();
  if (scope && !scope.mapelIds.includes(mapel.id)) notFound();

  const [mapels, pakets] = await Promise.all([
    prisma.mapel.findMany({
      where: scope ? { id: { in: scope.mapelIds } } : undefined,
      orderBy: { urutan: "asc" },
      select: { id: true, slug: true, nama: true },
    }),
    prisma.paketLatihan.findMany({
      where: {
        mapelId: mapel.id,
        ...(scope ? { kelas: { in: scope.kelasList } } : {}),
      },
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

  return <LatihanClient mapel={mapel} mapels={mapels} pakets={pakets} />;
}
