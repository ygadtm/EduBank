import {
  PrismaClient,
  Role,
  StatusPaketLatihan,
  StatusSoal,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { GURU, MAPEL, SISWA, SOAL } from "./seed-data";

const prisma = new PrismaClient();

const hash = (value: string) => bcrypt.hash(value, 10);
const soalId = (slug: string, kelas: number, index: number) =>
  `soal_${slug}_${kelas}_${index}`;

async function main() {
  const mapelBySlug = new Map<string, { id: string }>();

  for (const m of MAPEL) {
    const mapel = await prisma.mapel.upsert({
      where: { slug: m.slug },
      create: m,
      update: {
        nama: m.nama,
        deskripsi: m.deskripsi,
        urutan: m.urutan,
      },
    });
    mapelBySlug.set(m.slug, mapel);
  }

  for (const s of SOAL) {
    const mapel = mapelBySlug.get(s.mapelSlug);
    if (!mapel) throw new Error(`Mapel tidak ditemukan: ${s.mapelSlug}`);

    for (const kelas of [5, 6]) {
      const id = soalId(s.mapelSlug, kelas, SOAL.indexOf(s));
      await prisma.$transaction(async (tx) => {
        await tx.soal.upsert({
          where: { id },
          create: {
            id,
            mapelId: mapel.id,
            kelas,
            teks: s.teks,
            pembahasan: s.pembahasan,
            status: StatusSoal.TERBIT,
          },
          update: {
            mapelId: mapel.id,
            kelas,
            teks: s.teks,
            pembahasan: s.pembahasan,
            status: StatusSoal.TERBIT,
          },
        });

        await tx.pilihan.deleteMany({ where: { soalId: id } });
        await tx.pilihan.createMany({
          data: s.pilihan.map((teks, urutan) => ({
            id: `pilihan_${id}_${urutan}`,
            soalId: id,
            teks,
            urutan,
            benar: urutan === s.benar,
          })),
        });
      }, { timeout: 30000 });
    }
  }

  for (const mapel of mapelBySlug.values()) {
    for (const kelas of [5, 6]) {
      const soalTerbit = await prisma.soal.findMany({
        where: {
          mapelId: mapel.id,
          kelas,
          status: StatusSoal.TERBIT,
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        select: { id: true },
      });
      if (soalTerbit.length === 0) continue;

      const paket = await prisma.paketLatihan.upsert({
        where: {
          mapelId_kelas_judul: {
            mapelId: mapel.id,
            kelas,
            judul: "Latihan Soal 1",
          },
        },
        create: {
          mapelId: mapel.id,
          kelas,
          judul: "Latihan Soal 1",
          urutan: 0,
          durasiMenit: 5,
          status: StatusPaketLatihan.TERBIT,
        },
        update: {
          urutan: 0,
          durasiMenit: 5,
          status: StatusPaketLatihan.TERBIT,
        },
      });

      await prisma.paketLatihanSoal.deleteMany({
        where: { paketId: paket.id },
      });
      await prisma.paketLatihanSoal.createMany({
        data: soalTerbit.map((s, urutan) => ({
          paketId: paket.id,
          soalId: s.id,
          urutan,
        })),
      });
    }
  }

  const passwordSiswa = await Promise.all(SISWA.map((s) => hash(s.nisNip.slice(-4))));
  for (const [index, s] of SISWA.entries()) {
    await prisma.user.upsert({
      where: { nisNip: s.nisNip },
      create: {
        nama: s.nama,
        nisNip: s.nisNip,
        password: passwordSiswa[index],
        role: Role.SISWA,
        kelas: s.kelas,
        aktif: true,
        harusGantiPassword: false,
      },
      update: {
        nama: s.nama,
        role: Role.SISWA,
        kelas: s.kelas,
        aktif: true,
        harusGantiPassword: false,
      },
    });
  }

  const passwordGuru = await Promise.all(GURU.map((g) => hash(g.nisNip)));
  for (const [index, g] of GURU.entries()) {
    await prisma.user.upsert({
      where: { nisNip: g.nisNip },
      create: {
        nama: g.nama,
        nisNip: g.nisNip,
        password: passwordGuru[index],
        role: Role.GURU,
        aktif: true,
        admin: g.admin,
        harusGantiPassword: true,
      },
      update: {
        nama: g.nama,
        role: Role.GURU,
        aktif: true,
        admin: g.admin,
      },
    });
  }

  const mapelKelas = ["bahasa-indonesia", "ipa", "matematika", "ips", "ppkn", "bahasa-inggris"];
  const fauziahNisNip = "197109011998032003";
  const deviNisNip = "198409092025212080";

  const [fauziahUser, deviUser] = await Promise.all([
    prisma.user.findUnique({ where: { nisNip: fauziahNisNip }, select: { id: true } }),
    prisma.user.findUnique({ where: { nisNip: deviNisNip }, select: { id: true } }),
  ]);

  if (fauziahUser) {
    for (const slug of mapelKelas) {
      const mapel = mapelBySlug.get(slug);
      if (!mapel) continue;
      await prisma.guruMapel.upsert({
        where: { guruId_mapelId_kelas: { guruId: fauziahUser.id, mapelId: mapel.id, kelas: 5 } },
        create: { guruId: fauziahUser.id, mapelId: mapel.id, kelas: 5 },
        update: {},
      });
    }
  }

  if (deviUser) {
    for (const slug of mapelKelas) {
      const mapel = mapelBySlug.get(slug);
      if (!mapel) continue;
      await prisma.guruMapel.upsert({
        where: { guruId_mapelId_kelas: { guruId: deviUser.id, mapelId: mapel.id, kelas: 6 } },
        create: { guruId: deviUser.id, mapelId: mapel.id, kelas: 6 },
        update: {},
      });
    }
  }

  const [jumlahMapel, jumlahSoal, jumlahPilihan, jumlahUser] =
    await Promise.all([
      prisma.mapel.count(),
      prisma.soal.count(),
      prisma.pilihan.count(),
      prisma.user.count(),
    ]);

  if (jumlahMapel < 8) throw new Error(`Jumlah mapel kurang: ${jumlahMapel}`);
  if (jumlahSoal < 36) throw new Error(`Jumlah soal kurang: ${jumlahSoal}`);
  if (jumlahPilihan < 144)
    throw new Error(`Jumlah pilihan kurang: ${jumlahPilihan}`);
  if (jumlahUser < 17) throw new Error(`Jumlah user kurang: ${jumlahUser}`);

  const semuaSoal = await prisma.soal.findMany({
    include: { pilihan: true },
  });
  for (const s of semuaSoal) {
    const benar = s.pilihan.filter((p) => p.benar).length;
    if (benar !== 1) {
      throw new Error(`Soal ${s.id} punya ${benar} pilihan benar.`);
    }
  }

  console.log(
    `Seed selesai: ${jumlahMapel} mapel, ${jumlahSoal} soal, ${jumlahPilihan} pilihan, ${jumlahUser} user.`,
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
