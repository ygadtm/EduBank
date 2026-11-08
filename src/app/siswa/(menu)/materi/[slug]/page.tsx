import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSiswa } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mapelMeta } from "@/lib/mapel";
import { PageHead, card } from "@/components/ui";

export default async function VideoPerMapel({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireSiswa();
  const { slug } = await params;

  const mapel = await prisma.mapel.findUnique({
    where: { slug },
    select: {
      slug: true,
      nama: true,
      deskripsi: true,
      video: {
        where: { kelas: user.kelas ?? 6 },
        orderBy: [{ urutan: "asc" }, { createdAt: "asc" }],
        select: { id: true, judul: true, ringkasan: true, videoUrl: true },
      },
    },
  });

  if (!mapel) notFound();

  const meta = mapelMeta(mapel.slug);

  return (
    <>
      <PageHead
        icon={meta.icon}
        title={mapel.nama}
        sub={mapel.deskripsi ?? "Materi dan video pembelajaran untuk mapel ini."}
      >
        <Link
          href="/siswa/materi"
          className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600"
        >
          ← Semua Mapel
        </Link>
      </PageHead>

      {mapel.video.length === 0 ? (
        <div className={`${card} mt-5 px-5 py-10 text-center text-sm text-slate-500`}>
          Belum ada materi video untuk mapel ini.
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {mapel.video.map((v) => (
            <article key={v.id} className={`${card} flex flex-col p-5`}>
              <h3 className="font-bold">{v.judul}</h3>
              {v.ringkasan && (
                <p className="mt-1 flex-1 text-sm text-slate-500">{v.ringkasan}</p>
              )}
              <a
                href={v.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block rounded px-4 py-3 text-center text-sm font-semibold text-accent-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                style={{ background: meta.color }}
              >
                Tonton Video
              </a>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
