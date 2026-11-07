import { card } from "@/components/ui";

export default function Loading() {
  return (
    <div role="status" aria-label="Memuat...">
      <div className={`${card} h-16 animate-pulse bg-slate-100`} />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`${card} h-28 animate-pulse bg-slate-100`} />
        ))}
      </div>
      <div className={`${card} mt-6 h-48 animate-pulse bg-slate-100`} />
    </div>
  );
}
