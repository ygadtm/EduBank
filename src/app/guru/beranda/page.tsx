import Link from "next/link";
import { requireGuru } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStatistikGuru } from "@/lib/cache";
import { mapelMeta } from "@/lib/mapel";
import {
  Bar,
  MapelBadge,
  Stat,
  StatusBadge,
  Tabel,
  card,
} from "@/components/ui";

const aksi = [
  ["/guru/soal-form", "Buat Soal Baru"],
  ["/guru/siswa", "Data Siswa"],
  ["/guru/rekap", "Lihat Rekap Nilai"],
];

export default async function BerandaGuru() {
  const user = await requireGuru();
  const tgl = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const { totalSoal, totalSiswa, totalJawaban, totalBenar, mapels, perMapel } =
    await getStatistikGuru();
  const soalTerbaru = await prisma.soal.findMany({
    take: 5,
    orderBy: { updatedAt: "desc" },
    include: { mapel: true },
  });

  const rata = totalJawaban
    ? Math.round((totalBenar / totalJawaban) * 100)
    : 0;

  const rows = soalTerbaru.map((s) => {
    const meta = mapelMeta(s.mapel.slug);
    return [
      s.teks,
      <MapelBadge key="m" nama={s.mapel.nama} color={meta.color} bg={meta.bg} />,
      `Kelas ${s.kelas}`,
      <StatusBadge key="s" s={s.status === "TERBIT" ? "Terbit" : "Draf"} />,
      s.updatedAt.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    ];
  });

  return (
    <>
      <p className="text-xs text-muted">{tgl}</p>
      <h1 className="text-3xl font-extrabold">Halo, {user.nama}!</h1>
      <p className="text-sm text-muted">
        Kelola soal dan pantau perkembangan belajar siswa.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Total Soal" value={totalSoal} unit="Soal" />
        <Stat label="Jumlah Siswa" value={totalSiswa} unit="Siswa" />
        <Stat label="Rata-rata Nilai" value={rata} unit="Poin" />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {aksi.map(([href, teks]) => (
          <Link
            key={href}
            href={href}
            className={`${card} flex items-center justify-between p-4 font-bold hover:bg-accent/5 hover:ring-2 hover:ring-accent/30`}
          >
            {teks}
            <span className="text-accent">→</span>
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <section className={`${card} xl:col-span-2`}>
          <div className="flex items-center justify-between p-5">
            <h2 className="font-bold">Soal Terbaru</h2>
            <Link href="/guru/soal" className="text-sm font-bold text-accent">
              Lihat Semua →
            </Link>
          </div>
          <Tabel
            head={["Soal", "Mapel", "Kelas", "Status", "Diperbarui"]}
            rows={rows}
          />
        </section>
        <section className={`${card} p-5`}>
          <h2 className="font-bold">Rata-rata Nilai per Mapel</h2>
          <div className="mt-4 space-y-3">
            {mapels.map((s) => {
              const meta = mapelMeta(s.slug);
              const data = perMapel[s.id];
              const nilai = data?.total
                ? Math.round((data.benar / data.total) * 100)
                : 0;
              return (
                <div key={s.id}>
                  <p className="mb-1 text-xs font-semibold text-muted">
                    {s.nama}
                  </p>
                  <Bar v={nilai} c={meta.color} />
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
