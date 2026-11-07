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
        ? "border-accent bg-accent/10"
        : "border-line bg-surface hover:border-accent/50";
    }
    if (pilihanId === feedback.pilihanBenarId) {
      return "border-success bg-success/10 text-success";
    }
    if (pilihanId === pilih) {
      return "border-danger bg-danger/10 text-danger";
    }
    return "border-line bg-surface";
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-2xl p-4 md:py-8">
        <div className="flex items-center justify-between">
          <Link
            href="/siswa/bank-soal"
            className="min-h-11 rounded px-2 py-2 text-sm font-semibold text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
          >
            Keluar
          </Link>
          <b className="rounded border border-line bg-surface px-4 py-1.5 text-sm text-ink">
            Sisa waktu {w(Math.max(0, Math.floor(sisa / 60)))}:
            {w(Math.max(0, sisa % 60))}
          </b>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span
            className="grid h-10 w-10 place-items-center rounded border border-line text-xl"
            style={{ background: mapel.bg }}
          >
            {mapel.icon}
          </span>
          <div>
            <h1 className="font-bold text-ink">{mapel.nama}</h1>
            <p className="text-xs text-muted">
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
          <p className="mt-4 rounded border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
            {error}
          </p>
        )}
        {!latihanId && !error && (
          <p className="mt-4 text-sm font-semibold text-muted">
            Menyiapkan latihan...
          </p>
        )}
        <div className={`${card} mt-5 p-6`}>
          <p className="text-lg font-bold leading-relaxed text-ink">{q.teks}</p>
          <div className="mt-5 grid gap-3">
            {q.pilihan.map((o, k) => (
              <button
                key={o.id}
                onClick={() => pick(o.id)}
                disabled={!!pilih || !latihanId}
                className={`min-h-11 rounded-[10px] border-2 p-4 text-left font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:cursor-default ${warna(o.id)}`}
              >
                <span className="mr-2 text-muted">{"ABCD"[k]}.</span>
                {o.teks}
              </button>
            ))}
          </div>
          {feedback && (
            <div className="mt-5">
              <p
                className={`font-bold ${feedback.benar ? "text-success" : "text-danger"}`}
              >
                {feedback.benar
                  ? "Benar! 🎉"
                  : "Belum tepat, tidak apa-apa 😊"}
              </p>
              <p className="mt-1 text-sm text-muted">
                {feedback.pembahasan}
              </p>
              <button
                onClick={lanjut}
                className="mt-4 w-full min-h-11 rounded py-3 font-semibold text-accent-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
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
