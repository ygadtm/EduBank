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
        <div className="my-3 text-5xl">
          {"⭐".repeat(b)}
          {"☆".repeat(3 - b)}
        </div>
        <h1 className="text-2xl font-extrabold">{pesan[b]}</h1>
        <p className="mt-1 text-slate-500">
          Kamu menjawab {ok} dari {total} soal dengan benar.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {ringkas.map(([l, v]) => (
            <div key={l} className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">{l}</p>
              <p className="mt-1 text-2xl font-extrabold">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {latihan.paket && (
            <Link
              href={`/siswa/kerjakan-soal?paket=${latihan.paket.id}`}
              className="rounded-xl px-6 py-3 text-sm font-bold text-white"
              style={{ background: meta.color }}
            >
              Coba Lagi
            </Link>
          )}
          <Link
            href="/siswa/bank-soal"
            className="rounded-xl bg-blue-50 px-6 py-3 text-sm font-bold text-blue-700"
          >
            Pilih Mapel Lain
          </Link>
        </div>
      </section>
      <h2 className="mx-auto mt-8 max-w-2xl text-lg font-bold">
        Review Jawaban
      </h2>
      <div className="mx-auto mt-3 max-w-2xl space-y-3">
        {jawaban.map((j, k) => {
          const benar = j.soal.pilihan.find((p) => p.benar);
          return (
            <div key={j.id} className={`${card} p-5`}>
              <p className="font-bold">
                {j.benar ? "✅" : "❌"} {k + 1}. {j.soal.teks}
              </p>
              <p
                className={`mt-2 text-sm ${j.benar ? "text-emerald-700" : "text-red-600"}`}
              >
                Jawabanmu: {j.pilihan?.teks ?? "Belum dijawab"}
              </p>
              {!j.benar && (
                <p className="text-sm text-emerald-700">
                  Jawaban benar: {benar?.teks ?? "-"}
                </p>
              )}
              <p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                💡 {j.soal.pembahasan ?? "Tidak ada pembahasan."}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}
