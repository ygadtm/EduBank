import { getMapelRingkas } from "@/lib/cache";
import { prisma } from "@/lib/db";
import LatihanForm from "./latihan-form";

export default async function HalamanLatihanForm({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const [mapels, soal, paket] = await Promise.all([
    getMapelRingkas(),
    prisma.soal.findMany({
      where: { status: "TERBIT" },
      orderBy: [{ mapelId: "asc" }, { kelas: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        mapelId: true,
        kelas: true,
        topik: true,
        teks: true,
      },
    }),
    id
      ? prisma.paketLatihan.findUnique({
          where: { id },
          include: {
            soal: {
              orderBy: { urutan: "asc" },
              select: { soalId: true },
            },
            _count: { select: { latihan: true } },
          },
        })
      : null,
  ]);

  return (
    <LatihanForm
      mapels={mapels}
      soal={soal}
      paket={
        paket
          ? {
              id: paket.id,
              mapelId: paket.mapelId,
              kelas: paket.kelas,
              judul: paket.judul,
              deskripsi: paket.deskripsi ?? "",
              urutan: paket.urutan,
              durasiMenit: paket.durasiMenit,
              status: paket.status,
              soalIds: paket.soal.map((item) => item.soalId),
              terkunci: paket._count.latihan > 0,
            }
          : null
      }
    />
  );
}
