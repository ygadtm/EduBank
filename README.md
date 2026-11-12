# EduBank - Web Bank Soal

# AKUN DEMO
## Siswa:
  ### Nama: Citra Lestari (login pakai nama)
  ### Password: 1112 (4 digit akhir NISN)

## Guru (Admin):
  ### NIP: 19761025009021001
  ### Password: 19761025009021001 (ganti saat login pertama)

## Guru:
  ### NIP: 198409092025212080
  ### Password: 198409092025212080 (ganti saat login pertama)


Aplikasi bank soal untuk satu sekolah. Next.js 15, PostgreSQL Supabase, Prisma 6.

Syarat: Node.js 20 atau lebih baru.

## Setup

1. Salin `.env.example` menjadi `.env`, lalu isi:

```env
DATABASE_URL="..."
DIRECT_URL="..."
AUTH_SECRET="..."
```

- `DATABASE_URL`: transaction pooler Supabase, port 6543, dengan `pgbouncer=true&connection_limit=1`.
- `DIRECT_URL`: session pooler Supabase, port 5432.
- `AUTH_SECRET`: minimal 32 byte acak. Generate dengan:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

2. Pasang dependensi:

```bash
npm install
```

3. Jalankan migrasi dan seed:

```bash
npm run db:migrate
npm run db:seed
npm run db:check
```

4. Jalankan aplikasi:

```bash
npm run dev
```

Buka http://localhost:3001.

## Akun awal

- Guru: login dengan tab Guru, memakai NIP dan password awal = NIP. Data guru diambil dari `prisma/seed-data.ts` (`GURU`); `BADRI, S.Pd` (NIP `19761025009021001`) berperan admin tunggal.
- Siswa contoh: nama + 4 digit akhir NISN sebagai password. Password tidak wajib diganti.
- Hanya guru yang wajib mengganti password saat login pertama.
- Admin mengelola akun di `/guru/siswa` (hapus/reset siswa) dan `/guru/pengguna` (tambah/hapus/reset guru). Password reset guru diset ke NIP-nya dan wajib diganti saat login berikutnya.

Password tidak pernah disimpan sebagai teks biasa. Hash memakai `bcryptjs`.

## Perintah database

```bash
npm run db:migrate     # buat/terapkan migrasi di development
npm run db:deploy      # terapkan migrasi di produksi
npm run db:seed        # isi mapel, soal, akun awal, dan paket latihan
npm run db:check       # validasi jumlah data dan kunci jawaban
npm run db:studio      # buka Prisma Studio
```

Seed memakai `upsert` dengan ID stabil. Seed ulang tidak membuat duplikat. Seed menghapus dan membuat ulang pilihan jawaban, jadi jangan jalankan seed di database produksi yang sudah berisi jawaban siswa.

## Impor soal otomatis

Guru membuka `/guru/impor-soal`, memilih mapel dan kelas, lalu mengunggah foto, PDF, atau Excel. Hasil ekstraksi tampil sebagai pratinjau yang bisa diedit. Guru memeriksa kunci jawaban, lalu mengimpor. Semua soal tersimpan sebagai Draf kecuali guru memilih Terbitkan.

- Foto JPG/PNG/WEBP dan PDF diekstrak dengan Google Gemini (`gemini-3.5-flash`).
- Excel XLSX/XLS diparse lokal dengan SheetJS. Kolom: `pertanyaan`, `pilihan_a`, `pilihan_b`, `pilihan_c`, `pilihan_d`, `kunci`, `topik`, `pembahasan`. Kunci boleh A/B/C/D atau 1-4. Template dapat diunduh dari halaman impor.
- Batas: 10 MB dan 30 soal per impor.
- File diunggah langsung dari browser ke bucket privat Supabase Storage, diunduh server untuk ekstraksi, lalu dihapus. File tidak disimpan permanen.

Siapkan satu kali:

1. Isi `.env`:

```env
GEMINI_API_KEY="..."
GEMINI_MODEL="gemini-3.5-flash"
SUPABASE_URL="https://<project-ref>.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="..."
```

`SUPABASE_SERVICE_ROLE_KEY` hanya boleh di server. Jangan memberi prefix `NEXT_PUBLIC_`.

2. Buat bucket privat di SQL Editor Supabase:

```sql
insert into storage.buckets (id, name, public)
values ('impor-soal', 'impor-soal', false)
on conflict (id) do nothing;
```

3. Uji parser Excel tanpa database:

```bash
npm run check:impor
```

Catatan produksi: route ekstraksi memakai `maxDuration = 60`. Kuota gratis Gemini dibatasi per menit dan per hari. Bila kuota habis, halaman menampilkan pesan untuk mencoba lagi.

