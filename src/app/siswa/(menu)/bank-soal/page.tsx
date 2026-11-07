import Link from "next/link";
import { requireSiswa } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mapelMeta } from "@/lib/mapel";
import { PageHead, card } from "@/components/ui";

export default async function BankSoal() {
  const user = await requireSiswa();

  const mapels = await prisma.mapel.findMany({
    orderBy: { urutan: "asc" },
    select: {
      id: true,
      slug: true,
      nama: true,
      deskripsi: true,
      _count: {
        select: {
          paketLatihan: { where: { kelas: user.kelas ?? 6, status: "TERBIT" } },
        },
      },
    },
  });

  return (
    <>
      <PageHead
        icon="❓"
        title="Bank Soal & Latihan"
        sub="Pilih mata pelajaran untuk melihat paket latihan."
      />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mapels.map((m) => {
          const meta = mapelMeta(m.slug);
          const jumlah = m._count.paketLatihan;
          return (
            <Link
              key={m.id}
              href={`/siswa/bank-soal/${m.slug}`}
              className={`${card} flex flex-col p-6 transition-all hover:ring-2`}
              style={{ ["--tw-ring-color" as string]: meta.color }}
            >
              <div
                className="grid h-16 w-16 place-items-center rounded-2xl text-3xl"
                style={{ background: meta.bg }}
              >
                {meta.icon}
              </div>
              <h2 className="mt-4 text-lg font-bold">{m.nama}</h2>
              <p className="mt-1 flex-1 text-sm text-slate-500">{m.deskripsi}</p>
              <p className="mt-3 text-xs font-semibold" style={{ color: meta.color }}>
                {jumlah === 0 ? "Belum ada paket" : `${jumlah} paket tersedia →`}
              </p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
