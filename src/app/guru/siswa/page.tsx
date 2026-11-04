"use client";
import { useState, type ChangeEvent } from "react";
import { SISWA } from "@/lib/data";
import { PageHead, Tabel, btn, card, inp } from "@/components/ui";

type Baris = { n: string; nis: string; k: string; st?: string };

export default function DataSiswa() {
  const [data, setData] = useState<Baris[]>(
    SISWA.map((s) => ({ n: s.n, nis: s.nis, k: String(s.k) })),
  );

  async function impor(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const XLSX = await import("xlsx");
    const wb = XLSX.read(await f.arrayBuffer(), { type: "array" });
    const baru = XLSX.utils
      .sheet_to_json<Record<string, string | number>>(
        wb.Sheets[wb.SheetNames[0]],
      )
      .map((x) => ({
        n: String(x.nama || x.Nama || "Tanpa nama"),
        nis: String(x.nis || x.NIS || "-"),
        k: String(x.kelas || x.Kelas || "-").replace(/\D/g, "") || "-",
        st: "Baru",
      }));
    setData([...baru, ...data]);
    alert(
      `${baru.length} siswa dari Excel ditampilkan (belum disimpan ke server).`,
    );
  }

  const rows = data.map((s) => [
    <b key="n">{s.n}</b>,
    s.nis,
    `Kelas ${s.k}`,
    <span
      key="s"
      className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700"
    >
      {s.st || "Aktif"}
    </span>,
  ]);
  return (
    <>
      <PageHead
        icon="👥"
        title="Data Siswa"
        sub="Kelola daftar siswa. Daftar ini dipakai untuk pilihan nama di halaman masuk."
      >
        <label className={`${btn} cursor-pointer`}>
          📥 Impor dari Excel
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={impor}
            className="hidden"
          />
        </label>
      </PageHead>
      <p className="mt-3 text-xs text-slate-500">
        Format Excel: baris judul berisi kolom <b>nama</b>, <b>nis</b>, dan{" "}
        <b>kelas</b>.
      </p>
      <section className={`${card} mt-3`}>
        <div className="flex flex-wrap gap-3 p-5">
          <input
            placeholder="Cari nama atau NIS..."
            className={`${inp} min-w-[200px] flex-1`}
          />
          <select className={inp}>
            <option>Semua Kelas</option>
            <option>Kelas 5</option>
            <option>Kelas 6</option>
          </select>
        </div>
        <Tabel head={["Nama", "NIS", "Kelas", "Status"]} rows={rows} />
      </section>
    </>
  );
}
