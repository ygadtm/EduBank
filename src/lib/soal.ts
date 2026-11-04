export type Soal = { q: string; o: string[]; a: number; e: string };
// Soal contoh (3 per mapel, urutan sama dengan SUBJECTS). Nanti diganti dengan data dari database.
export const SOAL: Soal[][] = [
  [
    {
      q: "Kata baku yang benar adalah ...",
      o: ["apotik", "apotek", "appotek", "apoteck"],
      a: 1,
      e: 'Menurut KBBI, kata bakunya adalah "apotek".',
    },
    {
      q: 'Lawan kata "rajin" adalah ...',
      o: ["giat", "malas", "tekun", "ulet"],
      a: 1,
      e: "Rajin berlawanan dengan malas.",
    },
    {
      q: "Kalimat yang diakhiri tanda tanya (?) disebut kalimat ...",
      o: ["perintah", "berita", "tanya", "seru"],
      a: 2,
      e: "Kalimat tanya dipakai untuk bertanya.",
    },
  ],
  [
    {
      q: "Perubahan air menjadi uap air disebut ...",
      o: ["kondensasi", "evaporasi", "presipitasi", "infiltrasi"],
      a: 1,
      e: "Evaporasi adalah penguapan air karena panas matahari.",
    },
    {
      q: "Hewan pemakan tumbuhan disebut ...",
      o: ["karnivora", "herbivora", "omnivora", "dekomposer"],
      a: 1,
      e: "Herbivora hanya memakan tumbuhan, contohnya sapi.",
    },
    {
      q: "Sumber energi utama bagi bumi adalah ...",
      o: ["bulan", "angin", "matahari", "air"],
      a: 2,
      e: "Matahari memberi cahaya dan panas untuk kehidupan.",
    },
  ],
  [
    {
      q: "3/4 + 1/4 = ...",
      o: ["1", "4/8", "2/4", "3/16"],
      a: 0,
      e: "Penyebutnya sama, jadi 3 + 1 = 4, sehingga 4/4 = 1.",
    },
    {
      q: "Luas persegi dengan sisi 6 cm adalah ...",
      o: ["12 cm²", "24 cm²", "36 cm²", "48 cm²"],
      a: 2,
      e: "Luas = sisi × sisi = 6 × 6 = 36 cm².",
    },
    {
      q: "Volume kubus dengan rusuk 3 cm adalah ...",
      o: ["9 cm³", "18 cm³", "27 cm³", "81 cm³"],
      a: 2,
      e: "Volume = 3 × 3 × 3 = 27 cm³.",
    },
  ],
  [
    {
      q: "Selat yang memisahkan Pulau Jawa dan Sumatra adalah ...",
      o: ["Selat Bali", "Selat Sunda", "Selat Malaka", "Selat Makassar"],
      a: 1,
      e: "Selat Sunda berada di antara Jawa dan Sumatra.",
    },
    {
      q: "Semboyan negara Indonesia adalah ...",
      o: [
        "Bhinneka Tunggal Ika",
        "Tut Wuri Handayani",
        "Garuda Pancasila",
        "Merah Putih",
      ],
      a: 0,
      e: "Artinya berbeda-beda tetapi tetap satu.",
    },
    {
      q: "Indonesia terletak di antara dua benua, yaitu ...",
      o: [
        "Asia dan Australia",
        "Afrika dan Eropa",
        "Amerika dan Asia",
        "Eropa dan Australia",
      ],
      a: 0,
      e: "Indonesia berada di antara benua Asia dan Australia.",
    },
  ],
  [
    {
      q: "Sila pertama Pancasila berbunyi ...",
      o: [
        "Kemanusiaan yang adil dan beradab",
        "Ketuhanan Yang Maha Esa",
        "Persatuan Indonesia",
        "Keadilan sosial bagi seluruh rakyat Indonesia",
      ],
      a: 1,
      e: "Sila pertama adalah Ketuhanan Yang Maha Esa.",
    },
    {
      q: "Kerja sama membersihkan lingkungan sekolah disebut ...",
      o: ["gotong royong", "persaingan", "pertengkaran", "keegoisan"],
      a: 0,
      e: "Gotong royong artinya bekerja bersama untuk kepentingan bersama.",
    },
    {
      q: "Keputusan bersama yang diambil lewat diskusi disebut ...",
      o: ["paksaan", "musyawarah", "undian", "perintah"],
      a: 1,
      e: "Musyawarah mencari kesepakatan bersama.",
    },
  ],
  [
    {
      q: '"Book" artinya ...',
      o: ["pensil", "buku", "tas", "meja"],
      a: 1,
      e: "Book = buku.",
    },
    {
      q: "I ... breakfast every morning.",
      o: ["eat", "eats", "eating", "ate"],
      a: 0,
      e: 'Dengan subjek "I", kata kerjanya tetap bentuk dasar: I eat.',
    },
    {
      q: '"Selamat pagi" dalam bahasa Inggris adalah ...',
      o: ["Good night", "Good morning", "Good evening", "Good bye"],
      a: 1,
      e: "Good morning dipakai di pagi hari.",
    },
  ],
];
