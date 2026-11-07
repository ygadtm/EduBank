export const MAPEL = [
  {
    slug: "bahasa-indonesia",
    nama: "Bahasa Indonesia",
    deskripsi:
      "Latihan membaca cerita, pemahaman teks, dan tata bahasa.",
    urutan: 0,
  },
  {
    slug: "ipa",
    nama: "IPA Terpadu / IPAS",
    deskripsi: "Latihan sains, ekosistem, energi, dan siklus alam.",
    urutan: 1,
  },
  {
    slug: "matematika",
    nama: "Matematika",
    deskripsi: "Latihan hitung bilangan, pecahan, dan bangun datar.",
    urutan: 2,
  },
  {
    slug: "ips",
    nama: "IPS Terpadu",
    deskripsi: "Latihan peta nusantara, sejarah, dan lingkungan sosial.",
    urutan: 3,
  },
  {
    slug: "ppkn",
    nama: "Tematik & PPKn",
    deskripsi:
      "Latihan kebersamaan, aturan bermasyarakat, dan nilai Pancasila.",
    urutan: 4,
  },
  {
    slug: "bahasa-inggris",
    nama: "Bahasa Inggris",
    deskripsi:
      "Latihan kosakata harian, benda sekitar, dan percakapan sederhana.",
    urutan: 5,
  },
] as const;

export type SeedSoal = {
  mapelSlug: string;
  teks: string;
  pilihan: string[];
  benar: number;
  pembahasan: string;
};

