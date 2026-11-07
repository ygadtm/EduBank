import { card } from "@/components/ui";

export default function Loading() {
  return (
    <div role="status" aria-label="Memuat..." className="min-h-screen bg-[#f4f7fc]">
      <div className="mx-auto max-w-2xl p-4 md:py-8">
        <div className={`${card} p-6`}>
          <div className="h-7 w-3/4 animate-pulse rounded bg-slate-200" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
