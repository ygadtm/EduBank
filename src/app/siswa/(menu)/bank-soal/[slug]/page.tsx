import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSiswa } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mapelMeta } from "@/lib/mapel";
import { PageHead, card } from "@/components/ui";

export default async function PaketPerMapel({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireSiswa();
  const { slug } = await params;

  const mapel = await prisma.mapel.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      nama: true,
      deskripsi: true,
      paketLatihan: {
        where: { kelas: user.kelas ?? 6, status: "TERBIT" },
        orderBy: [{ urutan: "asc" }, { judul: "asc" }],
        select: {
          id: true,
          judul: true,
          deskripsi: true,
          durasiMenit: true,
          _count: { select: { soal: true } },
        },
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
        sub={mapel.deskripsi ?? "Pilih paket latihan untuk mulai mengerjakan soal."}
      >
        <Link
          href="/siswa/bank-soal"
          className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-bold text-slate-600"
        >
          ← Semua Mapel
        </Link>
      </PageHead>

      {mapel.paketLatihan.length === 0 ? (
        <div className={`${card} mt-5 px-5 py-10 text-center text-sm text-slate-500`}>
          Belum ada paket latihan terbit untuk mapel ini.
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {mapel.paketLatihan.map((p) => (
            <article key={p.id} className={`${card} flex flex-col p-5`}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold">{p.judul}</h3>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                  {p._count.soal} soal
                </span>
              </div>
              {p.deskripsi && (
                <p className="mt-1 flex-1 text-sm text-slate-500">{p.deskripsi}</p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted">{p.durasiMenit} menit</span>
                <Link
                  href={`/siswa/kerjakan-soal?paket=${p.id}`}
                  className="rounded px-4 py-2 text-sm font-semibold text-accent-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                  style={{ background: meta.color }}
                >
                  Kerjakan
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
