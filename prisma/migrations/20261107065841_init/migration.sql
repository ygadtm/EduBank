-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SISWA', 'GURU');

-- CreateEnum
CREATE TYPE "StatusSoal" AS ENUM ('DRAF', 'TERBIT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nisNip" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'SISWA',
    "kelas" INTEGER,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "harusGantiPassword" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mapel" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Mapel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Soal" (
    "id" TEXT NOT NULL,
    "mapelId" TEXT NOT NULL,
    "kelas" INTEGER NOT NULL,
    "topik" TEXT,
    "teks" TEXT NOT NULL,
    "pembahasan" TEXT,
    "status" "StatusSoal" NOT NULL DEFAULT 'DRAF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Soal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pilihan" (
    "id" TEXT NOT NULL,
    "soalId" TEXT NOT NULL,
    "teks" TEXT NOT NULL,
    "benar" BOOLEAN NOT NULL DEFAULT false,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Pilihan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Latihan" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "mapelId" TEXT NOT NULL,
    "kelas" INTEGER NOT NULL,
    "mulai" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "selesai" TIMESTAMP(3),

    CONSTRAINT "Latihan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jawaban" (
    "id" TEXT NOT NULL,
    "latihanId" TEXT NOT NULL,
    "soalId" TEXT NOT NULL,
    "pilihanId" TEXT,
    "benar" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Jawaban_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_nisNip_key" ON "User"("nisNip");

-- CreateIndex
CREATE INDEX "User_role_kelas_idx" ON "User"("role", "kelas");

-- CreateIndex
CREATE UNIQUE INDEX "Mapel_slug_key" ON "Mapel"("slug");

-- CreateIndex
CREATE INDEX "Soal_mapelId_kelas_status_idx" ON "Soal"("mapelId", "kelas", "status");

-- CreateIndex
CREATE INDEX "Pilihan_soalId_idx" ON "Pilihan"("soalId");

-- CreateIndex
CREATE INDEX "Latihan_siswaId_mulai_idx" ON "Latihan"("siswaId", "mulai");

-- CreateIndex
CREATE INDEX "Latihan_mapelId_kelas_idx" ON "Latihan"("mapelId", "kelas");

-- CreateIndex
CREATE INDEX "Jawaban_soalId_idx" ON "Jawaban"("soalId");

-- CreateIndex
CREATE UNIQUE INDEX "Jawaban_latihanId_soalId_key" ON "Jawaban"("latihanId", "soalId");

-- AddForeignKey
ALTER TABLE "Soal" ADD CONSTRAINT "Soal_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "Mapel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pilihan" ADD CONSTRAINT "Pilihan_soalId_fkey" FOREIGN KEY ("soalId") REFERENCES "Soal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Latihan" ADD CONSTRAINT "Latihan_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Latihan" ADD CONSTRAINT "Latihan_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "Mapel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jawaban" ADD CONSTRAINT "Jawaban_latihanId_fkey" FOREIGN KEY ("latihanId") REFERENCES "Latihan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jawaban" ADD CONSTRAINT "Jawaban_soalId_fkey" FOREIGN KEY ("soalId") REFERENCES "Soal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jawaban" ADD CONSTRAINT "Jawaban_pilihanId_fkey" FOREIGN KEY ("pilihanId") REFERENCES "Pilihan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Aturan tambahan di luar Prisma schema
CREATE UNIQUE INDEX "Pilihan_satu_benar" ON "Pilihan"("soalId") WHERE "benar" = true;

ALTER TABLE "User"
ADD CONSTRAINT "User_kelas_check"
CHECK ("kelas" IS NULL OR "kelas" IN (5, 6));
