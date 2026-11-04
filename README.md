# EduBank – versi Next.js (tampilan saja)

Syarat: Node.js 20 atau lebih baru (cek dengan `node -v`).

    npm install
    npm run dev

Buka http://localhost:3000. Data masih contoh di `src/lib/data.ts`. Belum ada Prisma atau Supabase.

```
src/app/page.tsx                  Login siswa dan guru
src/app/siswa/(menu)/             Halaman siswa dengan sidebar: beranda, bank-soal, materi, hasil-latihan
src/app/siswa/kerjakan-soal      Kuis layar penuh (tanpa sidebar), ?m= nomor mapel
src/app/guru/                     beranda, soal, soal-form, siswa (impor Excel), rekap
src/components/                   AppShell (sidebar + menu HP), klien.tsx, ui.tsx (kartu, tabel, badge)
src/lib/                          data.ts dan soal.ts (data contoh)
```
