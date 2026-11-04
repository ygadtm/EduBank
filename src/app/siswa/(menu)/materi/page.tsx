import { SUBJECTS } from "@/lib/data";
import { PageHead, card } from "@/components/ui";

const urutan = [0, 1, 2, 3, 5, 4];

export default function Materi() {
  return (
    <>
      <p className="mb-3 text-xs text-slate-500">
        📅{" "}
        {new Date().toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
      <PageHead
        icon="❓"
        title="Materi Pembelajaran"
        sub="Pilih materi pelajaran seru dan tonton video penjelasan asyik bersama gurumu terbaikmu!"
      />
      <section className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-linear-to-r from-blue-700 to-emerald-700 p-5 text-white">
        <div className="flex gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/20 text-xl">
            💡
          </span>
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-wide text-blue-100">
              MATERI REKOMENDASI PEKAN INI
            </p>
            <b>Siklus Air & Rantai Makanan: Ekosistem Sahabat Kita</b>
            <p className="mt-1 text-sm text-blue-100">
              Bingung sebelum mengerjakan soal kuis? Tonton video animasi pendek
              dan baca rangkuman ringkasnya di sini dulu yuk!
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href="#"
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-blue-700"
          >
            ▶ Tonton Sorotan
          </a>
          <a
            href="#"
            className="rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold"
          >
            Rangkuman
          </a>
        </div>
      </section>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {urutan.map((i) => {
          const s = SUBJECTS[i];
          return (
            <article key={s.n} className={`${card} flex flex-col p-4`}>
              <div
                className="relative grid h-36 place-items-center rounded-xl text-6xl"
                style={{ background: `linear-gradient(135deg, ${s.bg}, #fff)` }}
              >
                <span
                  className="absolute left-2 top-2 rounded-full bg-white px-3 py-1 text-xs font-bold shadow"
                  style={{ color: s.c }}
                >
                  🎥 {s.v} Video Seru
                </span>
                {s.i}
              </div>
              <p
                className="mt-4 text-xs font-bold uppercase tracking-wide"
                style={{ color: s.c }}
              >
                {s.n}
              </p>
              <h2 className="mt-1 font-bold">{s.mt}</h2>
              <p className="mt-1 flex-1 text-sm text-slate-500">{s.md}</p>
              <div className="mt-4 flex gap-2">
                <a
                  href="#"
                  className="rounded-xl px-4 py-3 text-center text-sm font-bold text-white"
                  style={{ background: s.c }}
                >
                  ▷ Tonton Video
                </a>
                <a
                  href="#"
                  className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  Rangkuman
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
