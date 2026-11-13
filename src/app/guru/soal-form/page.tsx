import { prisma } from "@/lib/db";
import { requireGuru, getGuruScope } from "@/lib/auth";
import SoalForm from "./soal-form";

export default async function HalamanSoalForm({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; filter?: string }>;
}) {
  const user = await requireGuru();
  const scope = await getGuruScope(user);

  const { id, filter } = await searchParams;

  const mapels = await prisma.mapel.findMany({
    orderBy: { urutan: "asc" },
    select: { id: true, slug: true, nama: true },
    where: scope ? { id: { in: scope.mapelIds } } : undefined,
  });

  const soal = id
    ? await prisma.soal.findUnique({
        where: { id },
        include: { pilihan: { orderBy: { urutan: "asc" } } },
      })
    : null;

  return (
    <SoalForm
      mapels={mapels}
      kelasList={scope ? scope.kelasList : [5, 6]}
      filter={typeof filter === "string" ? filter : ""}
      soal={
        soal
          ? {
              id: soal.id,
              mapelId: soal.mapelId,
              kelas: soal.kelas,
              topik: soal.topik,
              teks: soal.teks,
              pembahasan: soal.pembahasan,
              status: soal.status,
              pilihan: soal.pilihan.map((p) => ({
                teks: p.teks,
                benar: p.benar,
              })),
            }
          : null
      }
    />
  );
}
