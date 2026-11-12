import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SOURCE_SLUG = "ips";
const TARGET_SLUG = "ipa";
const TARGET_NAMA = "IPAS (Ilmu Pengetahuan Alam dan Sosial)";
const apply = process.argv.includes("--apply");

async function main() {
  const [target, source] = await Promise.all([
    prisma.mapel.findUnique({ where: { slug: TARGET_SLUG } }),
    prisma.mapel.findUnique({ where: { slug: SOURCE_SLUG } }),
  ]);

  if (!target) {
    throw new Error(`Mapel target "${TARGET_SLUG}" tidak ditemukan.`);
  }

  if (!source) {
    console.log(`Mapel "${SOURCE_SLUG}" sudah tidak ada. Tidak ada data yang digabung.`);
    if (target.nama !== TARGET_NAMA) {
      console.log(`Nama "${TARGET_SLUG}": "${target.nama}" -> "${TARGET_NAMA}"`);
      if (apply) {
        await prisma.mapel.update({
          where: { id: target.id },
          data: { nama: TARGET_NAMA },
        });
        console.log("Nama mapel diperbarui.");
      }
    }
    return;
  }

  const [jumlahSoal, jumlahVideo, jumlahLatihan, jumlahGuru, paketSumber] =
    await Promise.all([
      prisma.soal.count({ where: { mapelId: source.id } }),
      prisma.video.count({ where: { mapelId: source.id } }),
      prisma.latihan.count({ where: { mapelId: source.id } }),
      prisma.guruMapel.count({ where: { mapelId: source.id } }),
      prisma.paketLatihan.findMany({
        where: { mapelId: source.id },
        orderBy: [{ kelas: "asc" }, { urutan: "asc" }],
        include: { soal: { select: { soalId: true, urutan: true } } },
      }),
    ]);

  console.log("=== Rencana penggabungan mapel ===");
  console.log(`Sumber : ${source.slug} (${source.nama})`);
  console.log(`Target : ${target.slug} (${target.nama}) -> "${TARGET_NAMA}"`);
  console.log(`Soal   : ${jumlahSoal}`);
  console.log(`Video  : ${jumlahVideo}`);
  console.log(`Latihan: ${jumlahLatihan}`);
  console.log(`Guru   : ${jumlahGuru} assignment`);
  console.log(`Paket  : ${paketSumber.length}`);

  const rencanaPaket: {
    paketId: string;
    aksi: "gabung" | "pindah";
    targetId?: string;
    jumlahSoal: number;
  }[] = [];

  for (const paket of paketSumber) {
    const existing = await prisma.paketLatihan.findUnique({
      where: {
        mapelId_kelas_judul: {
          mapelId: target.id,
          kelas: paket.kelas,
          judul: paket.judul,
        },
      },
      select: { id: true, soal: { select: { soalId: true, urutan: true } } },
    });

    if (existing) {
      const sudahAda = new Set(existing.soal.map((s) => s.soalId));
      const baru = paket.soal.filter((s) => !sudahAda.has(s.soalId));
      rencanaPaket.push({
        paketId: paket.id,
        aksi: "gabung",
        targetId: existing.id,
        jumlahSoal: baru.length,
      });
      console.log(
        `  - kelas ${paket.kelas} "${paket.judul}": gabung ${baru.length} soal ke paket target`,
      );
    } else {
      rencanaPaket.push({
        paketId: paket.id,
        aksi: "pindah",
        jumlahSoal: paket.soal.length,
      });
      console.log(
        `  - kelas ${paket.kelas} "${paket.judul}": pindahkan paket (${paket.soal.length} soal)`,
      );
    }
  }

  if (!apply) {
    console.log("\nDry-run. Jalankan dengan --apply untuk menerapkan.");
    return;
  }

  await prisma.$transaction(
    async (tx) => {
      await tx.soal.updateMany({
        where: { mapelId: source.id },
        data: { mapelId: target.id },
      });
      await tx.video.updateMany({
        where: { mapelId: source.id },
        data: { mapelId: target.id },
      });
      await tx.latihan.updateMany({
        where: { mapelId: source.id },
        data: { mapelId: target.id },
      });

      for (const paket of paketSumber) {
        const existing = await tx.paketLatihan.findUnique({
          where: {
            mapelId_kelas_judul: {
              mapelId: target.id,
              kelas: paket.kelas,
              judul: paket.judul,
            },
          },
          select: {
            id: true,
            soal: { select: { soalId: true, urutan: true } },
          },
        });

        if (existing) {
          const sudahAda = new Set(existing.soal.map((s) => s.soalId));
          const baru = paket.soal.filter((s) => !sudahAda.has(s.soalId));
          const maxUrutan = existing.soal.reduce(
            (max, s) => Math.max(max, s.urutan),
            -1,
          );
          if (baru.length > 0) {
            await tx.paketLatihanSoal.createMany({
              data: baru.map((s, index) => ({
                paketId: existing.id,
                soalId: s.soalId,
                urutan: maxUrutan + 1 + index,
              })),
            });
          }
          await tx.paketLatihan.delete({ where: { id: paket.id } });
        } else {
          await tx.paketLatihan.update({
            where: { id: paket.id },
            data: { mapelId: target.id },
          });
        }
      }

      const assignments = await tx.guruMapel.findMany({
        where: { mapelId: source.id },
      });
      for (const row of assignments) {
        await tx.guruMapel.upsert({
          where: {
            guruId_mapelId_kelas: {
              guruId: row.guruId,
              mapelId: target.id,
              kelas: row.kelas,
            },
          },
          create: {
            guruId: row.guruId,
            mapelId: target.id,
            kelas: row.kelas,
          },
          update: {},
        });
      }
      await tx.guruMapel.deleteMany({ where: { mapelId: source.id } });

      await tx.mapel.update({
        where: { id: target.id },
        data: { nama: TARGET_NAMA },
      });
      await tx.mapel.delete({ where: { id: source.id } });
    },
    { timeout: 60000 },
  );

  console.log("\nSelesai. Mapel IPS sudah digabung ke IPAS dan dihapus.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
