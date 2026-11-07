-- CreateEnum
CREATE TYPE "StatusPaketLatihan" AS ENUM ('DRAF', 'TERBIT');

-- AlterTable
ALTER TABLE "Latihan" ADD COLUMN     "paketId" TEXT;

-- CreateTable
CREATE TABLE "PaketLatihan" (
    "id" TEXT NOT NULL,
    "mapelId" TEXT NOT NULL,
    "kelas" INTEGER NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "durasiMenit" INTEGER NOT NULL DEFAULT 5,
    "status" "StatusPaketLatihan" NOT NULL DEFAULT 'DRAF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaketLatihan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaketLatihanSoal" (
    "paketId" TEXT NOT NULL,
    "soalId" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PaketLatihanSoal_pkey" PRIMARY KEY ("paketId","soalId")
);

-- CreateTable
CREATE TABLE "LatihanSoal" (
    "latihanId" TEXT NOT NULL,
    "soalId" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LatihanSoal_pkey" PRIMARY KEY ("latihanId","soalId")
);

-- CreateIndex
CREATE INDEX "PaketLatihan_mapelId_kelas_status_urutan_idx" ON "PaketLatihan"("mapelId", "kelas", "status", "urutan");

-- CreateIndex
CREATE UNIQUE INDEX "PaketLatihan_mapelId_kelas_judul_key" ON "PaketLatihan"("mapelId", "kelas", "judul");

-- CreateIndex
CREATE INDEX "PaketLatihanSoal_soalId_idx" ON "PaketLatihanSoal"("soalId");

-- CreateIndex
CREATE INDEX "LatihanSoal_soalId_idx" ON "LatihanSoal"("soalId");

-- CreateIndex
CREATE INDEX "Latihan_paketId_idx" ON "Latihan"("paketId");

-- AddForeignKey
ALTER TABLE "PaketLatihan" ADD CONSTRAINT "PaketLatihan_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "Mapel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaketLatihanSoal" ADD CONSTRAINT "PaketLatihanSoal_paketId_fkey" FOREIGN KEY ("paketId") REFERENCES "PaketLatihan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaketLatihanSoal" ADD CONSTRAINT "PaketLatihanSoal_soalId_fkey" FOREIGN KEY ("soalId") REFERENCES "Soal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Latihan" ADD CONSTRAINT "Latihan_paketId_fkey" FOREIGN KEY ("paketId") REFERENCES "PaketLatihan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LatihanSoal" ADD CONSTRAINT "LatihanSoal_latihanId_fkey" FOREIGN KEY ("latihanId") REFERENCES "Latihan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LatihanSoal" ADD CONSTRAINT "LatihanSoal_soalId_fkey" FOREIGN KEY ("soalId") REFERENCES "Soal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill: satu paket default per mapel + kelas yang punya soal terbit.
INSERT INTO "PaketLatihan" (
  "id", "mapelId", "kelas", "judul", "deskripsi", "urutan", "durasiMenit", "status", "createdAt", "updatedAt"
)
SELECT
  'paket_' || md5(s."mapelId" || ':' || s."kelas"::text),
  s."mapelId",
  s."kelas",
  'Latihan Soal 1',
  NULL,
  0,
  5,
  'TERBIT'::"StatusPaketLatihan",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM (
  SELECT DISTINCT "mapelId", "kelas"
  FROM "Soal"
  WHERE "status" = 'TERBIT'
) AS s
ON CONFLICT ("mapelId", "kelas", "judul") DO NOTHING;

-- Backfill: semua soal terbit masuk ke paket default.
INSERT INTO "PaketLatihanSoal" ("paketId", "soalId", "urutan")
SELECT
  p."id",
  s."id",
  (ROW_NUMBER() OVER (PARTITION BY p."id" ORDER BY s."createdAt", s."id") - 1)::int
FROM "PaketLatihan" AS p
JOIN "Soal" AS s
  ON s."mapelId" = p."mapelId"
 AND s."kelas" = p."kelas"
 AND s."status" = 'TERBIT'
WHERE p."judul" = 'Latihan Soal 1'
ON CONFLICT ("paketId", "soalId") DO NOTHING;

-- Backfill: percobaan lama dihubungkan ke paket default yang sesuai.
UPDATE "Latihan" AS l
SET "paketId" = p."id"
FROM "PaketLatihan" AS p
WHERE l."paketId" IS NULL
  AND p."mapelId" = l."mapelId"
  AND p."kelas" = l."kelas"
  AND p."judul" = 'Latihan Soal 1';

-- Backfill: snapshot soal percobaan lama dari paket default.
INSERT INTO "LatihanSoal" ("latihanId", "soalId", "urutan")
SELECT l."id", ps."soalId", ps."urutan"
FROM "Latihan" AS l
JOIN "PaketLatihanSoal" AS ps ON ps."paketId" = l."paketId"
ON CONFLICT ("latihanId", "soalId") DO NOTHING;
