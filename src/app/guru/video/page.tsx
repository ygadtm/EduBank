import Link from "next/link";
import { PageHead, card } from "@/components/ui";
import { prisma } from "@/lib/db";
import { requireGuru, getGuruScope } from "@/lib/auth";
import { mapelMeta } from "@/lib/mapel";

export default async function VideoGuru() {
  const user = await requireGuru();
  const scope = await getGuruScope(user);

  const mapels = await prisma.mapel.findMany({
    where: scope ? { id: { in: scope.mapelIds } } : undefined,
    orderBy: { urutan: "asc" },
    select: { id: true, slug: true, nama: true, deskripsi: true, _count: { select: { video: true } } },
  });

  return (
    <>
      <PageHead
        icon="▶"
        title="Video Pembelajaran"
        sub="Pilih mata pelajaran untuk mengelola materi dan videonya."
      />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mapels.map((m) => {
          const meta = mapelMeta(m.slug);
          const jumlah = m._count.video;
          return (
            <Link
              key={m.id}
              href={`/guru/video/${m.slug}`}
              className={`${card} mapel-card flex flex-col items-center p-5 text-center hover:border-accent/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus`}
            >
              <div
                aria-hidden="true"
                className="mapel-card-icon grid h-14 w-14 place-items-center rounded-2xl text-2xl"
                style={{ background: meta.bg }}
              >
                {meta.icon}
              </div>
              <h2 className="mt-3 text-base font-bold text-ink">{m.nama}</h2>
              <p className="mt-1 flex-1 text-xs text-muted line-clamp-2">{m.deskripsi}</p>
              <span
                className="mt-3 rounded px-2.5 py-1 text-xs font-semibold"
                style={{ color: meta.color, background: meta.bg }}
              >
                {jumlah === 0 ? "Belum ada video" : `${jumlah} video`}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
