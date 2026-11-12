export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_SOAL_IMPOR = 30;
export const BATAS_TEKS = 4000;
export const BATAS_PILIHAN = 1000;
export const BATAS_TOPIK = 200;

export type SoalDraft = {
  teks: string;
  pilihan: string[];
  kunci: number | null;
  topik: string;
  pembahasan: string;
};

export type ImporPayload = {
  mapelId: string;
  kelas: number;
  topik: string;
  status: "DRAF" | "TERBIT";
  soal: SoalDraft[];
};

export const MIME_IMPOR = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/octet-stream",
];

export const EKSTENSI_IMPOR = ["jpg", "jpeg", "png", "webp", "pdf", "xlsx", "xls"];

export function ekstensiFile(nama: string) {
  const cocok = /\.([a-z0-9]+)$/i.exec(nama.trim());
  return cocok ? cocok[1].toLowerCase() : "";
}

export function normalisasiDraft(
  draft?: Partial<SoalDraft> | null,
): SoalDraft {
  const sumber = Array.isArray(draft?.pilihan) ? draft.pilihan : [];
  const pilihan = Array.from({ length: 4 }, (_, i) =>
    String(sumber[i] ?? "").trim().slice(0, BATAS_PILIHAN),
  );
  const kunci =
    typeof draft?.kunci === "number" &&
    Number.isInteger(draft.kunci) &&
    draft.kunci >= 0 &&
    draft.kunci < 4
      ? draft.kunci
      : null;

  return {
    teks: String(draft?.teks ?? "").trim().slice(0, BATAS_TEKS),
    pilihan,
    kunci,
    topik: String(draft?.topik ?? "").trim().slice(0, BATAS_TOPIK),
    pembahasan: String(draft?.pembahasan ?? "").trim().slice(0, BATAS_TEKS),
  };
}

export function validasiDraft(draft: SoalDraft) {
  if (!draft.teks) return "Pertanyaan kosong.";
  if (draft.pilihan.length !== 4 || draft.pilihan.some((item) => !item.trim())) {
    return "Keempat pilihan jawaban harus terisi.";
  }
  if (draft.kunci === null) return "Kunci jawaban belum dipilih.";
  return "";
}
