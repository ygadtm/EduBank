"use client";
import Link from "next/link";
import { DAFTAR_SOAL, SUBJECTS } from "@/lib/data";
import {
  MapelBadge,
  PageHead,
  StatusBadge,
  Tabel,
  btn,
  card,
  inp,
} from "@/components/ui";

export default function KelolaSoal() {
  const rows = DAFTAR_SOAL.map((d) => [
    d.q,
    <MapelBadge key="m" i={d.m} />,
    `Kelas ${d.k}`,
    <StatusBadge key="s" s={d.s} />,
    d.t,
    <span key="a" className="font-bold">
      <Link href="/guru/soal-form" className="text-blue-700">
        Ubah
      </Link>
      <button
        onClick={() => confirm("Hapus soal ini?")}
        className="ml-2 text-red-500"
      >
        Hapus
      </button>
    </span>,
  ]);
  return (
    <>
      <PageHead
        icon="📝"
        title="Kelola Soal"
        sub="Buat, ubah, dan terbitkan soal latihan untuk siswa."
      >
        <Link href="/guru/soal-form" className={btn}>
          + Buat Soal
        </Link>
      </PageHead>
      <section className={`${card} mt-5`}>
        <div className="flex flex-wrap gap-3 p-5">
          <input
            placeholder="Cari soal..."
            className={`${inp} min-w-[200px] flex-1`}
          />
          <select className={inp}>
            <option>Semua Mapel</option>
            {SUBJECTS.map((s) => (
              <option key={s.n}>{s.n}</option>
            ))}
          </select>
          <select className={inp}>
            <option>Semua Kelas</option>
            <option>Kelas 5</option>
            <option>Kelas 6</option>
          </select>
          <select className={inp}>
            <option>Semua Status</option>
            <option>Terbit</option>
            <option>Draf</option>
          </select>
        </div>
        <Tabel
          head={["Soal", "Mapel", "Kelas", "Status", "Diperbarui", "Aksi"]}
          rows={rows}
        />
      </section>
    </>
  );
}
