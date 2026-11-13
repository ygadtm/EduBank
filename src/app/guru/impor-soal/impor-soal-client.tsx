"use client";

import { useEffect, useRef, useState } from "react";
import { btn, card, inp, PageHead } from "@/components/ui";
import { buatUploadUrl, imporSoal } from "@/lib/actions/impor";
import {
  EKSTENSI_IMPOR,
  MAX_FILE_BYTES,
  ekstensiFile,
  validasiDraft,
  type SoalDraft,
} from "@/lib/impor-types";

type MapelOption = { id: string; nama: string };
type Draft = SoalDraft & { disertakan: boolean };
type Sibuk = "ekstrak" | "simpan" | null;

const lab = "block text-xs font-bold text-slate-600";

const CONTOH = `pertanyaan,pilihan_a,pilihan_b,pilihan_c,pilihan_d,kunci,topik,pembahasan
"Hasil dari 3/4 + 1/2 adalah ...",1,5/4,1/4,2,B,Pecahan,"3/4 + 1/2 = 5/4."`;

async function ringankanGambar(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= 1.5 * 1024 * 1024) {
    return file;
  }
  try {
    const bitmap = await createImageBitmap(file);
    const sisi = 2000;
    const skala = Math.min(1, sisi / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * skala);
    canvas.height = Math.round(bitmap.height * skala);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.82),
    );
    if (!blob) return file;
    const nama = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], nama, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export default function ImporSoalClient({
  mapels,
  kelasList,
}: {
  mapels: MapelOption[];
  kelasList: number[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mapelId, setMapelId] = useState(mapels[0]?.id ?? "");
  const [kelas, setKelas] = useState(String(kelasList[0] ?? 5));
  const [topik, setTopik] = useState("");
  const [status, setStatus] = useState<"DRAF" | "TERBIT">("DRAF");
  const [berkas, setBerkas] = useState<File | null>(null);
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [sibuk, setSibuk] = useState<Sibuk>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 8000);
    return () => clearTimeout(timer);
  }, [error]);

  function ubahDraft(i: number, patch: Partial<Draft>) {
    setDrafts((lama) =>
      lama ? lama.map((item, j) => (j === i ? { ...item, ...patch } : item)) : lama,
    );
  }

  function ubahPilihan(i: number, k: number, nilai: string) {
    setDrafts((lama) =>
      lama
        ? lama.map((item, j) =>
            j === i
              ? {
                  ...item,
                  pilihan: item.pilihan.map((p, x) => (x === k ? nilai : p)),
                }
              : item,
          )
        : lama,
    );
  }

  async function handleEkstrak() {
    if (!berkas) {
      setError("Pilih file terlebih dahulu.");
      return;
    }
    setError("");
    setSibuk("ekstrak");
    try {
      const siap = await ringankanGambar(berkas);
      if (!EKSTENSI_IMPOR.includes(ekstensiFile(siap.name))) {
        throw new Error("Format file harus JPG, PNG, PDF, XLSX, atau XLS.");
      }
      if (siap.size > MAX_FILE_BYTES) {
        throw new Error("Ukuran file maksimal 10 MB.");
      }

      let info: Awaited<ReturnType<typeof buatUploadUrl>>;
      try {
        info = await buatUploadUrl({
          nama: siap.name,
          ukuran: siap.size,
          mime: siap.type,
        });
      } catch {
        throw new Error("Server tidak merespons. Pastikan npm run dev berjalan, lalu coba lagi.");
      }
      if ("error" in info) throw new Error(info.error);

      const form = new FormData();
      form.append("cacheControl", "3600");
      form.append("", siap);
      let unggah: Response;
      try {
        unggah = await fetch(info.signedUrl, {
          method: "PUT",
          headers: { "x-upsert": "false" },
          body: form,
        });
      } catch {
        throw new Error(
          "Tidak dapat terhubung ke Supabase Storage. Periksa SUPABASE_URL dan koneksi internet.",
        );
      }
      if (!unggah.ok) throw new Error("Gagal mengunggah file. Coba lagi.");

      let res: Response;
      try {
        res = await fetch("/api/import-soal/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: info.path, mime: siap.type, nama: siap.name }),
        });
      } catch {
        throw new Error("Server tidak merespons. Pastikan npm run dev berjalan, lalu coba lagi.");
      }
      const data = (await res.json()) as { soal?: SoalDraft[]; error?: string };
      if (!res.ok || !data.soal) {
        throw new Error(data.error ?? "Gagal mengekstrak soal.");
      }

      setDrafts(data.soal.map((item) => ({ ...item, disertakan: true })));
      setBerkas(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengekstrak soal.");
    } finally {
      setSibuk(null);
    }
  }

  async function handleSimpan() {
    if (!drafts) return;
    const dipilih = drafts.filter((item) => item.disertakan);
    if (dipilih.length === 0) {
      setError("Pilih minimal satu soal untuk diimpor.");
      return;
    }
    for (let i = 0; i < dipilih.length; i += 1) {
      const salah = validasiDraft(dipilih[i]);
      if (salah) {
        setError(`Soal ${i + 1} belum lengkap: ${salah}`);
        return;
      }
    }

    setError("");
    setSibuk("simpan");
    try {
      const hasil = await imporSoal({
        mapelId,
        kelas: Number(kelas),
        topik,
        status,
        soal: dipilih.map(({ teks, pilihan, kunci, topik: t, pembahasan }) => ({
          teks,
          pilihan,
          kunci,
          topik: t,
          pembahasan,
        })),
      });
      if (hasil?.error) setError(hasil.error);
    } catch {
      setError("Gagal menyimpan soal. Coba lagi.");
    } finally {
      setSibuk(null);
    }
  }

  const jumlahTerpilih = drafts?.filter((item) => item.disertakan).length ?? 0;

  return (
    <>
      <PageHead
        title="Impor Soal dari File"
        sub="Unggah foto, PDF, atau Excel. Periksa hasilnya sebelum menyimpan."
      />

      <div className="mt-5 grid gap-5 xl:grid-cols-5">
        <section className={`${card} space-y-4 p-6 xl:col-span-2`}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={lab}>
              Mapel
              <select
                value={mapelId}
                onChange={(e) => setMapelId(e.target.value)}
                className={`${inp} mt-1 w-full`}
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
              <select
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className={`${inp} mt-1 w-full`}
              >
                {kelasList.map((item) => (
                  <option key={item} value={item}>
                    Kelas {item}
                  </option>
                ))}
              </select>
            </label>
            <label className={lab}>
              Topik default
              <input
                value={topik}
                onChange={(e) => setTopik(e.target.value)}
                placeholder="Contoh: Pecahan"
                className={`${inp} mt-1 w-full`}
              />
            </label>
            <label className={lab}>
              Status
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value === "TERBIT" ? "TERBIT" : "DRAF")
                }
                className={`${inp} mt-1 w-full`}
              >
                <option value="DRAF">Simpan sebagai Draf</option>
                <option value="TERBIT">Terbitkan</option>
              </select>
            </label>
          </div>

          <label className={lab}>
            File soal
            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf,.xlsx,.xls"
              onChange={(e) => setBerkas(e.target.files?.[0] ?? null)}
              className={`${inp} mt-1 w-full file:mr-3 file:rounded file:border-0 file:bg-accent/10 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-accent`}
            />
          </label>

          <p className="text-xs text-muted">
            JPG, PNG, PDF, XLSX, atau XLS. Maksimal 10 MB dan 30 soal per impor.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleEkstrak}
              disabled={sibuk !== null || !berkas}
              className={`${btn} disabled:opacity-60`}
            >
              {sibuk === "ekstrak" ? "Mengekstrak..." : "Ekstrak Soal"}
            </button>
            <a
              href="/api/import-soal/template"
              className={`${inp} font-bold hover:border-accent`}
            >
              Unduh Template Excel
            </a>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600"
            >
              {error}
            </p>
          )}

          <details className="rounded-xl border border-line p-3 text-xs text-muted">
            <summary className="cursor-pointer font-bold text-slate-600">
              Format Excel yang didukung
            </summary>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all rounded bg-paper p-2 text-[11px]">
              {CONTOH}
            </pre>
            <p className="mt-2">
              Kolom: pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d,
              kunci, topik, pembahasan. Kunci boleh A/B/C/D atau 1-4.
            </p>
          </details>
        </section>

        <section className="space-y-4 xl:col-span-3">
          {!drafts && (
            <div className={`${card} p-8 text-center text-sm text-muted`}>
              Hasil ekstraksi akan tampil di sini untuk diperiksa dan diedit.
            </div>
          )}

          {drafts && (
            <>
              <div className={`${card} flex flex-wrap items-center justify-between gap-3 p-4`}>
                <p className="text-sm font-bold text-ink">
                  {jumlahTerpilih} dari {drafts.length} soal dipilih
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setDrafts((lama) =>
                        lama ? lama.map((item) => ({ ...item, disertakan: true })) : lama,
                      )
                    }
                    className="rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-bold text-slate-600"
                  >
                    Pilih semua
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDrafts(null);
                      setError("");
                    }}
                    className="rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-bold text-slate-600"
                  >
                    Batal
                  </button>
                </div>
              </div>

              {drafts.map((draft, i) => {
                const salah = validasiDraft(draft);
                return (
                  <div key={i} className={`${card} space-y-3 p-5`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <input
                            type="checkbox"
                            checked={draft.disertakan}
                            onChange={(e) => ubahDraft(i, { disertakan: e.target.checked })}
                            className="h-4 w-4"
                          />
                          Sertakan
                        </label>
                        <span className="text-sm font-bold text-ink">Soal {i + 1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {salah ? (
                          <span className="rounded bg-highlight/20 px-2 py-1 text-[11px] font-bold text-ink">
                            {salah}
                          </span>
                        ) : (
                          <span className="rounded bg-success/15 px-2 py-1 text-[11px] font-bold text-success">
                            Lengkap
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setDrafts((lama) =>
                              lama ? lama.filter((_, j) => j !== i) : lama,
                            )
                          }
                          className="text-xs font-bold text-red-600 hover:underline"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>

                    <label className={lab}>
                      Pertanyaan
                      <textarea
                        value={draft.teks}
                        onChange={(e) => ubahDraft(i, { teks: e.target.value })}
                        rows={3}
                        className={`${inp} mt-1 w-full`}
                      />
                    </label>

                    <div className="space-y-2">
                      {draft.pilihan.map((nilai, k) => (
                        <div key={k} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`kunci-${i}`}
                            checked={draft.kunci === k}
                            onChange={() => ubahDraft(i, { kunci: k })}
                            aria-label={`Kunci jawaban ${"ABCD"[k]}`}
                            className="h-4 w-4"
                          />
                          <span className="w-5 font-bold text-slate-400">
                            {"ABCD"[k]}.
                          </span>
                          <input
                            value={nilai}
                            onChange={(e) => ubahPilihan(i, k, e.target.value)}
                            placeholder={`Pilihan ${"ABCD"[k]}`}
                            className={`${inp} flex-1`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className={lab}>
                        Topik
                        <input
                          value={draft.topik}
                          onChange={(e) => ubahDraft(i, { topik: e.target.value })}
                          className={`${inp} mt-1 w-full`}
                        />
                      </label>
                      <label className={lab}>
                        Pembahasan
                        <input
                          value={draft.pembahasan}
                          onChange={(e) => ubahDraft(i, { pembahasan: e.target.value })}
                          className={`${inp} mt-1 w-full`}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}

              <div className={`${card} flex flex-wrap items-center justify-between gap-3 p-5`}>
                <p className="text-xs text-muted">
                  Soal yang belum lengkap tidak dapat disimpan.
                </p>
                <button
                  type="button"
                  onClick={handleSimpan}
                  disabled={sibuk !== null || jumlahTerpilih === 0}
                  className={`${btn} disabled:opacity-60`}
                >
                  {sibuk === "simpan"
                    ? "Menyimpan..."
                    : `Impor ${jumlahTerpilih} Soal`}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
