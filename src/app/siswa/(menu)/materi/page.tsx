import { PageHead, card } from "@/components/ui";
import { requireSiswa } from "@/lib/auth";
import { mapelMeta } from "@/lib/mapel";
import { MATERI } from "@/lib/materi";

export default async function Materi() {
  const user = await requireSiswa();
  const daftar = MATERI.filter((m) => m.kelas === (user.kelas ?? 6)).sort(
    (a, b) => a.urutan - b.urutan,
  );
  const rekomendasi =
    daftar.find((m) => m.mapelSlug === "ipa") ?? daftar[0];

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
        sub="Pilih materi pelajaran dan pelajari rangkumannya bersama gurumu."
      />
      {rekomendasi && (
        <section className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-linear-to-r from-blue-700 to-emerald-700 p-5 text-white">
          <div className="flex gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/20 text-xl">
              💡
            </span>
            <div className="max-w-xl">
              <p className="text-xs font-semibold tracking-wide text-blue-100">
                MATERI REKOMENDASI PEKAN INI
              </p>
              <b>{rekomendasi.judul}</b>
              <p className="mt-1 text-sm text-blue-100">
                {rekomendasi.ringkasan}
              </p>
            </div>
          </div>
          <span className="rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold">
            Materi Kelas {rekomendasi.kelas}
          </span>
        </section>
      )}
      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {daftar.map((m) => {
          const meta = mapelMeta(m.mapelSlug);
          return (
            <article key={`${m.mapelSlug}-${m.kelas}`} className={`${card} flex flex-col p-4`}>
              <div
                className="relative grid h-36 place-items-center rounded-xl text-6xl"
                style={{
                  background: `linear-gradient(135deg, ${meta.bg}, #fff)`,
                }}
              >
                <span
                  className="absolute left-2 top-2 rounded-full bg-white px-3 py-1 text-xs font-bold shadow"
                  style={{ color: meta.color }}
                >
                  Kelas {m.kelas}
                </span>
                {meta.icon}
              </div>
              <p
                className="mt-4 text-xs font-bold uppercase tracking-wide"
                style={{ color: meta.color }}
              >
                {meta.nama}
              </p>
              <h2 className="mt-1 font-bold">{m.judul}</h2>
              <p className="mt-1 flex-1 text-sm text-slate-500">
                {m.ringkasan}
              </p>
              <div className="mt-4 flex gap-2">
                {m.videoUrl ? (
                  <a
                    href={m.videoUrl}
                    className="rounded-xl px-4 py-3 text-center text-sm font-bold text-white"
                    style={{ background: meta.color }}
                  >
                    ▷ Tonton Video
                  </a>
                ) : (
                  <span
                    aria-disabled="true"
                    className="cursor-not-allowed rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-500"
                  >
                    Video belum tersedia
                  </span>
                )}
                <span className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  Rangkuman
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
