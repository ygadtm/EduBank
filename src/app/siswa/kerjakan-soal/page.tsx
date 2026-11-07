import Link from "next/link";
import { redirect } from "next/navigation";
import { card } from "@/components/ui";
import { requireSiswa } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mapelMeta } from "@/lib/mapel";
import Kuis from "./kuis";

export default async function HalamanKuis({
  searchParams,
}: {
  searchParams: Promise<{ paket?: string }>;
}) {
  const user = await requireSiswa();
  const { paket: paketId } = await searchParams;
  if (!paketId) redirect("/siswa/bank-soal");

  const paket = await prisma.paketLatihan.findFirst({
    where: { id: paketId, kelas: user.kelas ?? 6, status: "TERBIT" },
    select: {
      id: true,
      judul: true,
      durasiMenit: true,
      mapel: { select: { slug: true, nama: true } },
      soal: {
        orderBy: [{ urutan: "asc" }, { soalId: "asc" }],
        select: {
          soal: {
            select: {
              id: true,
              teks: true,
              pilihan: {
                orderBy: { urutan: "asc" },
                select: { id: true, teks: true },
              },
            },
          },
        },
      },
    },
  });

  if (!paket) redirect("/siswa/bank-soal");

  if (paket.soal.length === 0) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper p-4">
        <div className={`${card} max-w-md p-8 text-center`}>
          <h1 className="text-[22px] font-bold leading-[30px] text-ink">Belum ada soal</h1>
          <p className="mt-2 text-sm text-muted">
            Paket latihan ini belum berisi soal.
          </p>
          <Link
            href="/siswa/bank-soal"
            className="mt-4 inline-block rounded bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
          >
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  const meta = mapelMeta(paket.mapel.slug);
  return (
    <Kuis
      paketId={paket.id}
      mapel={{
        slug: paket.mapel.slug,
        nama: paket.mapel.nama,
        icon: meta.icon,
        color: meta.color,
        bg: meta.bg,
      }}
      soal={paket.soal.map((item) => item.soal)}
      durasiMenit={paket.durasiMenit}
    />
  );
}
