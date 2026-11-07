"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { PageHead, btn, card, inp } from "@/components/ui";
import { simpanSoal } from "@/lib/actions/soal";

const lab = "block text-xs font-bold text-slate-600";

type MapelOption = { id: string; nama: string };

type SoalAwal = {
  id: string;
  mapelId: string;
  kelas: number;
  topik: string | null;
  teks: string;
  pembahasan: string | null;
  status: "DRAF" | "TERBIT";
  pilihan: { teks: string; benar: boolean }[];
};

export default function SoalForm({
  mapels,
  soal,
}: {
  mapels: MapelOption[];
  soal: SoalAwal | null;
}) {
  const [state, formAction, pending] = useActionState(simpanSoal, {
    error: "",
  });
  const [mapelId, setMapelId] = useState(soal?.mapelId ?? mapels[0]?.id ?? "");
  const [kelas, setKelas] = useState(String(soal?.kelas ?? 6));
  const [topik, setTopik] = useState(soal?.topik ?? "");
  const [q, setQ] = useState(soal?.teks ?? "");
  const [pembahasan, setPembahasan] = useState(soal?.pembahasan ?? "");
  const [status, setStatus] = useState(soal?.status ?? "DRAF");

  const awal = soal?.pilihan.map((p) => p.teks) ?? [];
  const [o, setO] = useState([
    awal[0] ?? "",
    awal[1] ?? "",
    awal[2] ?? "",
    awal[3] ?? "",
  ]);
  const [kunci, setKunci] = useState(
    soal?.pilihan.findIndex((p) => p.benar) ?? 0,
  );

  return (
    <>
      <PageHead
        title={soal ? "Ubah Soal" : "Buat Soal Baru"}
        sub="Isi soal, pilihan jawaban, kunci, dan pembahasan."
      />
      <div className="mt-5 grid gap-5 xl:grid-cols-5">
        <form action={formAction} className={`${card} space-y-4 p-6 xl:col-span-3`}>
          {soal && <input type="hidden" name="id" value={soal.id} />}
          <div className="grid gap-3 sm:grid-cols-3">
            <label className={lab}>
              Mapel
              <select
                name="mapelId"
                value={mapelId}
                onChange={(e) => setMapelId(e.target.value)}
                className={`${inp} mt-1 w-full`}
              >
                {mapels.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama}
                  </option>
                ))}
              </select>
            </label>
            <label className={lab}>
              Kelas
              <select
                name="kelas"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className={`${inp} mt-1 w-full`}
              >
                <option value="5">Kelas 5</option>
                <option value="6">Kelas 6</option>
              </select>
            </label>
            <label className={lab}>
              Topik
              <input
                name="topik"
                value={topik}
                onChange={(e) => setTopik(e.target.value)}
                placeholder="Contoh: Pecahan"
                className={`${inp} mt-1 w-full`}
              />
            </label>
          </div>
          <label className={lab}>
            Pertanyaan
            <textarea
              name="teks"
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
                    value={k}
                    checked={kunci === k}
                    onChange={() => setKunci(k)}
                    className="h-4 w-4"
                  />
                  <span className="w-5 font-bold text-slate-400">
                    {"ABCD"[k]}.
                  </span>
                  <input
                    name="pilihan"
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
              name="pembahasan"
              value={pembahasan}
              onChange={(e) => setPembahasan(e.target.value)}
              rows={3}
              placeholder="Jelaskan jawaban yang benar"
              className={`${inp} mt-1 w-full`}
            />
          </label>
          {state.error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
              {state.error}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <select
              name="status"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value === "TERBIT" ? "TERBIT" : "DRAF")
              }
              className={inp}
            >
              <option value="DRAF">Simpan sebagai Draf</option>
              <option value="TERBIT">Terbitkan</option>
            </select>
            <div className="flex gap-2">
              <Link
                href="/guru/soal"
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600"
              >
                Batal
              </Link>
              <button disabled={pending} className={`${btn} disabled:opacity-60`}>
                {pending ? "Menyimpan..." : "Simpan Soal"}
              </button>
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
