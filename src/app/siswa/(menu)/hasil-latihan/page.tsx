import Link from "next/link";
import { redirect } from "next/navigation";
import { card } from "@/components/ui";
import { requireSiswa } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mapelMeta } from "@/lib/mapel";

const pesan = [
  "Jangan menyerah, ayo coba lagi!",
  "Bagus, terus berlatih ya!",
  "Hebat! Sedikit lagi sempurna!",
  "Luar biasa! Nilai sempurna!",
];
const w = (n: number) => String(n).padStart(2, "0");

export default async function HasilLatihan({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const user = await requireSiswa();
  const { id } = await searchParams;

  const latihan = await prisma.latihan.findFirst({
    where: {
      siswaId: user.id,
      selesai: { not: null },
      ...(id ? { id } : {}),
    },
    orderBy: { selesai: "desc" },
    include: {
      mapel: true,
      paket: { select: { id: true } },
      jawaban: {
        include: {
          pilihan: true,
          soal: {
            include: {
              pilihan: { orderBy: { urutan: "asc" } },
            },
          },
        },
      },
    },
  });

  if (!latihan || !latihan.selesai) redirect("/siswa/bank-soal");

  const jawaban = [...latihan.jawaban].sort(
    (a, b) =>
      a.soal.createdAt.getTime() - b.soal.createdAt.getTime() ||
      a.soal.id.localeCompare(b.soal.id),
  );
  const ok = jawaban.filter((j) => j.benar).length;
  const total = jawaban.length;
  const persen = total > 0 ? Math.round((ok / total) * 100) : 0;
  const b =
    total > 0 && ok === total
      ? 3
      : ok >= Math.ceil(total * (2 / 3))
        ? 2
        : ok >= 1
          ? 1
          : 0;
  const detik = Math.max(
    0,
    Math.round((latihan.selesai.getTime() - latihan.mulai.getTime()) / 1000),
  );
  const meta = mapelMeta(latihan.mapel.slug);
  const ringkas: [string, string | number][] = [
    ["Benar", ok],
    ["Salah", total - ok],
    ["Waktu", `${w(Math.floor(detik / 60))}:${w(detik % 60)}`],
  ];

  return (
    <>
      <section className={`${card} mx-auto max-w-2xl p-8 text-center`}>
        <p className="text-sm font-semibold" style={{ color: meta.color }}>
          {meta.icon} {latihan.mapel.nama}
        </p>
        <div className="my-5" aria-label={`${b} dari 3 bintang`}>
          <p className="text-[40px] font-extrabold leading-none text-ink">
            {persen}
            <span className="text-lg font-bold text-muted">%</span>
          </p>
          <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((n) => (
              <svg
                key={n}
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                strokeLinejoin="round"
                className={`h-7 w-7 ${
                  n < b
                    ? "fill-highlight stroke-highlight"
                    : "fill-transparent stroke-line"
                }`}
              >
                <path d="M12 3.2l2.7 5.5 6 .9-4.4 4.3 1 6-5.3-2.8-5.3 2.8 1-6-4.4-4.3 6-.9z" />
              </svg>
            ))}
          </div>
        </div>
        <h1 className="text-[22px] font-bold leading-[30px] text-ink">{pesan[b]}</h1>
        <p className="mt-1 text-muted">
          Kamu menjawab {ok} dari {total} soal dengan benar.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {ringkas.map(([l, v]) => (
            <div key={l} className="rounded-[10px] border border-line bg-paper p-4">
              <p className="text-xs font-semibold text-muted">{l}</p>
              <p className="mt-1 text-2xl font-bold text-ink">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {latihan.paket && (
            <Link
              href={`/siswa/kerjakan-soal?paket=${latihan.paket.id}`}
              className="min-h-11 rounded px-6 py-3 text-sm font-semibold text-accent-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
              style={{ background: meta.color }}
            >
              Kerjakan Lagi
            </Link>
          )}
          <Link
            href="/siswa/bank-soal"
            className="min-h-11 rounded border border-line bg-surface px-6 py-3 text-sm font-semibold text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
          >
            Pilih Mapel Lain
          </Link>
        </div>
      </section>
      <h2 className="mx-auto mt-8 max-w-2xl text-lg font-bold text-ink">
        Review Jawaban
      </h2>
      <div className="mx-auto mt-3 max-w-2xl space-y-3">
        {jawaban.map((j, k) => {
          const benar = j.soal.pilihan.find((p) => p.benar);
          return (
            <div key={j.id} className={`${card} p-5`}>
              <p className="font-bold text-ink">
                {j.benar ? "✅" : "❌"} {k + 1}. {j.soal.teks}
              </p>
              <p
                className={`mt-2 text-sm ${j.benar ? "text-success" : "text-danger"}`}
              >
                Jawabanmu: {j.pilihan?.teks ?? "Belum dijawab"}
              </p>
              {!j.benar && (
                <p className="text-sm text-success">
                  Jawaban benar: {benar?.teks ?? "-"}
                </p>
              )}
              <p className="mt-2 rounded border border-line bg-paper p-3 text-sm text-muted">
                <span className="font-semibold text-ink">Pembahasan:</span>{" "}
                {j.soal.pembahasan ?? "Tidak ada pembahasan."}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}
