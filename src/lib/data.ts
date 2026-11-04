export type Subject = {
  n: string;
  d: string;
  c: string;
  bg: string;
  i: string;
  v: number;
  mt: string;
  md: string;
};
// Data contoh. Nanti diganti dengan data dari database (Prisma).
export const SUBJECTS: Subject[] = [
  {
    n: "Bahasa Indonesia",
    d: "Latihan membaca cerita, pemahaman teks, dan tata bahasa.",
    c: "#dc2626",
    bg: "#fef2f2",
    i: "📖",
    v: 8,
    mt: "Teks Narasi & Puisi Anak",
    md: "Belajar merangkai kata indah, memahami alur cerita dongeng, dan puisi.",
  },
  {
    n: "IPA Terpadu / IPAS",
    d: "Latihan sains, ekosistem, energi, dan siklus alam.",
    c: "#059669",
    bg: "#ecfdf5",
    i: "🌿",
    v: 10,
    mt: "Siklus Air & Rantai Makanan",
    md: "Mengapa hujan turun dan bagaimana elang menjaga keseimbangan alam.",
  },
  {
    n: "Matematika",
    d: "Latihan hitung bilangan, pecahan, dan bangun datar.",
    c: "#2563eb",
    bg: "#eff6ff",
    i: "🧮",
    v: 12,
    mt: "Pecahan & Bangun Ruang",
    md: "Cara gampang menghitung volume balok, prisma, dan pecahan.",
  },
  {
    n: "IPS Terpadu",
    d: "Latihan peta nusantara, sejarah, dan lingkungan sosial.",
    c: "#0284c7",
    bg: "#f0f9ff",
    i: "🌏",
    v: 7,
    mt: "Kenampakan Alam & Budaya",
    md: "Keliling Nusantara! Mengenal gunung berapi, selat, dan suku bangsa.",
  },
  {
    n: "Tematik & PPKn",
    d: "Latihan kebersamaan, aturan bermasyarakat, dan nilai Pancasila.",
    c: "#d97706",
    bg: "#fffbeb",
    i: "🛡️",
    v: 9,
    mt: "Nilai Pancasila & Gotong Royong",
    md: "Praktik baik di rumah dan sekolah: tolong-menolong dan musyawarah.",
  },
  {
    n: "Bahasa Inggris",
    d: "Latihan kosakata harian, benda sekitar, dan percakapan sederhana.",
    c: "#9333ea",
    bg: "#faf5ff",
    i: "🔤",
    v: 11,
    mt: "Daily Activities & Fun Vocab",
    md: "Hafal kosakata kegiatan sehari-hari dari bangun pagi sampai tidur.",
  },
];
export const DAFTAR_SOAL = [
  {
    q: "Kata baku yang benar adalah ...",
    m: 0,
    k: 6,
    s: "Terbit",
    t: "3 Nov 2026",
  },
  {
    q: "Perubahan air menjadi uap air disebut ...",
    m: 1,
    k: 6,
    s: "Terbit",
    t: "2 Nov 2026",
  },
  { q: "3/4 + 1/4 = ...", m: 2, k: 5, s: "Draf", t: "2 Nov 2026" },
  {
    q: "Selat yang memisahkan Pulau Jawa dan Sumatra adalah ...",
    m: 3,
    k: 6,
    s: "Terbit",
    t: "30 Okt 2026",
  },
  {
    q: "Sila pertama Pancasila berbunyi ...",
    m: 4,
    k: 5,
    s: "Terbit",
    t: "29 Okt 2026",
  },
  { q: '"Book" artinya ...', m: 5, k: 5, s: "Draf", t: "28 Okt 2026" },
  {
    q: "Luas persegi dengan sisi 6 cm adalah ...",
    m: 2,
    k: 6,
    s: "Terbit",
    t: "27 Okt 2026",
  },
  {
    q: "Hewan pemakan tumbuhan disebut ...",
    m: 1,
    k: 5,
    s: "Terbit",
    t: "26 Okt 2026",
  },
];
export const SISWA = [
  { n: "Isnaini Febriana", nis: "2025001", k: 6, l: 12, v: 88 },
  { n: "Budi Santoso", nis: "2025002", k: 5, l: 9, v: 74 },
  { n: "Citra Lestari", nis: "2025003", k: 6, l: 14, v: 93 },
  { n: "Dimas Pratama", nis: "2025004", k: 5, l: 6, v: 58 },
  { n: "Eka Putri", nis: "2025005", k: 6, l: 10, v: 81 },
  { n: "Fajar Ramadhan", nis: "2025006", k: 5, l: 3, v: 46 },
];
export const RATA = [88, 79, 72, 81, 90, 76];
