import Link from "next/link";
import { SUBJECTS } from "@/lib/data";
import { PageHead, card } from "@/components/ui";

export default function BankSoal() {
  return (
    <>
      <PageHead
        icon="❓"
        title="Bank Soal & Latihan"
        sub="Pilih mata pelajaran dan mulai latihan soal seru!"
      />
      <section className="mt-5 flex items-center gap-4 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-700 p-5 text-white">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/20 text-xl">
          ⭐
        </span>
        <div>
          <b>Tips Latihan Hari Ini:</b>
          <p className="text-sm text-blue-100">
            Kerjakan soal secara santai dan teliti. Setiap kuis yang kamu
            selesaikan akan menambah bintang prestasimu!
          </p>
        </div>
      </section>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {SUBJECTS.map((s, i) => (
          <article key={s.n} className={`${card} flex flex-col p-6`}>
            <span
              className="grid h-12 w-12 place-items-center rounded-xl border text-xl"
              style={{ background: s.bg, borderColor: `${s.c}22` }}
            >
              {s.i}
            </span>
            <h2 className="mt-4 text-lg font-bold">{s.n}</h2>
            <p className="mt-2 flex-1 text-sm text-slate-500">{s.d}</p>
            <a
              href={`/siswa/kerjakan-soal?m=${i}`}
              className="mt-5 rounded-xl py-3 text-center text-sm font-bold text-white shadow-md"
              style={{ background: s.c }}
            >
              Mulai Kerjakan Soal
            </a>
          </article>
        ))}
      </div>
    </>
  );
}
