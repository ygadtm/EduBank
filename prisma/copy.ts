import { PrismaClient } from "@prisma/client";

const oldUrl = process.env.OLD_DATABASE_URL;
const newUrl = process.env.NEW_DATABASE_URL;

if (!oldUrl || !newUrl) {
  throw new Error(
    "Set OLD_DATABASE_URL dan NEW_DATABASE_URL (session pooler port 5432).",
  );
}
if (oldUrl === newUrl) {
  throw new Error("OLD_DATABASE_URL dan NEW_DATABASE_URL tidak boleh sama.");
}

const oldDb = new PrismaClient({ datasourceUrl: oldUrl });
const newDb = new PrismaClient({ datasourceUrl: newUrl });

async function counts(db: PrismaClient) {
  const [user, mapel, soal, pilihan, latihan, jawaban] = await Promise.all([
    db.user.count(),
    db.mapel.count(),
    db.soal.count(),
    db.pilihan.count(),
    db.latihan.count(),
    db.jawaban.count(),
  ]);
  return { user, mapel, soal, pilihan, latihan, jawaban };
}

async function main() {
  const target = await counts(newDb);
  if (Object.values(target).some((n) => n > 0)) {
    throw new Error(
      `Database tujuan sudah berisi data: ${JSON.stringify(target)}. ` +
        "Gunakan project Supabase baru yang masih kosong.",
    );
  }

  const [users, mapels, soals, pilihans, latihans, jawabans] =
    await Promise.all([
      oldDb.user.findMany(),
      oldDb.mapel.findMany(),
      oldDb.soal.findMany(),
      oldDb.pilihan.findMany(),
      oldDb.latihan.findMany(),
      oldDb.jawaban.findMany(),
    ]);

  await newDb.$transaction([
    newDb.user.createMany({ data: users }),
    newDb.mapel.createMany({ data: mapels }),
    newDb.soal.createMany({ data: soals }),
    newDb.pilihan.createMany({ data: pilihans }),
    newDb.latihan.createMany({ data: latihans }),
    newDb.jawaban.createMany({ data: jawabans }),
  ]);

  const source = await counts(oldDb);
  const result = await counts(newDb);
  const sourceValues = Object.values(source);
  const resultValues = Object.values(result);
  if (sourceValues.some((n, i) => n !== resultValues[i])) {
    throw new Error(
      `Jumlah data tidak sama. Sumber ${JSON.stringify(source)}, ` +
        `tujuan ${JSON.stringify(result)}.`,
    );
  }

  console.log(`Migrasi selesai: ${JSON.stringify(result)}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await oldDb.$disconnect();
    await newDb.$disconnect();
  });
