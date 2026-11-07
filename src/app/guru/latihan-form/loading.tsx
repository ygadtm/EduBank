import { card } from "@/components/ui";

export default function Loading() {
  return (
    <div role="status" aria-label="Memuat...">
      <div className={`${card} h-16 animate-pulse bg-slate-100`} />
      <div className={`${card} mt-5 h-64 animate-pulse bg-slate-100`} />
    </div>
  );
}