export const SOAL: SeedSoal[] = [
  {
    mapelSlug: "bahasa-indonesia",
    teks: "Kata baku yang benar adalah ...",
    pilihan: ["apotik", "apotek", "appotek", "apoteck"],
    benar: 1,
    pembahasan: 'Menurut KBBI, kata bakunya adalah "apotek".',
  },
  {
    mapelSlug: "bahasa-indonesia",
    teks: 'Lawan kata "rajin" adalah ...',
    pilihan: ["giat", "malas", "tekun", "ulet"],
    benar: 1,
    pembahasan: "Rajin berlawanan dengan malas.",
  },
  {
    mapelSlug: "bahasa-indonesia",
    teks: "Kalimat yang diakhiri tanda tanya (?) disebut kalimat ...",
    pilihan: ["perintah", "berita", "tanya", "seru"],
    benar: 2,
    pembahasan: "Kalimat tanya dipakai untuk bertanya.",
  },
  {
    mapelSlug: "ipa",
    teks: "Perubahan air menjadi uap air disebut ...",
    pilihan: ["kondensasi", "evaporasi", "presipitasi", "infiltrasi"],
    benar: 1,
    pembahasan: "Evaporasi adalah penguapan air karena panas matahari.",
  },
  {
    mapelSlug: "ipa",
    teks: "Hewan pemakan tumbuhan disebut ...",
    pilihan: ["karnivora", "herbivora", "omnivora", "dekomposer"],
    benar: 1,
    pembahasan: "Herbivora hanya memakan tumbuhan, contohnya sapi.",
  },
  {
    mapelSlug: "ipa",
    teks: "Sumber energi utama bagi bumi adalah ...",
    pilihan: ["bulan", "angin", "matahari", "air"],
    benar: 2,
    pembahasan: "Matahari memberi cahaya dan panas untuk kehidupan.",
  },
  {
    mapelSlug: "matematika",
    teks: "3/4 + 1/4 = ...",
    pilihan: ["1", "4/8", "2/4", "3/16"],
    benar: 0,
    pembahasan:
      "Penyebutnya sama, jadi 3 + 1 = 4, sehingga 4/4 = 1.",
  },
  {
    mapelSlug: "matematika",
    teks: "Luas persegi dengan sisi 6 cm adalah ...",
    pilihan: ["12 cm²", "24 cm²", "36 cm²", "48 cm²"],
    benar: 2,
    pembahasan: "Luas = sisi × sisi = 6 × 6 = 36 cm².",
  },
  {
    mapelSlug: "matematika",
    teks: "Volume kubus dengan rusuk 3 cm adalah ...",
    pilihan: ["9 cm³", "18 cm³", "27 cm³", "81 cm³"],
    benar: 2,
    pembahasan: "Volume = 3 × 3 × 3 = 27 cm³.",
  },
  {
    mapelSlug: "ips",
    teks: "Selat yang memisahkan Pulau Jawa dan Sumatra adalah ...",
    pilihan: ["Selat Bali", "Selat Sunda", "Selat Malaka", "Selat Makassar"],
    benar: 1,
    pembahasan: "Selat Sunda berada di antara Jawa dan Sumatra.",
  },
  {
    mapelSlug: "ips",
    teks: "Semboyan negara Indonesia adalah ...",
    pilihan: [
      "Bhinneka Tunggal Ika",
      "Tut Wuri Handayani",
      "Garuda Pancasila",
      "Merah Putih",
    ],
    benar: 0,
    pembahasan: "Artinya berbeda-beda tetapi tetap satu.",
  },
  {
    mapelSlug: "ips",
    teks: "Indonesia terletak di antara dua benua, yaitu ...",
    pilihan: [
      "Asia dan Australia",
      "Afrika dan Eropa",
      "Amerika dan Asia",
      "Eropa dan Australia",
    ],
    benar: 0,
    pembahasan:
      "Indonesia berada di antara benua Asia dan Australia.",
  },
  {
    mapelSlug: "ppkn",
    teks: "Sila pertama Pancasila berbunyi ...",
    pilihan: [
      "Kemanusiaan yang adil dan beradab",
      "Ketuhanan Yang Maha Esa",
      "Persatuan Indonesia",
      "Keadilan sosial bagi seluruh rakyat Indonesia",
    ],
    benar: 1,
    pembahasan: "Sila pertama adalah Ketuhanan Yang Maha Esa.",
  },
  {
    mapelSlug: "ppkn",
    teks: "Kerja sama membersihkan lingkungan sekolah disebut ...",
    pilihan: ["gotong royong", "persaingan", "pertengkaran", "keegoisan"],
    benar: 0,
    pembahasan:
      "Gotong royong artinya bekerja bersama untuk kepentingan bersama.",
  },
  {
    mapelSlug: "ppkn",
    teks: "Keputusan bersama yang diambil lewat diskusi disebut ...",
    pilihan: ["paksaan", "musyawarah", "undian", "perintah"],
    benar: 1,
    pembahasan: "Musyawarah mencari kesepakatan bersama.",
  },
  {
    mapelSlug: "bahasa-inggris",
    teks: '"Book" artinya ...',
    pilihan: ["pensil", "buku", "tas", "meja"],
    benar: 1,
    pembahasan: "Book = buku.",
  },
  {
    mapelSlug: "bahasa-inggris",
    teks: "I ... breakfast every morning.",
    pilihan: ["eat", "eats", "eating", "ate"],
    benar: 0,
    pembahasan:
      'Dengan subjek "I", kata kerjanya tetap bentuk dasar: I eat.',
  },
  {
    mapelSlug: "bahasa-inggris",
    teks: '"Selamat pagi" dalam bahasa Inggris adalah ...',
    pilihan: ["Good night", "Good morning", "Good evening", "Good bye"],
    benar: 1,
    pembahasan: "Good morning dipakai di pagi hari.",
  },
];

export const SISWA = [
  { nama: "Isnaini Febriana", nisNip: "2025001", kelas: 6 },
  { nama: "Budi Santoso", nisNip: "2025002", kelas: 5 },
  { nama: "Citra Lestari", nisNip: "2025003", kelas: 6 },
  { nama: "Dimas Pratama", nisNip: "2025004", kelas: 5 },
  { nama: "Eka Putri", nisNip: "2025005", kelas: 6 },
  { nama: "Fajar Ramadhan", nisNip: "2025006", kelas: 5 },
];
