import Link from "next/link";
import { requireSiswa } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mapelMeta } from "@/lib/mapel";
import { Stat, btn, card } from "@/components/ui";

export default async function Beranda() {
  const user = await requireSiswa();
  const tgl = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const [latihan, pakets] = await Promise.all([
    prisma.latihan.findMany({
      where: { siswaId: user.id },
      select: {
        mulai: true,
        selesai: true,
        jawaban: { select: { soalId: true, benar: true } },
      },
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

  return (
    <>
      <div>
        <p className="text-xs text-muted">{tgl}</p>
        <h1 className="text-[32px] font-bold leading-[38px] text-ink">Halo, {user.nama}!</h1>
      </div>
      <section className={`${card} mt-6 border-l-4 border-l-accent p-6 md:p-8`}>
        <div className="max-w-xl">
          <h2 className="text-[22px] font-bold leading-[30px] text-ink">
            Lanjutkan latihan
          </h2>
          <p className="mt-2 text-sm text-muted">
            Pilih paket latihan di Bank Soal, kerjakan soal, lalu lihat hasil dan pembahasannya.
          </p>
          <Link href="/siswa/bank-soal" className={`${btn} mt-4 inline-block`}>
            Buka Bank Soal
          </Link>
        </div>
      </section>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat
          label="Total Soal Dikerjakan"
          value={totalJawaban}
          unit="Soal"
        />
        <Stat label="Waktu Belajar" value={waktuMenit} unit="Menit" />
        <Stat
          label="Latihan Selesai"
          value={latihanSelesai}
          unit="Latihan"
        />
      </div>
      <div className="mb-4 mt-8 flex items-center justify-between">
        <h2 className="border-l-4 border-accent pl-3 text-lg font-bold text-ink">
          Paket Latihan Tersedia
        </h2>
        <Link
          href="/siswa/bank-soal"
          className="text-sm font-semibold text-accent underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
        >
          Lihat semua
        </Link>
      </div>
      {pakets.length === 0 ? (
        <p className={`${card} px-5 py-6 text-center text-sm text-muted`}>
          Belum ada paket latihan untuk kelasmu.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pakets.map((p) => {
            const meta = mapelMeta(p.mapel.slug);
            return (
              <article key={p.id} className={`${card} flex flex-col p-4`}>
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded border border-line text-xl"
                    style={{ background: meta.bg }}
                  >
                    {meta.icon}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-ink">{p.judul}</h3>
                    <p className="text-xs text-muted">{p.mapel.nama}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted">
                    {p._count.soal} soal · {p.durasiMenit} menit
                  </span>
                  <Link
                    href={`/siswa/kerjakan-soal?paket=${p.id}`}
                    className="rounded bg-accent/10 px-3 py-2 text-sm font-semibold text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                  >
                    Kerjakan
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
