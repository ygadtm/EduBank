import Link from "next/link";
import { requireSiswa } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mapelMeta } from "@/lib/mapel";
import { PageHead, card } from "@/components/ui";

export default async function VideoMateri() {
  const user = await requireSiswa();

  const mapels = await prisma.mapel.findMany({
    orderBy: { urutan: "asc" },
    select: {
      id: true,
      slug: true,
      nama: true,
      deskripsi: true,
      _count: { select: { video: { where: { kelas: user.kelas ?? 6 } } } },
    },
  });

  return (
    <>
      <PageHead
        icon="▶"
        title="Materi & Video"
        sub="Pilih mata pelajaran untuk melihat materi dan videonya."
      />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mapels.map((m) => {
          const meta = mapelMeta(m.slug);
          const jumlah = m._count.video;
          return (
            <Link
              key={m.id}
              href={`/siswa/materi/${m.slug}`}
              className={`${card} flex flex-col p-6 transition-colors hover:border-accent/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus`}
            >
              <div
                className="grid h-16 w-16 place-items-center rounded-2xl text-3xl"
                style={{ background: meta.bg }}
              >
                {meta.icon}
              </div>
              <h2 className="mt-4 text-lg font-bold text-ink">{m.nama}</h2>
              <p className="mt-1 flex-1 text-sm text-muted">{m.deskripsi}</p>
              <p className="mt-3 text-sm font-semibold" style={{ color: meta.color }}>
                {jumlah === 0 ? "Belum ada video" : `${jumlah} video tersedia`}
              </p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
