"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent } from "react";
import { imporSiswa, resetPasswordSiswa } from "@/lib/actions/siswa";
import { Tabel, btn } from "@/components/ui";

type Siswa = {
  id: string;
  nama: string;
  nisNip: string;
  kelas: number | null;
  aktif: boolean;
  harusGantiPassword: boolean;
};

function ambil(obj: Record<string, unknown>, key: string) {
  const kunci = Object.keys(obj).find(
    (k) => k.trim().toLowerCase() === key,
  );
  return kunci ? String(obj[kunci] ?? "").trim() : "";
}

export function ImporSiswaButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function impor(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);

    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await f.arrayBuffer(), { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        raw: false,
        defval: "",
      });
      const rows = data.map((x) => ({
        nama: ambil(x, "nama"),
        nisNip: ambil(x, "nis"),
        kelas: ambil(x, "kelas"),
      }));

      const hasil = await imporSiswa(rows);
      if ("error" in hasil) {
        alert(hasil.error);
      } else {
        const gagal = hasil.gagal?.length
          ? ` ${hasil.gagal.length} baris gagal: ${hasil.gagal
              .slice(0, 3)
              .join(" ")}`
          : "";
        alert(
          `${hasil.dibuat} siswa baru, ${hasil.diperbarui} diperbarui.${gagal}`,
        );
        router.refresh();
      }
    } catch {
      alert("File Excel gagal dibaca.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <label className={`${btn} cursor-pointer ${busy ? "opacity-60" : ""}`}>
      📥 Impor dari Excel
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={impor}
        disabled={busy}
        className="hidden"
      />
    </label>
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
