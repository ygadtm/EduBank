import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [mapel, soal, pilihan, user, guru] = await Promise.all([
    prisma.mapel.count(),
    prisma.soal.count(),
    prisma.pilihan.count(),
    prisma.user.count(),
    prisma.user.count({ where: { role: "GURU" } }),
  ]);

  if (mapel < 6) throw new Error(`mapel=${mapel}, minimal 6`);
  if (soal < 36) throw new Error(`soal=${soal}, minimal 36`);
  if (pilihan < 144) throw new Error(`pilihan=${pilihan}, minimal 144`);
  if (user < 7) throw new Error(`user=${user}, minimal 7`);
  if (guru < 1) throw new Error(`guru=${guru}, minimal 1`);

  const semuaSoal = await prisma.soal.findMany({
    include: { pilihan: true },
  });
  for (const s of semuaSoal) {
    const benar = s.pilihan.filter((p) => p.benar).length;
    if (benar !== 1) throw new Error(`soal ${s.id} punya ${benar} kunci`);
  }

  const [jumlahPaket, jumlahAnggota] = await Promise.all([
    prisma.paketLatihan.count(),
    prisma.paketLatihanSoal.count(),
  ]);
  if (jumlahPaket < 10) throw new Error(`paket=${jumlahPaket}, minimal 10`);
  if (jumlahAnggota < 36) throw new Error(`anggota paket=${jumlahAnggota}, minimal 36`);

  // setiap Latihan harus punya paketId
  const latihanTanpaPaket = await prisma.latihan.count({
    where: { paketId: null },
  });
  if (latihanTanpaPaket > 0)
    throw new Error(`${latihanTanpaPaket} latihan tidak punya paketId`);

  // setiap PaketLatihan harus punya minimal 1 soal
  const paketKosong = await prisma.paketLatihan.findMany({
    where: { soal: { none: {} } },
    select: { id: true, judul: true },
  });
  if (paketKosong.length > 0)
    throw new Error(
      `Paket tanpa soal: ${paketKosong.map((p) => p.judul).join(", ")}`,
    );

  console.log(
    `Database OK: ${mapel} mapel, ${soal} soal, ${pilihan} pilihan, ${user} user (${guru} guru), ${jumlahPaket} paket, ${jumlahAnggota} anggota paket.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
