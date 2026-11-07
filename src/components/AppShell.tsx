"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { logout } from "@/lib/actions/auth";

const NAV = {
  siswa: [
    ["beranda", "Beranda", "🏠"],
    ["bank-soal", "Bank Soal", "📖"],
    ["materi", "Materi", "📅"],
  ],
  guru: [
    ["beranda", "Beranda", "🏠"],
    ["soal", "Kelola Soal", "📝"],
    ["latihan", "Paket Latihan", "📚"],
    ["siswa", "Siswa", "👥"],
    ["rekap", "Rekap Nilai", "📊"],
  ],
} as const;

export default function AppShell({
  role,
  user,
  children,
}: {
  role: "siswa" | "guru";
  user: { nama: string; kelas: number | null };
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const nav = NAV[role];
  const aktif = (k: string) =>
    path.startsWith(`/${role}/${k}`) ||
    (k === "bank-soal" && path.includes("hasil-latihan")) ||
    (k === "latihan" && path.startsWith(`/${role}/latihan-form`));
  const label = role === "guru" ? "Guru" : `Kelas ${user.kelas ?? "-"} SD`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f7fc]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col overflow-y-auto bg-[#01409a] p-4 text-white transition-transform duration-200 md:translate-x-0 ${open ? "" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-1">
          <b className="text-lg">EduBank</b>
          <button
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
            className="text-xl md:hidden"
          >
            ✕
          </button>
        </div>
        <div className="mt-4 rounded-2xl bg-white/10 p-4 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-blue-400/60 text-3xl">
            📖
          </div>
          <p className="mt-2 text-sm font-bold">{user.nama}</p>
          <span className="mt-1 inline-block rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-semibold">
            {label}
          </span>
        </div>
        <nav className="mt-6 space-y-1">
          {nav.map(([k, n, i]) => (
            <Link
              key={k}
              href={`/${role}/${k}`}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${aktif(k) ? "bg-white text-blue-700" : "text-blue-100 hover:bg-white/10"}`}
            >
              {i} {n}
            </Link>
          ))}
        </nav>
        <form action={logout} className="mt-auto">
          <button className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-blue-100 hover:bg-white/10">
            🚪 Keluar
          </button>
        </form>
      </aside>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}
      <header className="sticky top-0 z-20 flex items-center justify-between bg-white px-4 py-3 shadow-sm md:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            aria-label="Buka menu"
            className="text-2xl text-blue-700"
          >
            ☰
          </button>
          <b className="text-blue-700">EduBank</b>
        </div>
        <div className="text-right text-xs">
          <b className="block">{user.nama}</b>
          <span className="font-semibold text-blue-700">{label}</span>
        </div>
      </header>
      <main className="p-4 pb-24 md:ml-60 md:p-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 flex gap-1 border-t border-slate-200 bg-white p-2 md:hidden">
        {nav.map(([k, n, i]) => (
          <Link
            key={k}
            href={`/${role}/${k}`}
            className={`flex flex-1 flex-col items-center rounded-xl py-1.5 text-[11px] font-semibold ${aktif(k) ? "bg-blue-100 text-blue-700" : "text-slate-500"}`}
          >
            <span className="text-lg">{i}</span>
            {n}
          </Link>
        ))}
      </nav>
    </div>
  );
}
