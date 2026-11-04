import { SISWA, SUBJECTS } from "@/lib/data";
import { Bar, PageHead, Stat, Tabel, card, inp } from "@/components/ui";

const bintang = (v: number) => (v >= 85 ? "⭐⭐⭐" : v >= 65 ? "⭐⭐" : "⭐");
const warna = (v: number) =>
  v >= 80 ? "#059669" : v >= 65 ? "#2563eb" : "#d97706";

export default function Rekap() {
  const rows = SISWA.map((s) => [
    <b key="n">{s.n}</b>,
    `Kelas ${s.k}`,
    `${s.l} latihan`,
    <Bar key="b" v={s.v} c={warna(s.v)} />,
    bintang(s.v),
    s.v < 65 ? (
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
        icon="📊"
        title="Rekap Nilai"
        sub="Pantau hasil latihan setiap siswa."
      >
        <div className="flex flex-wrap gap-2">
          <select className={inp}>
            <option>Semua Mapel</option>
            {SUBJECTS.map((s) => (
              <option key={s.n}>{s.n}</option>
            ))}
          </select>
          <select className={inp}>
            <option>Semua Kelas</option>
            <option>Kelas 5</option>
            <option>Kelas 6</option>
          </select>
        </div>
      </PageHead>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Stat label="Rata-rata Kelas" value={73} unit="Poin" icon="📊" />
        <Stat label="Nilai Tertinggi" value={93} unit="Citra L." icon="🏆" />
        <Stat label="Perlu Bimbingan" value={2} unit="Siswa" icon="🤝" />
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
