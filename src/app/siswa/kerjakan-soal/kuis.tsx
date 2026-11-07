"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  mulaiLatihan,
  selesaikanLatihan,
  simpanJawaban,
} from "@/lib/actions/latihan";
import { card } from "@/components/ui";

type Soal = {
  id: string;
  teks: string;
  pilihan: { id: string; teks: string }[];
};

type Mapel = {
  slug: string;
  nama: string;
  icon: string;
  color: string;
  bg: string;
};

type Feedback = {
  benar: boolean;
  pilihanBenarId: string | null;
  pembahasan: string;
};

const w = (n: number) => String(n).padStart(2, "0");

export default function Kuis({
  paketId,
  mapel,
  soal,
  durasiMenit,
}: {
  paketId: string;
  mapel: Mapel;
  soal: Soal[];
  durasiMenit: number;
}) {
  const router = useRouter();
  const [latihanId, setLatihanId] = useState<string | null>(null);
  const [i, setI] = useState(0);
  const [pilih, setPilih] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [sisa, setSisa] = useState(durasiMenit * 60);
  const [error, setError] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);
  const mulaiRef = useRef(false);
  const selesaiRef = useRef(false);

  const q = soal[i];

  useEffect(() => {
    if (mulaiRef.current) return;
    mulaiRef.current = true;
    mulaiLatihan(paketId)
      .then((hasil) => {
        if ("error" in hasil) setError(hasil.error);
        else setLatihanId(hasil.id);
      })
      .catch(() => setError("Gagal memulai latihan."));
  }, [paketId]);

  useEffect(() => {
    const timer = setInterval(() => setSisa((n) => n - 1), 1000);
    return () => clearInterval(timer);
  }, []);

  async function selesai() {
    if (selesaiRef.current) return;
    selesaiRef.current = true;

    if (!latihanId) {
      router.push("/siswa/bank-soal");
      return;
    }

    const hasil = await selesaikanLatihan(latihanId);
    if ("error" in hasil) {
      setError(hasil.error);
      selesaiRef.current = false;
      return;
    }
    router.push(`/siswa/hasil-latihan?id=${hasil.id}`);
  }

  useEffect(() => {
    if (sisa <= 0) void selesai();
  }, [sisa]);

  async function pick(pilihanId: string) {
    if (pilih || feedback || !latihanId || menyimpan) return;
    setPilih(pilihanId);
    setMenyimpan(true);
    const hasil = await simpanJawaban(latihanId, q.id, pilihanId);
    setMenyimpan(false);
    if ("error" in hasil) {
      setError(hasil.error);
      setPilih(null);
      return;
    }
    setFeedback(hasil);
  }

  function lanjut() {
    if (i + 1 < soal.length) {
      setI(i + 1);
      setPilih(null);
      setFeedback(null);
      setError("");
    } else {
      void selesai();
    }
  }

  function warna(pilihanId: string) {
    if (!feedback) {
      return pilih === pilihanId
        ? "border-blue-400 bg-blue-50"
        : "border-slate-200 bg-white hover:border-blue-400";
    }
    if (pilihanId === feedback.pilihanBenarId) {
      return "border-emerald-500 bg-emerald-50 text-emerald-800";
    }
    if (pilihanId === pilih) {
      return "border-red-400 bg-red-50 text-red-700";
    }
    return "border-slate-200 bg-white";
  }

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
            style={{ background: mapel.bg }}
          >
            {mapel.icon}
          </span>
          <div>
            <h1 className="font-extrabold">{mapel.nama}</h1>
            <p className="text-xs text-slate-500">
              Soal {i + 1} dari {soal.length}
            </p>
          </div>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(i / soal.length) * 100}%`,
              background: mapel.color,
            }}
          />
        </div>
        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}
        {!latihanId && !error && (
          <p className="mt-4 text-sm font-semibold text-slate-500">
            Menyiapkan latihan...
          </p>
        )}
        <div className={`${card} mt-5 p-6`}>
          <p className="text-lg font-bold leading-relaxed">{q.teks}</p>
          <div className="mt-5 grid gap-3">
            {q.pilihan.map((o, k) => (
              <button
                key={o.id}
                onClick={() => pick(o.id)}
                disabled={!!pilih || !latihanId}
                className={`rounded-2xl border-2 p-4 text-left font-semibold disabled:cursor-default ${warna(o.id)}`}
              >
                <span className="mr-2 text-slate-400">{"ABCD"[k]}.</span>
                {o.teks}
              </button>
            ))}
          </div>
          {feedback && (
            <div className="mt-5">
              <p
                className={`font-bold ${feedback.benar ? "text-emerald-600" : "text-red-500"}`}
              >
                {feedback.benar
                  ? "Benar! 🎉"
                  : "Belum tepat, tidak apa-apa 😊"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {feedback.pembahasan}
              </p>
              <button
                onClick={lanjut}
                className="mt-4 w-full rounded-xl py-3 font-bold text-white"
                style={{ background: mapel.color }}
              >
                {i === soal.length - 1 ? "Lihat Hasil" : "Soal Berikutnya"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
