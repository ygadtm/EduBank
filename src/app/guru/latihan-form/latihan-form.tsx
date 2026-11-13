"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { PageHead, btn, card, inp } from "@/components/ui";
import {
  simpanPaket,
  type PaketFormState,
} from "@/lib/actions/paket-latihan";

const lab = "block text-xs font-bold text-slate-600";

type MapelOption = { id: string; nama: string };

type SoalOption = {
  id: string;
  mapelId: string;
  kelas: number;
  topik: string | null;
  teks: string;
};

type PaketAwal = {
  id: string;
  mapelId: string;
  kelas: number;
  judul: string;
  deskripsi: string;
  urutan: number;
  durasiMenit: number;
  status: "DRAF" | "TERBIT";
  soalIds: string[];
  terkunci: boolean;
};

export default function LatihanForm({
  mapels,
  soal,
  paket,
}: {
  mapels: MapelOption[];
  soal: SoalOption[];
  paket: PaketAwal | null;
}) {
  const [state, formAction, pending] = useActionState<PaketFormState, FormData>(
    simpanPaket,
    { error: "" },
  );
  const [mapelId, setMapelId] = useState(paket?.mapelId ?? mapels[0]?.id ?? "");
  const [kelas, setKelas] = useState(String(paket?.kelas ?? 6));
  const [judul, setJudul] = useState(paket?.judul ?? "");
  const [deskripsi, setDeskripsi] = useState(paket?.deskripsi ?? "");
  const [urutan, setUrutan] = useState(String(paket?.urutan ?? 0));
  const [durasiMenit, setDurasiMenit] = useState(
    String(paket?.durasiMenit ?? 5),
  );
  const [status, setStatus] = useState(paket?.status ?? "DRAF");
  const [cari, setCari] = useState("");
  const [selected, setSelected] = useState<Set<string>>(() => {
    const tersedia = new Set(soal.map((item) => item.id));
    return new Set((paket?.soalIds ?? []).filter((id) => tersedia.has(id)));
  });

  const kelasAngka = Number(kelas);
  const kunci = paket?.terkunci ?? false;
  const filtered = soal.filter(
    (item) =>
      item.mapelId === mapelId &&
      item.kelas === kelasAngka &&
      (!cari ||
        item.teks.toLowerCase().includes(cari.toLowerCase()) ||
        (item.topik ?? "").toLowerCase().includes(cari.toLowerCase())),
  );
  const terpilihDiTampilan = filtered.filter((item) =>
    selected.has(item.id),
  ).length;

  function gantiMapel(value: string) {
    setMapelId(value);
    setSelected((prev) => {
      const next = new Set<string>();
      for (const id of prev) {
        const item = soal.find((s) => s.id === id);
        if (item?.mapelId === value && item.kelas === kelasAngka) next.add(id);
      }
      return next;
    });
  }

  function gantiKelas(value: string) {
    setKelas(value);
    const angka = Number(value);
    setSelected((prev) => {
      const next = new Set<string>();
      for (const id of prev) {
        const item = soal.find((s) => s.id === id);
        if (item?.mapelId === mapelId && item.kelas === angka) next.add(id);
      }
      return next;
    });
  }

  function toggle(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <>
      <PageHead
        title={paket ? "Ubah Paket Latihan" : "Buat Paket Latihan"}
        sub="Pilih soal terbit untuk satu mapel dan satu kelas."
      />
      <form
        action={formAction}
        className="mt-5 grid gap-5 xl:grid-cols-5"
      >
        {paket && <input type="hidden" name="id" value={paket.id} />}
        <section className={`${card} space-y-4 p-6 xl:col-span-2`}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={lab}>
              Mapel
              {kunci && <input type="hidden" name="mapelId" value={mapelId} />}
              <select
                name={kunci ? undefined : "mapelId"}
                value={mapelId}
                onChange={(e) => gantiMapel(e.target.value)}
                disabled={kunci}
                className={`${inp} mt-1 w-full disabled:bg-slate-100`}
              >
                {mapels.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama}
                  </option>
                ))}
              </select>
            </label>
            <label className={lab}>
              Kelas
              {kunci && <input type="hidden" name="kelas" value={kelas} />}
              <select
                name={kunci ? undefined : "kelas"}
                value={kelas}
                onChange={(e) => gantiKelas(e.target.value)}
                disabled={kunci}
                className={`${inp} mt-1 w-full disabled:bg-slate-100`}
              >
                <option value="5">Kelas 5</option>
                <option value="6">Kelas 6</option>
              </select>
            </label>
          </div>
          {kunci && (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
              Mapel dan kelas terkunci karena paket sudah dikerjakan siswa.
            </p>
          )}
          <label className={lab}>
            Judul Paket
            <input
              name="judul"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              required
              placeholder="Contoh: Latihan Soal 2"
              className={`${inp} mt-1 w-full`}
            />
          </label>
          <label className={lab}>
            Deskripsi
            <textarea
              name="deskripsi"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              rows={3}
              placeholder="Opsional"
              className={`${inp} mt-1 w-full`}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className={lab}>
              Urutan
              <input
                name="urutan"
                type="number"
                min={0}
                value={urutan}
                onChange={(e) => setUrutan(e.target.value)}
                className={`${inp} mt-1 w-full`}
              />
            </label>
            <label className={lab}>
              Durasi (menit)
              <input
                name="durasiMenit"
                type="number"
                min={1}
                max={120}
                value={durasiMenit}
                onChange={(e) => setDurasiMenit(e.target.value)}
                className={`${inp} mt-1 w-full`}
              />
            </label>
            <label className={lab}>
              Status
              <select
                name="status"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value === "TERBIT" ? "TERBIT" : "DRAF")
                }
                className={`${inp} mt-1 w-full`}
              >
                <option value="DRAF">Draf</option>
                <option value="TERBIT">Terbit</option>
              </select>
            </label>
          </div>
        </section>

        <section className={`${card} p-6 xl:col-span-3`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold">Pilih Soal</h2>
              <p className="text-xs text-slate-500">
                {selected.size} soal dipilih
                {terpilihDiTampilan !== selected.size
                  ? `, ${terpilihDiTampilan} tampil di filter`
                  : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setSelected((prev) => {
                    const next = new Set(prev);
                    for (const item of filtered) next.add(item.id);
                    return next;
                  })
                }
                className="rounded-xl bg-blue-50 hover:bg-blue-100 px-3 py-2 text-xs font-bold text-blue-700"
              >
                Pilih tampil
              </button>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-bold text-slate-600"
              >
                Kosongkan
              </button>
            </div>
          </div>
          <input
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari soal atau topik..."
            className={`${inp} mt-4 w-full`}
          />
          <div className="mt-3 max-h-[560px] space-y-2 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                Belum ada soal terbit untuk mapel dan kelas ini.
              </p>
            ) : (
              filtered.map((item, index) => (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 p-3 hover:border-blue-300"
                >
                  <input
                    type="checkbox"
                    name="soalIds"
                    value={item.id}
                    checked={selected.has(item.id)}
                    onChange={(e) => toggle(item.id, e.target.checked)}
                    className="mt-1 h-4 w-4"
                  />
                  <span className="min-w-0">
                    <span className="text-xs font-bold text-slate-400">
                      {index + 1}.
                    </span>{" "}
                    <span className="text-sm font-semibold">{item.teks}</span>
                    {item.topik && (
                      <span className="ml-2 rounded bg-accent/10 px-2 py-1 text-xs font-semibold text-accent">
                        {item.topik}
                      </span>
                    )}
                  </span>
                </label>
              ))
            )}
          </div>
        </section>

        <div className="xl:col-span-5">
          {state.error && (
            <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
              {state.error}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Link
              href="/guru/latihan"
              className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600"
            >
              Batal
            </Link>
            <button
              disabled={pending || selected.size === 0}
              className={`${btn} disabled:opacity-60`}
            >
              {pending ? "Menyimpan..." : "Simpan Paket"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
