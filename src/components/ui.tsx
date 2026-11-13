
import type { ReactNode } from "react";

export const card =
  "rounded-[10px] border border-line bg-surface shadow-[0_1px_2px_rgba(27,42,65,.06)]";
export const inp =
  "rounded border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors hover:border-accent/40 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-focus/60";
export const btn =
  "rounded bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:bg-accent/95 disabled:cursor-not-allowed disabled:opacity-60";

export function PageHead({
  icon,
  title,
  sub,
  children,
}: {
  icon?: string;
  title: string;
  sub: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`${card} flex flex-wrap items-center justify-between gap-4 p-5`}
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div
            aria-hidden="true"
            className="grid h-12 w-12 place-items-center rounded-[10px] border border-accent/20 bg-accent/10 text-xl text-accent"
          >
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-[22px] font-bold leading-[30px] text-ink">{title}</h1>
          <p className="text-sm text-muted">{sub}</p>
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
  icon?: string;
}) {
  return (
    <div className={`${card} border-l-4 border-l-accent p-5`}>
      <div className="flex justify-between text-sm font-semibold text-muted">
        {label}
        {icon && (
          <span
            aria-hidden="true"
            className="grid h-9 w-9 place-items-center rounded border border-line bg-paper text-accent"
          >
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 text-[32px] font-bold leading-[38px] text-ink">
        {value} <span className="text-sm font-medium text-muted">{unit}</span>
      </p>
    </div>
  );
}

export function MapelBadge({
  nama,
  color = "#2563eb",
  bg = "#eff6ff",
}: {
  nama: string;
  color?: string;
  bg?: string;
}) {
  return (
    <span
      className="whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold"
      style={{ background: bg, color }}
    >
      {nama}
    </span>
  );
}

export function StatusBadge({ s }: { s: string }) {
  const warna =
    s === "Terbit"
      ? "bg-success/15 text-success"
      : "bg-highlight/20 text-ink";

  return (
    <span className={`rounded px-2.5 py-1 text-xs font-semibold ${warna}`}>
      {s}
    </span>
  );
}

// Tabel di desktop, daftar per baris di HP.
export function Tabel({
  head,
  rows,
}: {
  head: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="md:overflow-x-auto">
      <table className="block w-full text-left text-sm md:table">
        <thead className="hidden md:table-header-group">
            <tr className="border-b border-line text-xs text-muted">
            {head.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="block md:table-row-group">
          {rows.map((r, i) => (
            <tr
              key={i}
              className="block border-b border-line px-5 py-3 transition-colors last:border-b-0 hover:bg-paper md:table-row md:m-0 md:border-b md:border-line md:px-0 md:py-0 md:last:border-b"
            >
              {r.map((c, j) => (
                <td
                  key={j}
                  data-label={head[j]}
                  className="flex items-start justify-between gap-3 py-1.5 before:text-xs before:font-semibold before:text-muted before:content-[attr(data-label)] md:table-cell md:px-4 md:py-3 md:before:content-none"
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

export function Bar({
  v,
  c = "var(--color-accent)",
}: {
  v: number;
  c?: string;
}) {
  return (
    <div role="img" aria-label={`Nilai ${v} persen`} className="flex items-center gap-2">
      <div aria-hidden="true" className="h-2.5 w-24 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full"
          style={{ width: `${v}%`, background: c }}
        />
      </div>
      <b className="text-sm text-ink">{v}</b>
    </div>
  );
}
