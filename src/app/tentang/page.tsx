import type { Metadata } from "next";
import Link from "next/link";
import { btn, card } from "@/components/ui";

const JUDUL = "EduBank SDN 1 Fajar Baru – Bank Soal & Latihan Interaktif";
const DESKRIPSI =
  "Bank soal dan latihan soal interaktif untuk siswa kelas V–VI SDN 1 Fajar Baru. Dilengkapi materi dan video pembelajaran dari guru.";

export const metadata: Metadata = {
  title: { absolute: JUDUL },
  description: DESKRIPSI,
  keywords: [
    "edubank",
    "sdn 1 fajar baru",
    "bank soal",
    "latihan soal",
    "soal kelas 5",
    "soal kelas 6",
    "website edubank sdn 1 fajar baru",
  ],
  alternates: { canonical: "/tentang" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/tentang",
    siteName: "EduBank SDN 1 Fajar Baru",
    title: JUDUL,
    description: DESKRIPSI,
  },
};

const FITUR = [
  "Bank soal dan latihan soal interaktif kelas V–VI",
  "Materi dan video pembelajaran dari guru",
  "Penilaian otomatis dan rekap hasil latihan siswa",
  "Dashboard statistik: soal dikerjakan, benar, dan salah",
];

export default function HalamanTentang() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12">
      <article className={`${card} p-6 sm:p-8`}>
        <h1 className="text-[26px] font-bold leading-[34px] text-ink sm:text-[30px] sm:leading-[38px]">
          EduBank SDN 1 Fajar Baru
        </h1>

        <p className="mt-4 text-base leading-7 text-muted">
          EduBank adalah bank soal dan latihan soal interaktif untuk siswa kelas
          V–VI SDN 1 Fajar Baru. Guru dapat mengunggah soal, materi, dan video
          pembelajaran. Siswa dapat berlatih mengerjakan soal secara mandiri
          kapan saja.
        </p>

        <h2 className="mt-8 text-lg font-bold text-ink">Fitur</h2>
        <ul className="mt-3 space-y-2.5">
          {FITUR.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm leading-6 text-ink">
              <span
                aria-hidden="true"
                className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-accent/20 bg-accent/10 text-[11px] font-bold text-accent"
              >
                ✓
              </span>
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Link href="/" className={`${btn} inline-flex`}>
            Masuk ke EduBank
          </Link>
        </div>
      </article>
    </main>
  );
}
