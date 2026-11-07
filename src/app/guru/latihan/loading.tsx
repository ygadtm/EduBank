import { card } from "@/components/ui";

export default function Loading() {
  return (
    <div role="status" aria-label="Memuat...">
      <div className={`${card} h-16 animate-pulse bg-slate-100`} />
      <div className="mt-5 grid gap-5 xl:grid-cols-5">
        <div className={`${card} h-96 animate-pulse bg-slate-100 xl:col-span-2`} />
        <div className={`${card} h-96 animate-pulse bg-slate-100 xl:col-span-3`} />
      </div>
    </div>
  );
}
