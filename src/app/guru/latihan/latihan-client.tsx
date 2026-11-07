"use client";

import { useActionState, useState } from "react";
import {
  getBankSoalUntukPaket,
  hapusPaket,
  hapusSoalDariPaket,
  simpanMetaPaket,
  simpanSoalKePaket,
  tambahSoalBankKePaket,
  type MetaPaketState,
  type SoalPaketState,
} from "@/lib/actions/paket-latihan";
import { MapelBadge, PageHead, StatusBadge, btn, card, inp } from "@/components/ui";
import { mapelMeta } from "@/lib/mapel";

const lab = "block text-xs font-bold text-slate-600";

type Mapel = { id: string; slug: string; nama: string };
type Pilihan = { id: string; teks: string; benar: boolean; urutan: number };
type Soal = {
  id: string;
  teks: string;
  topik: string | null;
  pembahasan: string | null;
  pilihan: Pilihan[];
};
type SoalBank = { id: string; teks: string; topik: string | null; mapelId: string; kelas: number };
type Paket = {
  id: string;
  judul: string;
  deskripsi: string | null;
  kelas: number;
  urutan: number;
  durasiMenit: number;
  status: "DRAF" | "TERBIT";
  mapelId: string;
  mapel: { slug: string; nama: string };
  soal: { soalId: string; soal: Soal }[];
  _count: { latihan: number };
};

