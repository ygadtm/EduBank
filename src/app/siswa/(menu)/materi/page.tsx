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
      <p className="mb-3 text-xs text-muted">
        {new Date().toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
      <PageHead
        icon="▶"
        title="Materi Pembelajaran"
        sub="Pilih materi pelajaran dan tonton video pembelajarannya."
      />
      {rekomendasi && (
        <section className={`${card} mt-5 flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-accent p-5`}>
          <div className="max-w-xl">
            <p className="text-xs font-semibold text-muted">
              Materi rekomendasi
            </p>
            <b className="text-ink">{rekomendasi.judul}</b>
            <p className="mt-1 text-sm text-muted">
              Tonton video pembelajaran untuk materi ini.
            </p>
          </div>
          <span className="rounded bg-paper px-4 py-2.5 text-sm font-semibold text-ink">
            Kelas {rekomendasi.kelas}
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
                className="mt-4 text-xs font-semibold"
                style={{ color: meta.color }}
              >
                {meta.nama}
              </p>
              <h2 className="mt-1 flex-1 font-bold text-ink">{m.judul}</h2>
              <div className="mt-4">
                {m.videoUrl ? (
                  <a
                    href={m.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block rounded px-4 py-3 text-center text-sm font-semibold text-accent-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                    style={{ background: meta.color }}
                  >
                    Tonton Video
                  </a>
                ) : (
                  <span
                    aria-disabled="true"
                    className="inline-block cursor-not-allowed rounded border border-line bg-paper px-4 py-3 text-sm font-semibold text-muted"
                  >
                    Video belum tersedia
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
