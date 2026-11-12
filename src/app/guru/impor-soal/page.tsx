import { getGuruScope, requireGuru } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ImporSoalClient from "./impor-soal-client";

export default async function HalamanImporSoal() {
  const user = await requireGuru();
  const scope = await getGuruScope(user);

  const mapels = await prisma.mapel.findMany({
    orderBy: { urutan: "asc" },
    select: { id: true, nama: true },
    where: scope ? { id: { in: scope.mapelIds } } : undefined,
  });

  return (
    <ImporSoalClient
      mapels={mapels}
      kelasList={scope ? scope.kelasList : [5, 6]}
    />
  );
}
