"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { resetPasswordSiswa, tambahSiswa } from "@/lib/actions/siswa";
import { Tabel, btn, card, inp } from "@/components/ui";

type Siswa = {
  id: string;
  nama: string;
  nisNip: string;
  kelas: number | null;
  aktif: boolean;
  harusGantiPassword: boolean;
};

export function TambahSiswaForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(tambahSiswa, {});

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <section className={`${card} mt-3 p-5`}>
      <h2 className="font-bold">Tambah Siswa</h2>
      <form ref={formRef} action={formAction} className="mt-3 flex flex-wrap items-end gap-3">
        <label className="min-w-[200px] flex-1 text-sm">
          <span className="mb-1 block font-semibold text-slate-700">Nama</span>
          <input name="nama" required className={`${inp} w-full`} placeholder="Nama siswa" />
        </label>
        <label className="w-full text-sm sm:w-44">
          <span className="mb-1 block font-semibold text-slate-700">NIS</span>
          <input name="nisNip" required inputMode="numeric" className={`${inp} w-full`} placeholder="NIS" />
        </label>
        <label className="w-full text-sm sm:w-36">
          <span className="mb-1 block font-semibold text-slate-700">Kelas</span>
          <select name="kelas" required defaultValue="" className={`${inp} w-full`}>
            <option value="" disabled>Pilih</option>
            <option value="5">Kelas 5</option>
            <option value="6">Kelas 6</option>
          </select>
        </label>
        <button disabled={pending} className={`${btn} disabled:opacity-60`}>
          {pending ? "Menyimpan..." : "Tambah Siswa"}
        </button>
      </form>
      {state.error && <p className="mt-3 text-sm text-rose-600">{state.error}</p>}
      {state.ok && <p className="mt-3 text-sm text-emerald-600">Siswa berhasil ditambahkan.</p>}
    </section>
  );
}

export function SiswaTable({ siswa }: { siswa: Siswa[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function reset(id: string, nama: string, nis: string) {
    if (!confirm(`Reset password ${nama} ke NIS ${nis}?`)) return;
    setBusy(true);
    const hasil = await resetPasswordSiswa(id);
    setBusy(false);
    if ("error" in hasil) alert(hasil.error);
    else router.refresh();
  }

  const rows = siswa.map((s) => [
    <b key="n">{s.nama}</b>,
    s.nisNip,
    s.kelas ? `Kelas ${s.kelas}` : "-",
    <span
      key="s"
      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
        !s.aktif
          ? "bg-slate-100 text-slate-600"
          : s.harusGantiPassword
            ? "bg-amber-100 text-amber-700"
            : "bg-emerald-100 text-emerald-700"
      }`}
    >
      {!s.aktif
        ? "Nonaktif"
        : s.harusGantiPassword
          ? "Wajib ganti password"
          : "Aktif"}
    </span>,
    <button
      key="a"
      disabled={busy}
      onClick={() => reset(s.id, s.nama, s.nisNip)}
      className="font-bold text-blue-700 disabled:opacity-50"
    >
      Reset password
    </button>,
  ]);

  return (
    <section className="mt-3 rounded-2xl bg-white shadow-[0_2px_12px_rgba(30,64,175,.08)]">
      <Tabel head={["Nama", "NIS", "Kelas", "Status", "Aksi"]} rows={rows} />
    </section>
  );
}
