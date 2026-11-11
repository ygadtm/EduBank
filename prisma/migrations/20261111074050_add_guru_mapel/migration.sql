-- CreateTable
CREATE TABLE "GuruMapel" (
    "guruId" TEXT NOT NULL,
    "mapelId" TEXT NOT NULL,
    "kelas" INTEGER NOT NULL,

    CONSTRAINT "GuruMapel_pkey" PRIMARY KEY ("guruId","mapelId","kelas")
);

-- CreateIndex
CREATE INDEX "GuruMapel_mapelId_kelas_idx" ON "GuruMapel"("mapelId", "kelas");

-- AddForeignKey
ALTER TABLE "GuruMapel" ADD CONSTRAINT "GuruMapel_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuruMapel" ADD CONSTRAINT "GuruMapel_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "Mapel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
