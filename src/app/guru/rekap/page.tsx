import { Bar, PageHead, Stat, Tabel, card, inp } from "@/components/ui";
import { prisma } from "@/lib/db";
import { getMapelRingkas } from "@/lib/cache";

const bintang = (v: number) => {
  const count = v >= 85 ? 3 : v >= 65 ? 2 : 1;
  return <span className="tracking-tight text-amber-400">{"★".repeat(count)}</span>;
};
const warna = (v: number) =>
  v >= 80 ? "#059669" : v >= 65 ? "#2563eb" : "#d97706";

export default async function Rekap({
  searchParams,
}: {
  searchParams: Promise<{ mapel?: string; kelas?: string }>;
}) {
  const params = await searchParams;
  const mapelSlug = typeof params.mapel === "string" ? params.mapel : "";
  const kelas =
    params.kelas === "5" || params.kelas === "6" ? params.kelas : "";

  const mapels = await getMapelRingkas();
  const mapelFilter = mapelSlug
    ? await prisma.mapel.findUnique({
        where: { slug: mapelSlug },
        select: { id: true },
      })
    : null;

  const siswa = await prisma.user.findMany({
    where: {
      role: "SISWA",
      ...(kelas ? { kelas: Number(kelas) } : {}),
    },
    orderBy: { nama: "asc" },
    select: {
      id: true,
      nama: true,
      kelas: true,
      latihan: {
        where: {
          selesai: { not: null },
          ...(mapelFilter ? { mapelId: mapelFilter.id } : {}),
        },
        select: { jawaban: { select: { benar: true } } },
      },
    },
  });

  const data = siswa.map((s) => {
    const totalJawaban = s.latihan.reduce(
      (n, l) => n + l.jawaban.length,
      0,
    );
    const totalBenar = s.latihan.reduce(
      (n, l) => n + l.jawaban.filter((j) => j.benar).length,
      0,
    );
    return {
      ...s,
      selesai: s.latihan.length,
      totalJawaban,
      nilai: totalJawaban ? Math.round((totalBenar / totalJawaban) * 100) : 0,
    };
  });

  const totalJawaban = data.reduce((n, s) => n + s.totalJawaban, 0);
  const totalBenar = data.reduce(
    (n, s) =>
      n +
      s.latihan.reduce(
        (m, l) => m + l.jawaban.filter((j) => j.benar).length,
        0,
      ),
    0,
  );
  const rataKelas = totalJawaban
    ? Math.round((totalBenar / totalJawaban) * 100)
    : 0;
  const tertinggi = data
    .filter((s) => s.totalJawaban > 0)
    .reduce<(typeof data)[number] | null>(
      (best, s) => (!best || s.nilai > best.nilai ? s : best),
      null,
    );
  const perluBimbingan = data.filter(
    (s) => s.totalJawaban > 0 && s.nilai < 65,
  ).length;

  const rows = data.map((s) => [
    <b key="n">{s.nama}</b>,
    s.kelas ? `Kelas ${s.kelas}` : "-",
    `${s.selesai} latihan`,
    <Bar key="b" v={s.nilai} c={warna(s.nilai)} />,
    s.totalJawaban ? bintang(s.nilai) : "-",
    s.totalJawaban > 0 && s.nilai < 65 ? (
      <span key="c" className="font-bold text-amber-600">
        Perlu bimbingan
      </span>
    ) : (
      <span key="c" className="text-slate-400">
        -
      </span>
    ),
  ]);

  return (
    <>
      <PageHead
        title="Rekap Nilai"
        sub="Pantau hasil latihan setiap siswa."
      >
        <form className="flex flex-wrap gap-2">
          <select name="mapel" defaultValue={mapelSlug} className={inp}>
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
          <button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
            Terapkan
          </button>
        </form>
      </PageHead>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Stat label="Rata-rata Kelas" value={rataKelas} unit="Poin" />
        <Stat
          label="Nilai Tertinggi"
          value={tertinggi?.nilai ?? 0}
          unit={tertinggi?.nama ?? "Belum ada"}
        />
        <Stat
          label="Perlu Bimbingan"
          value={perluBimbingan}
          unit="Siswa"
        />
      </div>
      <section className={`${card} mt-5`}>
        <h2 className="p-5 font-bold">Nilai per Siswa</h2>
        <Tabel
          head={[
            "Siswa",
            "Kelas",
            "Selesai",
            "Rata-rata Nilai",
            "Bintang",
            "Catatan",
          ]}
          rows={rows}
        />
      </section>
    </>
  );
}
