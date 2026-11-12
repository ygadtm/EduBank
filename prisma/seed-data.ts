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
    nama: "IPAS (Ilmu Pengetahuan Alam dan Sosial)",
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
    slug: "ppkn",
    nama: "Tematik & PPKn",
    deskripsi:
      "Latihan kebersamaan, aturan bermasyarakat, dan nilai Pancasila.",
    urutan: 3,
  },
  {
    slug: "bahasa-inggris",
    nama: "Bahasa Inggris",
    deskripsi:
      "Latihan kosakata harian, benda sekitar, dan percakapan sederhana.",
    urutan: 4,
  },
  {
    slug: "agama",
    nama: "Agama",
    deskripsi: "Latihan pendidikan agama.",
    urutan: 5,
  },
  {
    slug: "penjaskes",
    nama: "Penjaskes",
    deskripsi: "Latihan pendidikan jasmani dan kesehatan.",
    urutan: 6,
  },
] as const;

export type SeedSoal = {
  mapelSlug: string;
  /**
   * Slug mapel lama. Dipakai hanya untuk membentuk ID soal seed agar tetap
   * stabil ketika sebuah mapel digabung ke mapel lain.
   */
  idSlug?: string;
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
    mapelSlug: "ipa",
    idSlug: "ips",
    teks: "Selat yang memisahkan Pulau Jawa dan Sumatra adalah ...",
    pilihan: ["Selat Bali", "Selat Sunda", "Selat Malaka", "Selat Makassar"],
    benar: 1,
    pembahasan: "Selat Sunda berada di antara Jawa dan Sumatra.",
  },
  {
    mapelSlug: "ipa",
    idSlug: "ips",
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
    mapelSlug: "ipa",
    idSlug: "ips",
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
  { nama: "ANISA SYAFIRA", nisNip: "3162259033", kelas: 5 },
  { nama: "ARSYIL AQIL FIKRI", nisNip: "0152778929", kelas: 5 },
  { nama: "AZKA HAFIZ PRASETYO", nisNip: "3167891167", kelas: 5 },
  { nama: "INDRA DWI ADRIAN PUTRA", nisNip: "3152540598", kelas: 5 },
  { nama: "IVANDER KHALFANI", nisNip: "3157125515", kelas: 5 },
  { nama: "NADILA VAYRO", nisNip: "3146870418", kelas: 5 },
  { nama: "RAFLI WIRATAMA", nisNip: "3152714659", kelas: 5 },
  { nama: "TRISTAN MUSYAFFA", nisNip: "3156811997", kelas: 5 },
  { nama: "ADIBA KHEIRUNISA", nisNip: "3145642790", kelas: 6 },
  { nama: "GADIZHA ISMAIL", nisNip: "3160598388", kelas: 6 },
  { nama: "KENJO NAJAM MU'ARIF", nisNip: "3159253604", kelas: 6 },
  { nama: "M. IRWAN OKTA PRATAMA", nisNip: "3122547237", kelas: 6 },
  { nama: "MUHAMMAD IRFAN ARDIANSY", nisNip: "3125951403", kelas: 6 },
  { nama: "ROHMAN ALAMSA", nisNip: "3145937338", kelas: 6 },
  { nama: "SA'AD ROFIF AL-HAFAZHI", nisNip: "3140281019", kelas: 6 },
  { nama: "CITRA LESTARI", nisNip: "1111111112", kelas: 6 },
  { nama: "ANNUR AL FAJRI", nisNip: "1111111113", kelas: 6 },
];

export const GURU = [
  { nama: "DEWI SARI, S.Pd", nisNip: "197202142003122002", admin: false },
  { nama: "FAUZIAH RM,S.Pd, SD", nisNip: "197109011998032003", admin: false },
  { nama: "FITRIYANTI, S.Pd", nisNip: "197410221998032001", admin: false },
  { nama: "BADRI, S.Pd", nisNip: "19761025009021001", admin: true },
  { nama: "ARJUNAWATI, S.Pd", nisNip: "196807112008012014", admin: false },
  { nama: "YURNALISAKTI, S.Pd", nisNip: "198610042010012015", admin: false },
  { nama: "DEVI ARYANTI, S.Pd", nisNip: "198409092025212080", admin: false },
  { nama: "ARNA FEBRIA, S.Pd", nisNip: "1111111111", admin: false },
  { nama: "FERONICA NURMALA SHINTA, S.Pd", nisNip: "2222222222", admin: false },
];
