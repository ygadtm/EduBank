import {
  PrismaClient,
  Role,
  StatusPaketLatihan,
  StatusSoal,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { MAPEL, SISWA, SOAL } from "./seed-data";

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
      });
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

  const passwordSiswa = await Promise.all(SISWA.map((s) => hash(s.nisNip)));
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
        harusGantiPassword: true,
      },
      update: {
        nama: s.nama,
        role: Role.SISWA,
        kelas: s.kelas,
        aktif: true,
      },
    });
  }

  const guruNip = process.env.GURU_INIT_NIP?.trim();
  const guruNama = process.env.GURU_INIT_NAMA?.trim();
  const guruPassword = process.env.GURU_INIT_PASSWORD;
  if (!guruNip || !guruNama || !guruPassword) {
    throw new Error(
      "GURU_INIT_NIP, GURU_INIT_NAMA, dan GURU_INIT_PASSWORD wajib diisi.",
    );
  }

  await prisma.user.upsert({
    where: { nisNip: guruNip },
    create: {
      nama: guruNama,
      nisNip: guruNip,
      password: await hash(guruPassword),
      role: Role.GURU,
      aktif: true,
      harusGantiPassword: true,
    },
    update: {
      nama: guruNama,
      role: Role.GURU,
      aktif: true,
    },
  });

  const [jumlahMapel, jumlahSoal, jumlahPilihan, jumlahUser] =
    await Promise.all([
      prisma.mapel.count(),
      prisma.soal.count(),
      prisma.pilihan.count(),
      prisma.user.count(),
    ]);

  if (jumlahMapel < 6) throw new Error(`Jumlah mapel kurang: ${jumlahMapel}`);
  if (jumlahSoal < 36) throw new Error(`Jumlah soal kurang: ${jumlahSoal}`);
  if (jumlahPilihan < 144)
    throw new Error(`Jumlah pilihan kurang: ${jumlahPilihan}`);
  if (jumlahUser < 7) throw new Error(`Jumlah user kurang: ${jumlahUser}`);

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
