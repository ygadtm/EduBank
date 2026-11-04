"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { SUBJECTS } from "@/lib/data";
import { SOAL } from "@/lib/soal";
import { card } from "@/components/ui";

function Kuis() {
  const router = useRouter();
  const m = Math.min(
    Number(useSearchParams().get("m")) || 0,
    SUBJECTS.length - 1,
  );
  const s = SUBJECTS[m];
  const Q = SOAL[m];
  const [i, setI] = useState(0);
  const [pilih, setPilih] = useState<number | null>(null);
  const [sisa, setSisa] = useState(300);
  const jaw = useRef<(number | null)[]>(Q.map(() => null));
  const t0 = useRef(Date.now());
  const q = Q[i];

  const selesai = () => {
    localStorage.setItem(
      "kapsel-hasil",
      JSON.stringify({
        m,
        jaw: jaw.current,
        detik: Math.round((Date.now() - t0.current) / 1000),
      }),
    );
    router.push("/siswa/hasil-latihan");
  };
  useEffect(() => {
    const t = setInterval(() => setSisa((x) => x - 1), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (sisa <= 0) selesai();
  }, [sisa]);

  const pick = (k: number) => {
    if (pilih !== null) return;
    setPilih(k);
    jaw.current[i] = k;
  };
  const lanjut = () => {
    if (i + 1 < Q.length) {
      setI(i + 1);
      setPilih(null);
    } else selesai();
  };
  const warna = (k: number) => {
    if (pilih === null)
      return "border-slate-200 bg-white hover:border-blue-400";
    if (k === q.a) return "border-emerald-500 bg-emerald-50 text-emerald-800";
    if (k === pilih) return "border-red-400 bg-red-50 text-red-700";
    return "border-slate-200 bg-white";
  };
  const w = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="min-h-screen bg-[#f4f7fc]">
      <div className="mx-auto max-w-2xl p-4 md:py-8">
        <div className="flex items-center justify-between">
          <Link
            href="/siswa/bank-soal"
            className="text-sm font-semibold text-slate-500"
          >
            ← Keluar
          </Link>
          <b className="rounded-full bg-white px-4 py-1.5 text-sm shadow">
            ⏱ {w(Math.max(0, Math.floor(sisa / 60)))}:
            {w(Math.max(0, sisa % 60))}
          </b>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span
            className="grid h-10 w-10 place-items-center rounded-xl text-xl"
            style={{ background: s.bg }}
          >
            {s.i}
          </span>
          <div>
            <h1 className="font-extrabold">{s.n}</h1>
            <p className="text-xs text-slate-500">
              Soal {i + 1} dari {Q.length}
            </p>
          </div>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${(i / Q.length) * 100}%`, background: s.c }}
          />
        </div>
        <div className={`${card} mt-5 p-6`}>
          <p className="text-lg font-bold leading-relaxed">{q.q}</p>
          <div className="mt-5 grid gap-3">
            {q.o.map((o, k) => (
              <button
                key={k}
                onClick={() => pick(k)}
                className={`rounded-2xl border-2 p-4 text-left font-semibold ${warna(k)}`}
              >
                <span className="mr-2 text-slate-400">{"ABCD"[k]}.</span>
                {o}
              </button>
            ))}
          </div>
          {pilih !== null && (
            <div className="mt-5">
              <p
                className={`font-bold ${pilih === q.a ? "text-emerald-600" : "text-red-500"}`}
              >
                {pilih === q.a ? "Benar! 🎉" : "Belum tepat, tidak apa-apa 😊"}
              </p>
              <p className="mt-1 text-sm text-slate-600">{q.e}</p>
              <button
                onClick={lanjut}
                className="mt-4 w-full rounded-xl py-3 font-bold text-white"
                style={{ background: s.c }}
              >
                {i === Q.length - 1 ? "Lihat Hasil" : "Soal Berikutnya"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Kuis />
    </Suspense>
  );
}
