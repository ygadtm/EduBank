# EduBank - Web Bank Soal

# AKUN DEMO
## Siswa:
  ### NIS: 2025001
  ### Password: 12345678

## Guru:
  ### NIP: 124140081
  ### Password: 12345678


Aplikasi bank soal untuk satu sekolah. Next.js 15, PostgreSQL Supabase, Prisma 6.

Syarat: Node.js 20 atau lebih baru.

## Setup

1. Salin `.env.example` menjadi `.env`, lalu isi:

```env
DATABASE_URL="..."
DIRECT_URL="..."
AUTH_SECRET="..."
GURU_INIT_PASSWORD="..."
GURU_INIT_NIP="..."
GURU_INIT_NAMA="..."
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

- Guru: login dengan tab Guru, memakai `GURU_INIT_NIP` dan `GURU_INIT_PASSWORD`.
- Siswa contoh: NIS `2025001` sampai `2025006`. Password awal sama dengan NIS.
- Semua akun dipaksa mengganti password saat login pertama.

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
src/app/ganti-password/     ganti password wajib
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
- Materi pembelajaran masih statis di `src/lib/materi.ts`.
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
- Password awal siswa adalah NIS. Semua akun wajib mengganti password saat login pertama.
- Jangan gunakan password NIS untuk produksi jangka panjang tanpa pengawasan guru.
