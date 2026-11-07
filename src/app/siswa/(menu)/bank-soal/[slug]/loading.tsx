import { card } from "@/components/ui";

export default function Loading() {
  return (
    <div role="status" aria-label="Memuat...">
      <div className={`${card} flex gap-4 p-5`}>
        <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-72 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`${card} h-40 animate-pulse bg-slate-100`} />
        ))}
      </div>
    </div>
  );
}
