import { prisma } from "@/lib/db";
import { getMapelRingkas } from "@/lib/cache";
import SoalForm from "./soal-form";

export default async function HalamanSoalForm({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const mapels = await getMapelRingkas();
  const soal = id
    ? await prisma.soal.findUnique({
        where: { id },
        include: { pilihan: { orderBy: { urutan: "asc" } } },
      })
    : null;

  return (
    <SoalForm
      mapels={mapels}
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
