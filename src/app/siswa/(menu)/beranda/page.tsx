import { Nama } from "@/components/klien";
import Link from "next/link";
import { SUBJECTS } from "@/lib/data";
import { Stat, card } from "@/components/ui";

const populer = [
  {
    s: 2,
    t: "Operasi Hitung Bilangan",
    d: "Latihan perkalian bersusun, pembagian praktis, dan soal cerita sehari-hari.",
    b: "Lanjutkan Latihan →",
    k: "bg-emerald-100 text-emerald-900",
  },
  {
    s: 1,
    t: "Siklus Air dan Perubahannya",
    d: "Mengenal proses evaporasi, kondensasi, presipitasi, dan menjaga kelestarian air bersih.",
    b: "Mulai →",
    k: "bg-blue-100 text-blue-900",
  },
  {
    s: 0,
    t: "Membaca Cerita Rakyat",
    d: "Memahami pesan moral, tokoh protagonis, dan alur legenda Nusantara secara interaktif.",
    b: "Buka Cerita ▷",
    k: "bg-orange-100 text-orange-900",
  },
];

export default function Beranda() {
  const tgl = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">📅 {tgl}</p>
          <h1 className="text-3xl font-extrabold">
            Halo, <Nama depan />!
          </h1>
        </div>
        <div className={`${card} flex items-center gap-3 px-4 py-2`}>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-xl">
            🔥
          </span>
          <div>
            <b className="text-xl">3 Hari</b>
            <p className="text-xs text-slate-600">Streak Belajar Aktif</p>
          </div>
        </div>
      </div>
      <section className="mt-6 flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-linear-to-br from-[#01409a] to-[#0a5bc4] p-6 text-white md:p-8">
        <div className="max-w-md">
          <h2 className="text-2xl font-extrabold">
            Siap menaklukkan tantangan baru?
          </h2>
          <p className="mt-2 text-blue-100">
            Selesaikan 2 materi pilihan hari ini untuk mendapatkan lencana
            Bintang Emas tambahan!
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">
          <div
            className="grid h-20 w-20 place-items-center rounded-full"
            style={{
              background: "conic-gradient(#fff 78%, rgba(255,255,255,.25) 0)",
            }}
          >
            <span className="grid h-16 w-16 place-items-center rounded-full bg-[#0a4fae] text-lg font-extrabold">
              78%
            </span>
          </div>
          <div className="text-sm">
            <b>Target Belajar</b>
            <p className="text-blue-200">Tersisa 5 butir soal</p>
            <p className="font-semibold">Hampir tercapai! 🌟</p>
          </div>
        </div>
      </section>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Total Soal Dikerjakan" value={18} unit="Soal" icon="✅" />
        <Stat label="Waktu Belajar" value={45} unit="Menit" icon="⏱️" />
        <Stat label="Latihan Siap" value={2} unit="Latihan Baru" icon="📋" />
      </div>
      <div className="mb-4 mt-8 flex items-center justify-between">
        <h2 className="border-l-4 border-blue-600 pl-2 text-lg font-bold">
          Bank Soal & Latihan Populer
        </h2>
        <Link
          href="/siswa/bank-soal"
          className="text-sm font-bold text-blue-700"
        >
          Lihat Semua Soal →
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {populer.map((p) => {
          const s = SUBJECTS[p.s];
          return (
            <article key={p.t} className={`${card} flex flex-col p-4`}>
              <div
                className="relative grid h-36 place-items-center rounded-xl text-6xl"
                style={{ background: `linear-gradient(135deg, ${s.bg}, #fff)` }}
              >
                <span
                  className="absolute left-2 top-2 rounded-lg px-2.5 py-1 text-xs font-bold text-white"
                  style={{ background: s.c }}
                >
                  {s.n.split(" ")[0]}
                </span>
                <span className="absolute right-2 top-2 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold">
                  Kelas 6 SD
                </span>
                {s.i}
              </div>
              <h3 className="mt-4 font-bold">{p.t}</h3>
              <p className="mt-1 flex-1 text-sm text-slate-500">{p.d}</p>
              <Link
                href={`/siswa/kerjakan-soal?m=${p.s}`}
                className={`mt-4 w-fit rounded-xl px-4 py-2 text-sm font-bold ${p.k}`}
              >
                {p.b}
              </Link>
            </article>
          );
        })}
      </div>
    </>
  );
}
