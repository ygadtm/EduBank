export type Materi = {
  mapelSlug: string;
  kelas: 5 | 6;
  judul: string;
  ringkasan: string;
  videoUrl?: string;
  urutan: number;
};

const DASAR = [
  {
    mapelSlug: "bahasa-indonesia",
    judul: "Teks Narasi & Puisi Anak",
    ringkasan:
      "Belajar merangkai kata indah, memahami alur cerita dongeng, dan puisi.",
  },
  {
    mapelSlug: "ipa",
    judul: "Siklus Air & Rantai Makanan",
    ringkasan:
      "Mengapa hujan turun dan bagaimana elang menjaga keseimbangan alam.",
  },
  {
    mapelSlug: "matematika",
    judul: "Pecahan & Bangun Ruang",
    ringkasan:
      "Cara gampang menghitung volume balok, prisma, dan pecahan.",
  },
  {
    mapelSlug: "ips",
    judul: "Kenampakan Alam & Budaya",
    ringkasan:
      "Keliling Nusantara! Mengenal gunung berapi, selat, dan suku bangsa.",
  },
  {
    mapelSlug: "ppkn",
    judul: "Nilai Pancasila & Gotong Royong",
    ringkasan:
      "Praktik baik di rumah dan sekolah: tolong-menolong dan musyawarah.",
  },
  {
    mapelSlug: "bahasa-inggris",
    judul: "Daily Activities & Fun Vocab",
    ringkasan:
      "Hafal kosakata kegiatan sehari-hari dari bangun pagi sampai tidur.",
  },
] as const;

export const MATERI: Materi[] = DASAR.flatMap((materi, index) =>
  ([5, 6] as const).map((kelas) => ({
    ...materi,
    kelas,
    urutan: index * 10 + kelas,
  })),
);
