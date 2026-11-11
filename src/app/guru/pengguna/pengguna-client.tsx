"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { hapusGuru, resetPasswordGuru, tambahGuru, setGuruMapel } from "@/lib/actions/pengguna";
import { btn, card, inp } from "@/components/ui";

type GuruMapelItem = { mapelId: string; kelas: number };

type Guru = {
  id: string;
  nama: string;
  nisNip: string;
  admin: boolean;
  idDiri: boolean;
  guruMapel: GuruMapelItem[];
};

type Mapel = { id: string; nama: string };

export default function PenggunaClient({
  gurus,
  mapels,
}: {
  gurus: Guru[];
  mapels: Mapel[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [state, formAction, pending] = useActionState(tambahGuru, { error: "" });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [assignId, setAssignId] = useState<string | null>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  async function hapus(g: Guru) {
    if (!confirm(`Hapus akun guru ${g.nama} (NIP ${g.nisNip})?`)) return;
    setBusyId(g.id);
    const hasil = await hapusGuru(g.id);
    setBusyId(null);
    if ("error" in hasil) alert(hasil.error);
    else router.refresh();
  }

  async function reset(g: Guru) {
    if (!confirm(`Reset password ${g.nama} ke NIP ${g.nisNip}? Guru wajib ganti password saat login berikutnya.`)) return;
    setBusyId(g.id);
    const hasil = await resetPasswordGuru(g.id);
    setBusyId(null);
    if ("error" in hasil) alert(hasil.error);
    else router.refresh();
  }

  const assigningGuru = assignId ? gurus.find((g) => g.id === assignId) ?? null : null;

  return (
    <>
      <section className={`${card} mt-3 p-5`}>
        <h2 className="font-bold">Tambah Guru</h2>
        <form ref={formRef} action={formAction} className="mt-3 flex flex-wrap items-end gap-3">
          <label className="min-w-[200px] flex-1 text-sm">
            <span className="mb-1 block font-semibold text-slate-700">Nama</span>
            <input name="nama" required className={`${inp} w-full`} placeholder="Nama guru" />
          </label>
          <label className="w-full text-sm sm:w-44">
            <span className="mb-1 block font-semibold text-slate-700">NIP</span>
            <input name="nisNip" required inputMode="numeric" className={`${inp} w-full`} placeholder="NIP" />
          </label>
          <label className="w-full text-sm sm:w-48">
            <span className="mb-1 block font-semibold text-slate-700">Kata sandi</span>
            <input name="password" required minLength={8} className={`${inp} w-full`} placeholder="Minimal 8 karakter" />
          </label>
          <button disabled={pending} className={`${btn} disabled:opacity-60`}>
            {pending ? "Menyimpan..." : "Tambah Guru"}
          </button>
        </form>
        {state.error && <p className="mt-3 text-sm text-rose-600">{state.error}</p>}
        {state.ok && <p className="mt-3 text-sm text-emerald-600">Guru berhasil ditambahkan.</p>}
      </section>

      <section className="mt-3 rounded-2xl bg-white shadow-[0_2px_12px_rgba(30,64,175,.08)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-slate-500">
              <th className="px-4 py-3 font-semibold">Nama</th>
              <th className="px-4 py-3 font-semibold">NIP</th>
              <th className="px-4 py-3 font-semibold">Peran</th>
              <th className="px-4 py-3 font-semibold">Mapel & Kelas</th>
              <th className="px-4 py-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {gurus.map((g) => (
              <tr key={g.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <b>{g.nama}</b>
                  {g.idDiri && <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">Anda</span>}
                </td>
                <td className="px-4 py-3 text-slate-600">{g.nisNip}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      g.admin ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {g.admin ? "Admin" : "Guru"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {g.guruMapel.length === 0 ? (
                    <span className="italic">Belum ada</span>
                  ) : (
                    <span>
                      {[5, 6].map((kelas) => {
                        const ids = g.guruMapel.filter((x) => x.kelas === kelas).map((x) => x.mapelId);
                        if (ids.length === 0) return null;
                        const names = ids.map((id) => mapels.find((m) => m.id === id)?.nama ?? id).join(", ");
                        return <span key={kelas} className="block">Kelas {kelas}: {names}</span>;
                      })}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {g.idDiri ? (
                    <span className="text-xs text-slate-400">Tidak bisa diubah</span>
                  ) : (
                    <span className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setAssignId(g.id)}
                        className="font-bold text-emerald-700"
                      >
                        Assign mapel
                      </button>
                      <button
                        disabled={busyId === g.id}
                        onClick={() => reset(g)}
                        className="font-bold text-blue-700 disabled:opacity-50"
                      >
                        Reset password
                      </button>
                      <button
                        disabled={busyId === g.id}
                        onClick={() => hapus(g)}
                        className="font-bold text-red-500 disabled:opacity-50"
                      >
                        Hapus
                      </button>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {assigningGuru && (
        <AssignModal
          guru={assigningGuru}
          mapels={mapels}
          onClose={() => setAssignId(null)}
          onSaved={() => { setAssignId(null); router.refresh(); }}
        />
      )}
    </>
  );
}

function AssignModal({
  guru,
  mapels,
  onClose,
  onSaved,
}: {
  guru: Guru;
  mapels: Mapel[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(
    new Set(guru.guruMapel.map((x) => `${x.mapelId}:${x.kelas}`)),
  );

  function toggle(mapelId: string, kelas: number) {
    const key = `${mapelId}:${kelas}`;
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function simpan() {
    setBusy(true);
    const assignments = [...checked].map((key) => {
      const [mapelId, kelas] = key.split(":");
      return { mapelId, kelas: Number(kelas) };
    });
    await setGuruMapel(guru.id, assignments);
    setBusy(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`${card} w-full max-w-lg p-6`}>
        <h2 className="font-bold">Assign Mapel — {guru.nama}</h2>
        <p className="mt-1 text-xs text-slate-500">Centang mapel dan kelas yang diajar guru ini.</p>
        <div className="mt-4 grid grid-cols-2 gap-x-6">
          {[5, 6].map((kelas) => (
            <div key={kelas}>
              <p className="mb-2 text-xs font-bold text-slate-600">Kelas {kelas}</p>
              <div className="space-y-1.5">
                {mapels.map((m) => {
                  const key = `${m.id}:${kelas}`;
                  return (
                    <label key={m.id} className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked.has(key)}
                        onChange={() => toggle(m.id, kelas)}
                        className="h-4 w-4"
                      />
                      {m.nama}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
            Batal
          </button>
          <button disabled={busy} onClick={simpan} className={`${btn} disabled:opacity-60`}>
            {busy ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
