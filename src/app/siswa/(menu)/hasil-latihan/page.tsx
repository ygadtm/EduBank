"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SUBJECTS } from "@/lib/data";
import { SOAL } from "@/lib/soal";
import { card } from "@/components/ui";

type Hasil = { m: number; jaw: (number | null)[]; detik: number };
const pesan = [
  "Jangan menyerah, ayo coba lagi!",
  "Bagus, terus berlatih ya!",
  "Hebat! Sedikit lagi sempurna!",
  "Luar biasa! Nilai sempurna!",
];
const w = (n: number) => String(n).padStart(2, "0");

export default function HasilLatihan() {
  const router = useRouter();
  const [h, setH] = useState<Hasil | null>(null);
  useEffect(() => {
    const r = localStorage.getItem("kapsel-hasil");
    if (r) setH(JSON.parse(r));
    else router.replace("/siswa/bank-soal");
  }, [router]);
  if (!h) return null;

  const s = SUBJECTS[h.m];
  const Q = SOAL[h.m];
  const ok = Q.filter((q, k) => h.jaw[k] === q.a).length;
  const b = ok === Q.length ? 3 : ok >= 2 ? 2 : ok >= 1 ? 1 : 0;
  const ringkas: [string, string | number][] = [
    ["Benar", ok],
    ["Salah", Q.length - ok],
    ["Waktu", `${w(Math.floor(h.detik / 60))}:${w(h.detik % 60)}`],
  ];
  return (
    <>
      <section className={`${card} mx-auto max-w-2xl p-8 text-center`}>
        <p className="text-sm font-semibold" style={{ color: s.c }}>
          {s.i} {s.n}
        </p>
        <div className="my-3 text-5xl">
          {"⭐".repeat(b)}
          {"☆".repeat(3 - b)}
        </div>
        <h1 className="text-2xl font-extrabold">{pesan[b]}</h1>
        <p className="mt-1 text-slate-500">
          Kamu menjawab {ok} dari {Q.length} soal dengan benar.
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
          <Link
            href={`/siswa/kerjakan-soal?m=${h.m}`}
            className="rounded-xl px-6 py-3 text-sm font-bold text-white"
            style={{ background: s.c }}
          >
            Coba Lagi
          </Link>
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
        {Q.map((q, k) => {
          const j = h.jaw[k];
          const y = j === q.a;
          return (
            <div key={k} className={`${card} p-5`}>
              <p className="font-bold">
                {y ? "✅" : "❌"} {k + 1}. {q.q}
              </p>
              <p
                className={`mt-2 text-sm ${y ? "text-emerald-700" : "text-red-600"}`}
              >
                Jawabanmu: {j === null ? "Belum dijawab" : q.o[j]}
              </p>
              {!y && (
                <p className="text-sm text-emerald-700">
                  Jawaban benar: {q.o[q.a]}
                </p>
              )}
              <p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                💡 {q.e}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}
