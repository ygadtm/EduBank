"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SUBJECTS } from "@/lib/data";
import { PageHead, btn, card, inp } from "@/components/ui";

const lab = "block text-xs font-bold text-slate-600";

export default function SoalForm() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [o, setO] = useState(["", "", "", ""]);
  const [kunci, setKunci] = useState(0);
  return (
    <>
      <PageHead
        icon="📝"
        title="Buat Soal Baru"
        sub="Isi soal, pilihan jawaban, kunci, dan pembahasan."
      />
      <div className="mt-5 grid gap-5 xl:grid-cols-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("Soal tersimpan (tampilan contoh).");
            router.push("/guru/soal");
          }}
          className={`${card} space-y-4 p-6 xl:col-span-3`}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <label className={lab}>
              Mapel
              <select className={`${inp} mt-1 w-full`}>
                {SUBJECTS.map((s) => (
                  <option key={s.n}>{s.n}</option>
                ))}
              </select>
            </label>
            <label className={lab}>
              Kelas
              <select className={`${inp} mt-1 w-full`}>
                <option>Kelas 5</option>
                <option>Kelas 6</option>
              </select>
            </label>
            <label className={lab}>
              Topik
              <input
                placeholder="Contoh: Pecahan"
                className={`${inp} mt-1 w-full`}
              />
            </label>
          </div>
          <label className={lab}>
            Pertanyaan
            <textarea
              value={q}
              onChange={(e) => setQ(e.target.value)}
              required
              rows={3}
              placeholder="Tulis pertanyaan di sini"
              className={`${inp} mt-1 w-full`}
            />
          </label>
          <div>
            <p className="mb-2 text-xs font-bold text-slate-600">
              Pilihan jawaban (pilih bulatan untuk kunci jawaban)
            </p>
            <div className="space-y-2">
              {o.map((v, k) => (
                <label key={k} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="kunci"
                    checked={kunci === k}
                    onChange={() => setKunci(k)}
                    className="h-4 w-4"
                  />
                  <span className="w-5 font-bold text-slate-400">
                    {"ABCD"[k]}.
                  </span>
                  <input
                    value={v}
                    onChange={(e) =>
                      setO(o.map((x, j) => (j === k ? e.target.value : x)))
                    }
                    placeholder={`Pilihan ${"ABCD"[k]}`}
                    className={`${inp} flex-1`}
                  />
                </label>
              ))}
            </div>
          </div>
          <label className={lab}>
            Pembahasan
            <textarea
              rows={3}
              placeholder="Jelaskan jawaban yang benar"
              className={`${inp} mt-1 w-full`}
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <select className={inp}>
              <option>Simpan sebagai Draf</option>
              <option>Terbitkan</option>
            </select>
            <div className="flex gap-2">
              <Link
                href="/guru/soal"
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600"
              >
                Batal
              </Link>
              <button className={btn}>Simpan Soal</button>
            </div>
          </div>
        </form>
        <aside className={`${card} h-fit p-6 xl:col-span-2`}>
          <p className="text-xs font-bold text-slate-500">
            PRATINJAU TAMPILAN SISWA
          </p>
          <p className="mt-3 font-bold">
            {q || "Pertanyaan akan tampil di sini"}
          </p>
          <div className="mt-4 grid gap-2">
            {o.map((v, k) => (
              <div
                key={k}
                className={`rounded-xl border-2 p-3 text-sm font-semibold ${k === kunci ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200"}`}
              >
                <span className="mr-2 text-slate-400">{"ABCD"[k]}.</span>
                {v || `Pilihan ${"ABCD"[k]}`}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
