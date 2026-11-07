import Link from "next/link";
import { requireSiswa } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mapelMeta } from "@/lib/mapel";
import { Stat, card } from "@/components/ui";

function kunciHari(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function Beranda() {
  const user = await requireSiswa();
  const tgl = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const [latihan, totalPaket, pakets] = await Promise.all([
    prisma.latihan.findMany({
      where: { siswaId: user.id },
      select: {
        mulai: true,
        selesai: true,
        jawaban: { select: { soalId: true, benar: true } },
      },
    }),
    prisma.paketLatihan.count({
      where: { kelas: user.kelas ?? 6, status: "TERBIT" },
    }),
    prisma.paketLatihan.findMany({
      where: { kelas: user.kelas ?? 6, status: "TERBIT" },
      orderBy: [{ mapelId: "asc" }, { urutan: "asc" }],
      take: 6,
      select: {
        id: true,
        judul: true,
        durasiMenit: true,
        _count: { select: { soal: true } },
        mapel: { select: { slug: true, nama: true } },
      },
    }),
  ]);

  const totalJawaban = latihan.reduce((n, l) => n + l.jawaban.length, 0);
  const latihanSelesai = latihan.filter((l) => l.selesai).length;
  const waktuMenit = Math.round(
    latihan.reduce((n, l) => {
      if (!l.selesai) return n;
      return n + (l.selesai.getTime() - l.mulai.getTime()) / 60000;
    }, 0),
  );

  const persen =
    totalPaket > 0
      ? Math.min(100, Math.round((latihanSelesai / totalPaket) * 100))
      : 0;
  const sisa = Math.max(0, totalPaket - latihanSelesai);

  const hari = new Set(
    latihan
      .filter((l) => l.selesai)
      .map((l) => kunciHari(l.selesai as Date)),
  );
  let streak = 0;
  const cursor = new Date();
  if (!hari.has(kunciHari(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (hari.has(kunciHari(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">📅 {tgl}</p>
          <h1 className="text-3xl font-extrabold">Halo, {user.nama}!</h1>
        </div>
        <div className={`${card} flex items-center gap-3 px-4 py-2`}>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-xl">
            🔥
          </span>
          <div>
            <b className="text-xl">{streak} Hari</b>
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
            Kerjakan latihan hari ini dan kumpulkan bintang prestasimu.
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">
          <div
            className="grid h-20 w-20 place-items-center rounded-full"
            style={{
              background: `conic-gradient(#fff ${persen}%, rgba(255,255,255,.25) 0)`,
            }}
          >
            <span className="grid h-16 w-16 place-items-center rounded-full bg-[#0a4fae] text-lg font-extrabold">
              {persen}%
            </span>
          </div>
          <div className="text-sm">
            <b>Target Belajar</b>
            <p className="text-blue-200">
              {sisa > 0 ? `Tersisa ${sisa} paket` : "Semua paket selesai"}
            </p>
            <p className="font-semibold">
              {persen >= 80 ? "Hampir tercapai! 🌟" : "Ayo lanjutkan! 💪"}
            </p>
          </div>
        </div>
      </section>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat
          label="Total Soal Dikerjakan"
          value={totalJawaban}
          unit="Soal"
          icon="✅"
        />
        <Stat label="Waktu Belajar" value={waktuMenit} unit="Menit" icon="⏱️" />
        <Stat
          label="Latihan Selesai"
          value={latihanSelesai}
          unit="Latihan"
          icon="📋"
        />
      </div>
      <div className="mb-4 mt-8 flex items-center justify-between">
        <h2 className="border-l-4 border-blue-600 pl-2 text-lg font-bold">
          Paket Latihan Tersedia
        </h2>
        <Link
          href="/siswa/bank-soal"
          className="text-sm font-bold text-blue-700"
        >
          Lihat Semua →
        </Link>
      </div>
      {pakets.length === 0 ? (
        <p className={`${card} px-5 py-6 text-center text-sm text-slate-500`}>
          Belum ada paket latihan untuk kelasmu. Cek lagi nanti!
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pakets.map((p) => {
            const meta = mapelMeta(p.mapel.slug);
            return (
              <article key={p.id} className={`${card} flex flex-col p-4`}>
                <div className="flex items-center gap-2">
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl"
                    style={{ background: meta.bg }}
                  >
                    {meta.icon}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold">{p.judul}</h3>
                    <p className="text-xs text-slate-500">{p.mapel.nama}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {p._count.soal} soal · ⏱ {p.durasiMenit} menit
                  </span>
                  <Link
                    href={`/siswa/kerjakan-soal?paket=${p.id}`}
                    className="rounded-xl bg-blue-100 px-3 py-1.5 text-sm font-bold text-blue-900"
                  >
                    Mulai →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
