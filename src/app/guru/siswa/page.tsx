import type { Prisma } from "@prisma/client";
import { PageHead, inp, card } from "@/components/ui";
import { prisma } from "@/lib/db";
import { ImporSiswaButton, SiswaTable } from "./siswa-client";

export default async function DataSiswa({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kelas?: string }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const kelas =
    params.kelas === "5" || params.kelas === "6" ? params.kelas : "";

  const where: Prisma.UserWhereInput = { role: "SISWA" };
  if (q) {
    where.OR = [
      { nama: { contains: q, mode: "insensitive" } },
      { nisNip: { contains: q } },
    ];
  }
  if (kelas) where.kelas = Number(kelas);

  const siswa = await prisma.user.findMany({
    where,
    orderBy: { nama: "asc" },
    select: {
      id: true,
      nama: true,
      nisNip: true,
      kelas: true,
      aktif: true,
      harusGantiPassword: true,
    },
  });

  return (
    <>
      <PageHead
        icon="👥"
        title="Data Siswa"
        sub="Kelola daftar siswa. Password awal siswa adalah NIS."
      >
        <ImporSiswaButton />
      </PageHead>
      <p className="mt-3 text-xs text-slate-500">
        Format Excel: baris judul berisi kolom <b>nama</b>, <b>nis</b>, dan{" "}
        <b>kelas</b>.
      </p>
      <form className={`${card} mt-3 flex flex-wrap gap-3 p-5`}>
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari nama atau NIS..."
          className={`${inp} min-w-[200px] flex-1`}
        />
        <select name="kelas" defaultValue={kelas} className={inp}>
          <option value="">Semua Kelas</option>
          <option value="5">Kelas 5</option>
          <option value="6">Kelas 6</option>
        </select>
        <button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
          Cari
        </button>
      </form>
      <SiswaTable siswa={siswa} />
    </>
  );
}