## Struktur

```
prisma/schema.prisma        skema database
prisma/seed.ts              seed idempoten
prisma/check.ts             pemeriksaan data
src/lib/db.ts               instance Prisma tunggal
src/lib/cache.ts            cache mapel dan statistik (30 detik)
src/lib/jwt.ts              tanda tangan sesi, aman untuk Edge
src/lib/session.ts          cookie sesi
src/lib/password.ts         hash dan verifikasi password
src/lib/auth.ts             proteksi role dan status ganti password
src/lib/actions/            Server Action untuk login, soal, siswa, latihan
src/middleware.ts           proteksi route berdasarkan sesi
src/app/page.tsx            login NIS/NIP
src/app/ganti-password/     ganti password wajib (guru)
src/app/guru/               beranda, soal, soal-form, siswa, rekap, latihan, latihan-form
src/app/siswa/(menu)/       beranda, bank-soal, materi, hasil-latihan
src/app/siswa/kerjakan-soal kuis layar penuh
vercel.json                 region fungsi Vercel: sin1 (Singapura)
```

## Alur data

- Halaman membaca data lewat Server Component dan Prisma.
- Tulisan memakai Server Action dengan validasi sesi dan role.
- Siswa hanya dapat membaca latihan miliknya sendiri.
- Jawaban dinilai di server dari kunci jawaban di database, bukan dari client.
- Video pembelajaran dikelola guru lewat `/guru/video`, dilihat siswa lewat `/siswa/materi`.
- Warna dan ikon mapel tetap di `src/lib/mapel.ts`, bukan di database.

## Produksi

- Set `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET` di Vercel.
- Supabase memakai region Singapura (`ap-southeast-1`). Region fungsi Vercel diatur `sin1` di `vercel.json`.
- `DATABASE_URL` di Vercel memakai transaction pooler port 6543 dengan `pgbouncer=true&connection_limit=1`. Jangan memakai session pooler 5432 untuk runtime serverless.
- Dev lokal boleh memakai session pooler 5432 sebagai `DATABASE_URL` agar lebih cepat.
- Jalankan `npm run db:deploy` sebelum atau saat rilis, bukan di dalam build.
- Statistik guru dan jumlah soal di-cache 30 detik. Jangan jalankan seed di database produksi.
- Supabase paket gratis di-pause setelah sekitar satu minggu tanpa aktivitas. Tambahkan cron harian atau upgrade ke Pro bila situs harus selalu aktif.
- Backup database secara berkala dengan `pg_dump`.

### Migrasi Supabase ke project baru

1. Buat project Supabase Singapura di dashboard.
2. Simpan URL lama sebagai `OLD_DIRECT_URL`; jangan hapus project lama sebelum verifikasi.
3. Terapkan skema ke project baru dengan `npx prisma migrate deploy`.
4. Dump data lama tanpa tabel migrasi:

```powershell
pg_dump "$env:OLD_DIRECT_URL" `
  --data-only --schema=public `
  --exclude-table=_prisma_migrations `
  --format=custom --file=edubank-data.dump
pg_restore --dbname="$env:NEW_DIRECT_URL" `
  --data-only --schema=public `
  --no-owner --no-privileges edubank-data.dump
```

5. Verifikasi `npx prisma migrate status` dan jumlah data.
6. Perbarui `DATABASE_URL`, `DIRECT_URL`, dan region di Vercel. Pertahankan `AUTH_SECRET` agar sesi lama tetap valid.
7. Hapus file `.dump` setelah migrasi selesai.

Jika `pg_dump` tidak tersedia, salin data memakai Prisma:

```powershell
$env:OLD_DATABASE_URL = "<session pooler project lama, port 5432>"
$env:NEW_DATABASE_URL = "<session pooler project baru, port 5432>"
npx tsx prisma/copy.ts
Remove-Item Env:OLD_DATABASE_URL, Env:NEW_DATABASE_URL
```

Skrip menolak berjalan bila database tujuan sudah berisi data. Skrip menyalin User, Mapel, Soal, Pilihan, Latihan, dan Jawaban dengan ID dan hash password yang sama. Jalankan `npx prisma migrate deploy` ke project baru terlebih dahulu.

## Keamanan

- `.env` tidak masuk git. Hanya `.env.example` yang boleh di-commit.
- Password awal siswa adalah NIS; siswa tidak wajib mengganti password. Password guru ditetapkan admin saat membuat akun.
- Jangan gunakan password NIS untuk produksi jangka panjang tanpa pengawasan guru.
