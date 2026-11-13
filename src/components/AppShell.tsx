"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { logout } from "@/lib/actions/auth";

const NAV = {
  siswa: [
    ["beranda", "Beranda"],
    ["bank-soal", "Bank Soal"],
    ["materi", "Materi"],
  ],
  guru: [
    ["beranda", "Beranda"],
    ["soal", "Kelola Soal"],
    ["latihan", "Paket Latihan"],
    ["video", "Video"],
    ["siswa", "Siswa"],
    ["rekap", "Rekap Nilai"],
    ["pengguna", "Akun Guru"],
  ],
} as const;

export default function AppShell({
  role,
  user,
  children,
}: {
  role: "siswa" | "guru";
  user: { nama: string; kelas: number | null; admin?: boolean };
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const nav = NAV[role].filter(
    (item) => item[0] !== "pengguna" || user.admin,
  );
  const aktif = (k: string) =>
    path.startsWith(`/${role}/${k}`) ||
    (k === "bank-soal" && path.includes("hasil-latihan")) ||
    (k === "latihan" && path.startsWith(`/${role}/latihan-form`));
  const label = role === "guru" ? (user.admin ? "Admin" : "Guru") : `Kelas ${user.kelas ?? "-"} SD`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-paper">
      <aside
        id="mobile-nav"
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col overflow-y-auto bg-accent p-4 text-accent-ink transition-transform duration-200 md:translate-x-0 ${open ? "" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-1">
          <b className="text-lg">EduBank</b>
          <button
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
            className="grid h-9 w-9 place-items-center rounded text-accent-ink/90 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus md:hidden"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="mt-4 rounded-2xl bg-white/10 p-4 text-center">
          <div
            aria-hidden="true"
            className="mx-auto grid h-12 w-12 place-items-center rounded-full border-2 border-white/35 bg-white/15 text-base font-extrabold tracking-wide text-white"
          >
            {user.nama.trim().charAt(0).toUpperCase() || (role === "guru" ? "G" : "S")}
          </div>
          <p className="mt-2 text-sm font-bold">{user.nama}</p>
          <span className="mt-1 inline-block rounded bg-white/20 px-3 py-1 text-xs font-semibold">
            {label}
          </span>
        </div>
        <nav className="mt-6 space-y-1">
          {nav.map(([k, n]) => (
            <Link
              key={k}
              href={`/${role}/${k}`}
              onClick={() => setOpen(false)}
              className={`flex min-h-11 items-center gap-3 rounded px-4 py-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus ${aktif(k) ? "bg-surface text-accent" : "text-accent-ink/90 hover:bg-white/10"}`}
            >
               {n}
            </Link>
          ))}
        </nav>
        <form action={logout} className="mt-auto">
          <button
            aria-label="Keluar dari akun"
            className="flex w-full min-h-11 items-center gap-3 rounded px-4 py-3 text-sm font-semibold text-accent-ink/90 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            Keluar
          </button>
        </form>
      </aside>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-surface px-4 py-3 md:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            aria-label="Buka menu"
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="grid h-11 w-11 place-items-center rounded text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <b className="text-accent">EduBank</b>
        </div>
        <div className="flex items-center gap-2 text-right text-xs">
          <div className="hidden min-w-0 min-[380px]:block">
            <b className="block text-ink">{user.nama}</b>
            <span className="font-semibold text-accent">{label}</span>
          </div>
          <div
            aria-hidden="true"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line bg-paper text-xs font-bold text-accent"
          >
            {user.nama.trim().charAt(0).toUpperCase() || (role === "guru" ? "G" : "S")}
          </div>
        </div>
      </header>
      <main className={`p-4 md:ml-60 md:p-8 ${role === "siswa" ? "pb-24" : ""}`}>
        {children}
      </main>
      {role === "siswa" && (
        <nav
          aria-label="Navigasi utama"
          className="fixed inset-x-0 bottom-0 z-20 flex gap-1 border-t border-line bg-surface px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden"
        >
          {nav.map(([k, n]) => (
            <Link
              key={k}
              href={`/${role}/${k}`}
              aria-current={aktif(k) ? "page" : undefined}
              className={`flex min-h-11 flex-1 items-center justify-center rounded px-1 py-2 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus ${aktif(k) ? "bg-accent/10 text-accent" : "text-muted"}`}
            >
              {n}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
