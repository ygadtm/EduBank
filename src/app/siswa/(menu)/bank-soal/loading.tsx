import { card } from "@/components/ui";

export default function Loading() {
  return (
    <div role="status" aria-label="Memuat...">
      <div className={`${card} h-16 animate-pulse bg-slate-100`} />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`${card} h-40 animate-pulse bg-slate-100`} />
        ))}
      </div>
    </div>
  );
}
