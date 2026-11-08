-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "mapelId" TEXT NOT NULL,
    "kelas" INTEGER NOT NULL,
    "judul" TEXT NOT NULL,
    "ringkasan" TEXT,
    "videoUrl" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Video_mapelId_kelas_idx" ON "Video"("mapelId", "kelas");

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "Mapel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
