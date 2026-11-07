import type { Prisma, StatusSoal } from "@prisma/client";
import Link from "next/link";
import HapusSoalButton from "@/components/hapus-soal-button";
import {
  MapelBadge,
  PageHead,
  StatusBadge,
  Tabel,
  btn,
  card,
  inp,
} from "@/components/ui";
import { prisma } from "@/lib/db";
import { getMapelRingkas } from "@/lib/cache";
import { mapelMeta } from "@/lib/mapel";

type Params = {
  q?: string;
  mapel?: string;
  kelas?: string;
  status?: string;
};

export default async function KelolaSoal({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const mapel = typeof params.mapel === "string" ? params.mapel : "";
  const kelas = params.kelas === "5" || params.kelas === "6" ? params.kelas : "";
  const status =
    params.status === "TERBIT" || params.status === "DRAF" ? params.status : "";

  const where: Prisma.SoalWhereInput = {};
  if (q) where.teks = { contains: q, mode: "insensitive" };
  if (mapel) where.mapel = { slug: mapel };
  if (kelas) where.kelas = Number(kelas);
  if (status) where.status = status as StatusSoal;

  const mapels = await getMapelRingkas();
  const soal = await prisma.soal.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: { mapel: true },
  });

  const rows = soal.map((d) => {
    const meta = mapelMeta(d.mapel.slug);
    return [
      d.teks,
      <MapelBadge key="m" nama={d.mapel.nama} color={meta.color} bg={meta.bg} />,
      `Kelas ${d.kelas}`,
      <StatusBadge key="s" s={d.status === "TERBIT" ? "Terbit" : "Draf"} />,
      d.updatedAt.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      <span key="a" className="font-bold">
        <Link href={`/guru/soal-form?id=${d.id}`} className="text-blue-700">
          Ubah
        </Link>
        <HapusSoalButton id={d.id} />
      </span>,
    ];
  });

  return (
    <>
      <PageHead
        icon="📝"
        title="Kelola Soal"
        sub="Buat, ubah, dan terbitkan soal latihan untuk siswa."
      >
        <Link href="/guru/soal-form" className={btn}>
          + Buat Soal
        </Link>
      </PageHead>
      <section className={`${card} mt-5`}>
        <form className="flex flex-wrap gap-3 p-5">
          <input
            name="q"
            defaultValue={q}
            placeholder="Cari soal..."
            className={`${inp} min-w-[200px] flex-1`}
          />
          <select name="mapel" defaultValue={mapel} className={inp}>
            <option value="">Semua Mapel</option>
            {mapels.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.nama}
              </option>
            ))}
          </select>
          <select name="kelas" defaultValue={kelas} className={inp}>
            <option value="">Semua Kelas</option>
            <option value="5">Kelas 5</option>
            <option value="6">Kelas 6</option>
          </select>
          <select name="status" defaultValue={status} className={inp}>
            <option value="">Semua Status</option>
            <option value="TERBIT">Terbit</option>
            <option value="DRAF">Draf</option>
          </select>
          <button className={btn}>Terapkan</button>
        </form>
        <Tabel
          head={["Soal", "Mapel", "Kelas", "Status", "Diperbarui", "Aksi"]}
          rows={rows}
        />
      </section>
    </>
  );
}
