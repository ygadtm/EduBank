import type { ReactNode } from "react";
import { SUBJECTS } from "@/lib/data";

export const card =
  "rounded-2xl bg-white shadow-[0_2px_12px_rgba(30,64,175,.08)]";
export const inp =
  "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400";
export const btn =
  "rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700";

export function PageHead({
  icon,
  title,
  sub,
  children,
}: {
  icon: string;
  title: string;
  sub: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`${card} flex flex-wrap items-center justify-between gap-4 p-5`}
    >
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-xl">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold">{title}</h1>
          <p className="text-sm text-slate-500">{sub}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: number;
  unit: string;
  icon: string;
}) {
  return (
    <div className={`${card} p-5`}>
      <div className="flex justify-between text-sm font-semibold text-slate-600">
        {label}
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-extrabold">
        {value}{" "}
        <span className="text-sm font-medium text-slate-500">{unit}</span>
      </p>
    </div>
  );
}

export function MapelBadge({ i }: { i: number }) {
  const s = SUBJECTS[i];
  return (
    <span
      className="whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold"
      style={{ background: s.bg, color: s.c }}
    >
      {s.n}
    </span>
  );
}

export function StatusBadge({ s }: { s: string }) {
  const warna =
    s === "Terbit"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-amber-100 text-amber-700";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${warna}`}>
      {s}
    </span>
  );
}

// Tabel di desktop, kartu per baris di HP. Label kolom otomatis dari judul kolom.
export function Tabel({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="md:overflow-x-auto">
      <table className="block w-full text-left text-sm md:table">
        <thead className="hidden md:table-header-group">
          <tr className="border-b border-slate-100 text-xs text-slate-500">
            {head.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="block md:table-row-group">
          {rows.map((r, i) => (
            <tr
              key={i}
              className="mx-4 mb-3 block rounded-xl border border-slate-100 p-3 md:m-0 md:table-row md:rounded-none md:border-0 md:border-b md:border-slate-50 md:p-0"
            >
              {r.map((c, j) => (
                <td
                  key={j}
                  data-label={head[j]}
                  className="flex items-center justify-between gap-3 py-1.5 before:text-xs before:font-semibold before:text-slate-400 before:content-[attr(data-label)] md:table-cell md:px-4 md:py-3 md:before:content-none"
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Segera({ judul }: { judul: string }) {
  return (
    <div className={`${card} p-8 text-center`}>
      <h1 className="text-xl font-extrabold">{judul}</h1>
      <p className="mt-2 text-sm text-slate-500">
        Halaman ini ada di versi HTML dan belum dipindahkan ke versi Next.js.
      </p>
    </div>
  );
}

export function Bar({ v, c = "#2563eb" }: { v: number; c?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full"
          style={{ width: `${v}%`, background: c }}
        />
      </div>
      <b>{v}</b>
    </div>
  );
}
