import Link from "next/link";
import { Nama } from "@/components/klien";
import { DAFTAR_SOAL, SUBJECTS } from "@/lib/data";
import {
  Bar,
  MapelBadge,
  Stat,
  StatusBadge,
  Tabel,
  card,
} from "@/components/ui";

const aksi = [
  ["/guru/soal-form", "➕", "Buat Soal Baru"],
  ["/guru/siswa", "📥", "Impor Data Siswa"],
  ["/guru/rekap", "📈", "Lihat Rekap Nilai"],
];
const rata = [88, 79, 72, 81, 90, 76];

export default function BerandaGuru() {
  const tgl = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const rows = DAFTAR_SOAL.slice(0, 5).map((d) => [
    d.q,
    <MapelBadge key="m" i={d.m} />,
    `Kelas ${d.k}`,
    <StatusBadge key="s" s={d.s} />,
    d.t,
  ]);
  return (
    <>
      <p className="text-xs text-slate-500">📅 {tgl}</p>
      <h1 className="text-3xl font-extrabold">
        Halo, <Nama depan />!
      </h1>
      <p className="text-sm text-slate-500">
        Kelola soal dan pantau perkembangan belajar siswa.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Total Soal" value={120} unit="Soal" icon="📝" />
        <Stat label="Jumlah Siswa" value={32} unit="Siswa" icon="👥" />
        <Stat label="Rata-rata Nilai" value={78} unit="Poin" icon="📊" />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {aksi.map(([href, ikon, teks]) => (
          <Link
            key={href}
            href={href}
            className={`${card} flex items-center gap-3 p-4 font-bold hover:ring-2 hover:ring-blue-300`}
          >
            <span className="text-2xl">{ikon}</span>
            {teks}
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <section className={`${card} xl:col-span-2`}>
          <div className="flex items-center justify-between p-5">
            <h2 className="font-bold">Soal Terbaru</h2>
            <Link href="/guru/soal" className="text-sm font-bold text-blue-700">
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
            {SUBJECTS.map((s, i) => (
              <div key={s.n}>
                <p className="mb-1 text-xs font-semibold text-slate-600">
                  {s.n}
                </p>
                <Bar v={rata[i]} c={s.c} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