export default function LatihanClient({
  mapels,
  pakets,
}: {
  mapels: Mapel[];
  pakets: Paket[];
}) {
  const [paketAktif, setPaketAktif] = useState<Paket | null>(null);
  const [buatPaket, setBuatPaket] = useState(false);
  const [soalEdit, setSoalEdit] = useState<Soal | null>(null);
  const [buatSoal, setBuatSoal] = useState(false);

  const soalList = paketAktif?.soal.map((s) => s.soal) ?? [];

  return (
    <>
      <PageHead icon="📚" title="Paket Latihan" sub="Kelola paket dan soal latihan." />
      <div className="mt-5 grid gap-5 xl:grid-cols-5 xl:items-start">
        <aside className="space-y-3 xl:col-span-2 xl:sticky xl:top-4 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto xl:pr-1">
          <button
            onClick={() => { setBuatPaket(true); setPaketAktif(null); setSoalEdit(null); setBuatSoal(false); }}
            className={`${btn} w-full`}
          >
            + Buat Paket Baru
          </button>
          {buatPaket && (
            <FormMetaPaket mapels={mapels} onSelesai={() => setBuatPaket(false)} />
          )}
          {pakets.length === 0 && !buatPaket && (
            <p className={`${card} px-4 py-6 text-center text-sm text-slate-500`}>
              Belum ada paket. Buat paket pertama.
            </p>
          )}
          {pakets.map((p) => {
            const meta = mapelMeta(p.mapel.slug);
            const aktif = paketAktif?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => { setPaketAktif(p); setBuatPaket(false); setSoalEdit(null); setBuatSoal(false); }}
                className={`${card} cursor-pointer p-4 transition-all ${aktif ? "ring-2 ring-blue-500" : "hover:ring-1 hover:ring-slate-300"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{p.judul}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <MapelBadge nama={p.mapel.nama} color={meta.color} bg={meta.bg} />
                      <span className="text-xs text-slate-500">Kelas {p.kelas}</span>
                      <StatusBadge s={p.status === "TERBIT" ? "Terbit" : "Draf"} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {p.soal.length} soal · {p.durasiMenit} menit
                    </p>
                  </div>
                  <TombolHapusPaket id={p.id} terkunci={p._count.latihan > 0} />
                </div>
              </div>
            );
          })}
        </aside>

        <section className="xl:col-span-3 xl:sticky xl:top-4 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto xl:pr-1">
          {!paketAktif && !buatPaket && (
            <div className={`${card} p-8 text-center text-sm text-slate-500`}>
              Pilih paket di kiri untuk mengelola soalnya.
            </div>
          )}
          {paketAktif && (
            <div className="space-y-4">
              <div className={`${card} p-5`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold">{paketAktif.judul}</h2>
                    <p className="text-xs text-slate-500">
                      {soalList.length} soal · {paketAktif.durasiMenit} menit
                    </p>
                  </div>
                  <button
                    onClick={() => { setBuatSoal(true); setSoalEdit(null); }}
                    className={btn}
                  >
                    + Tambah Soal
                  </button>
                </div>
              </div>

              {(buatSoal || soalEdit) && (
                <FormSoalPaket
                  paketId={paketAktif.id}
                  soal={soalEdit}
                  onSelesai={() => { setBuatSoal(false); setSoalEdit(null); }}
                />
              )}

              {soalList.length === 0 && !buatSoal && !soalEdit && (
                <div className={`${card} px-4 py-6 text-center text-sm text-slate-500`}>
                  Paket ini belum punya soal. Klik "+ Tambah Soal" untuk mulai.
                </div>
              )}

              {soalList.map((s, i) => (
                <div key={s.id} className={`${card} p-5`}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">
                      <span className="mr-2 text-slate-400">{i + 1}.</span>
                      {s.teks}
                    </p>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => { setSoalEdit(s); setBuatSoal(false); }}
                        className="text-sm font-bold text-blue-700"
                      >
                        Ubah
                      </button>
                      <TombolHapusSoal paketId={paketAktif.id} soalId={s.id} />
                    </div>
                  </div>
                  <div className="mt-3 grid gap-1.5">
                    {s.pilihan.map((p, k) => (
                      <div
                        key={p.id}
                        className={`rounded-xl border px-3 py-2 text-sm ${p.benar ? "border-emerald-400 bg-emerald-50 font-bold text-emerald-800" : "border-slate-100 text-slate-600"}`}
                      >
                        <span className="mr-2 font-bold text-slate-400">{"ABCD"[k]}.</span>
                        {p.teks}
                        {p.benar && <span className="ml-2 text-xs">✓ Kunci</span>}
                      </div>
                    ))}
                  </div>
                  {s.topik && (
                    <span className="mt-2 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                      {s.topik}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function FormMetaPaket({ mapels, paket, onSelesai }: { mapels: Mapel[]; paket?: Paket; onSelesai: () => void }) {
  const [state, formAction, pending] = useActionState<MetaPaketState, FormData>(simpanMetaPaket, { error: "" });
  return (
    <div className={`${card} p-5`}>
      <p className="mb-3 text-sm font-bold">{paket ? "Ubah Metadata Paket" : "Paket Baru"}</p>
      <form action={formAction} className="space-y-3">
        {paket && <input type="hidden" name="id" value={paket.id} />}
        <label className={lab}>
          Mapel
          <select name="mapelId" defaultValue={paket?.mapelId ?? mapels[0]?.id} className={`${inp} mt-1 w-full`}>
            {mapels.map((m) => <option key={m.id} value={m.id}>{m.nama}</option>)}
          </select>
        </label>
        <label className={lab}>
          Kelas
          <select name="kelas" defaultValue={paket?.kelas ?? 6} className={`${inp} mt-1 w-full`}>
            <option value={5}>Kelas 5</option>
            <option value={6}>Kelas 6</option>
          </select>
        </label>
        <label className={lab}>
          Judul Paket
          <input name="judul" required defaultValue={paket?.judul} placeholder="Contoh: Latihan Soal 1" className={`${inp} mt-1 w-full`} />
        </label>
        <label className={lab}>
          Deskripsi
          <textarea name="deskripsi" defaultValue={paket?.deskripsi ?? ""} rows={2} placeholder="Opsional" className={`${inp} mt-1 w-full`} />
        </label>
        <div className="grid grid-cols-3 gap-3">
          <label className={lab}>
            Urutan
            <input name="urutan" type="number" min={0} defaultValue={paket?.urutan ?? 0} className={`${inp} mt-1 w-full`} />
          </label>
          <label className={lab}>
            Durasi (menit)
            <input name="durasiMenit" type="number" min={1} max={120} defaultValue={paket?.durasiMenit ?? 5} className={`${inp} mt-1 w-full`} />
          </label>
          <label className={lab}>
            Status
            <select name="status" defaultValue={paket?.status ?? "DRAF"} className={`${inp} mt-1 w-full`}>
              <option value="DRAF">Draf</option>
              <option value="TERBIT">Terbit</option>
            </select>
          </label>
        </div>
        {state.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{state.error}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={onSelesai} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">Batal</button>
          <button disabled={pending} className={`${btn} disabled:opacity-60`}>{pending ? "Menyimpan..." : "Simpan Paket"}</button>
        </div>
      </form>
    </div>
  );
}

function FormSoalPaket({ paketId, soal, onSelesai }: { paketId: string; soal: Soal | null; onSelesai: () => void }) {
  const [mode, setMode] = useState<"baru" | "bank">("baru");
  const [state, formAction, pending] = useActionState<SoalPaketState, FormData>(simpanSoalKePaket, { error: "" });
  const [bank, setBank] = useState<SoalBank[] | null>(null);
  const [loadingBank, setLoadingBank] = useState(false);
  const [busyBank, setBusyBank] = useState<string | null>(null);
  const [errBank, setErrBank] = useState("");
  const [cari, setCari] = useState("");

  const awal = soal?.pilihan.sort((a, b) => a.urutan - b.urutan).map((p) => p.teks) ?? [];
  const [o, setO] = useState([awal[0] ?? "", awal[1] ?? "", awal[2] ?? "", awal[3] ?? ""]);
  const [kunci, setKunci] = useState(soal?.pilihan.findIndex((p) => p.benar) ?? 0);

  async function bukaBankSoal() {
    setMode("bank");
    if (bank !== null) return;
    setLoadingBank(true);
    const hasil = await getBankSoalUntukPaket(paketId);
    setBank(hasil);
    setLoadingBank(false);
  }

  const bankFiltered = (bank ?? []).filter(
    (s) => !cari || s.teks.toLowerCase().includes(cari.toLowerCase()) || (s.topik ?? "").toLowerCase().includes(cari.toLowerCase()),
  );

  async function pilihDariBank(soalId: string) {
    setBusyBank(soalId);
    setErrBank("");
    const hasil = await tambahSoalBankKePaket(paketId, soalId);
    setBusyBank(null);
    if ("error" in hasil) { setErrBank(hasil.error); return; }
    onSelesai();
  }

  return (
    <div className={`${card} p-5`}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-bold">{soal ? "Ubah Soal" : "Tambah Soal"}</p>
        {!soal && (
          <div className="flex overflow-hidden rounded-xl border border-slate-200 text-xs font-bold">
            <button type="button" onClick={() => setMode("baru")} className={`px-3 py-1.5 ${mode === "baru" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
              Buat Baru
            </button>
            <button type="button" onClick={bukaBankSoal} className={`px-3 py-1.5 ${mode === "bank" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
              Dari Bank Soal{bank !== null ? ` (${bank.length})` : ""}
            </button>
          </div>
        )}
      </div>

      {mode === "bank" && !soal ? (
        <div className="space-y-3">
          {loadingBank ? (
            <p className="py-6 text-center text-sm text-slate-500">Memuat soal...</p>
          ) : (
            <>
              <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari soal atau topik..." className={`${inp} w-full`} />
              {errBank && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{errBank}</p>}
              {bank?.length === 0 ? (
                <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  Tidak ada soal di bank soal untuk mapel dan kelas ini.
                </p>
              ) : bankFiltered.length === 0 ? (
                <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Tidak ada soal yang cocok.</p>
              ) : (
                <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {bankFiltered.map((s) => (
                    <div key={s.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 p-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{s.teks}</p>
                        {s.topik && <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">{s.topik}</span>}
                      </div>
                      <button type="button" disabled={busyBank === s.id} onClick={() => pilihDariBank(s.id)} className={`${btn} shrink-0 py-1.5 text-xs disabled:opacity-60`}>
                        {busyBank === s.id ? "..." : "Tambah"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          <button type="button" onClick={onSelesai} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">Batal</button>
        </div>
      ) : (
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="paketId" value={paketId} />
          {soal && <input type="hidden" name="soalId" value={soal.id} />}
          <label className={lab}>
            Pertanyaan
            <textarea name="teks" required defaultValue={soal?.teks} rows={3} placeholder="Tulis pertanyaan di sini" className={`${inp} mt-1 w-full`} />
          </label>
          <label className={lab}>
            Topik (opsional)
            <input name="topik" defaultValue={soal?.topik ?? ""} placeholder="Contoh: Pecahan" className={`${inp} mt-1 w-full`} />
          </label>
          <div>
            <p className="mb-2 text-xs font-bold text-slate-600">Pilihan jawaban (pilih bulatan untuk kunci)</p>
            <div className="space-y-2">
              {o.map((v, k) => (
                <label key={k} className="flex items-center gap-2">
                  <input type="radio" name="kunci" value={k} checked={kunci === k} onChange={() => setKunci(k)} className="h-4 w-4" />
                  <span className="w-5 font-bold text-slate-400">{"ABCD"[k]}.</span>
                  <input name="pilihan" value={v} onChange={(e) => setO(o.map((x, j) => (j === k ? e.target.value : x)))} placeholder={`Pilihan ${"ABCD"[k]}`} className={`${inp} flex-1`} />
                </label>
              ))}
            </div>
          </div>
          <label className={lab}>
            Pembahasan (opsional)
            <textarea name="pembahasan" defaultValue={soal?.pembahasan ?? ""} rows={2} placeholder="Jelaskan jawaban yang benar" className={`${inp} mt-1 w-full`} />
          </label>
          {state.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{state.error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onSelesai} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">Batal</button>
            <button disabled={pending} className={`${btn} disabled:opacity-60`}>{pending ? "Menyimpan..." : soal ? "Simpan Perubahan" : "Tambah Soal"}</button>
          </div>
        </form>
      )}
    </div>
  );
}

function TombolHapusPaket({ id, terkunci }: { id: string; terkunci: boolean }) {
  const [busy, setBusy] = useState(false);
  if (terkunci) return null;
  return (
    <button
      disabled={busy}
      onClick={async (e) => {
        e.stopPropagation();
        if (!confirm("Hapus paket ini?")) return;
        setBusy(true);
        const hasil = await hapusPaket(id);
        setBusy(false);
        if ("error" in hasil) alert(hasil.error);
      }}
      className="shrink-0 text-xs font-bold text-red-500 disabled:opacity-50"
    >
      {busy ? "..." : "Hapus"}
    </button>
  );
}

function TombolHapusSoal({ paketId, soalId }: { paketId: string; soalId: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={busy}
      onClick={async () => {
        if (!confirm("Hapus soal ini dari paket?")) return;
        setBusy(true);
        const hasil = await hapusSoalDariPaket(paketId, soalId);
        setBusy(false);
        if ("error" in hasil) alert(hasil.error);
      }}
      className="text-sm font-bold text-red-500 disabled:opacity-50"
    >
      {busy ? "..." : "Hapus"}
    </button>
  );
}
