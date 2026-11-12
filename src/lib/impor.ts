import * as XLSX from "xlsx";
import {
  MAX_SOAL_IMPOR,
  normalisasiDraft,
  type SoalDraft,
} from "@/lib/impor-types";

export class ImporError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const BUCKET = "impor-soal";

function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new ImporError(
      "Penyimpanan file belum dikonfigurasi. Isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY.",
      500,
    );
  }
  return { url: url.replace(/\/$/, ""), key };
}

export async function buatSignedUpload(path: string) {
  const { url, key } = supabase();
  const res = await fetch(`${url}/storage/v1/object/upload/sign/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });

  if (!res.ok) {
    throw new ImporError("Gagal menyiapkan unggahan file.", 502);
  }

  const data = (await res.json()) as { url?: string };
  if (!data.url) throw new ImporError("Gagal menyiapkan unggahan file.", 502);
  return `${url}/storage/v1${data.url}`;
}

export async function unduhFile(path: string) {
  const { url, key } = supabase();
  const res = await fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });

  if (!res.ok) throw new ImporError("File tidak ditemukan atau sudah kedaluwarsa.", 404);
  return Buffer.from(await res.arrayBuffer());
}

export async function hapusFile(path: string) {
  const { url, key } = supabase();
  await fetch(`${url}/storage/v1/object/${BUCKET}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefixes: [path] }),
  });
}

type Baris = unknown[];

const KEPALA = {
  teks: ["pertanyaan", "soal", "teks", "teks_soal", "question"],
  topik: [
    "topik",
    "materi",
    "bab",
    "kategori",
    "kategori_materi",
    "sub_topik",
    "subtopik",
  ],
  pembahasan: [
    "pembahasan",
    "pembahasan_singkat",
    "penjelasan",
    "explanation",
  ],
  kunci: ["kunci", "kunci_jawaban", "jawaban", "key", "answer"],
};

function kunci(nilai: unknown) {
  return String(nilai ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function cariKolom(header: Baris, nama: string[]) {
  return header.findIndex((sel) => nama.includes(kunci(sel)));
}

function cariPilihan(header: Baris) {
  const huruf = ["a", "b", "c", "d"];
  const kolom = huruf.map((h) =>
    header.findIndex((sel) => {
      const k = kunci(sel);
      return (
        k === h ||
        new RegExp(`^(pilihan|opsi|option|jawaban)_?${h}$`).test(k)
      );
    }),
  );
  return kolom.every((i) => i >= 0) ? kolom : null;
}

function keAngkaKunci(nilai: unknown, pilihan: string[]): number | null {
  const teks = String(nilai ?? "").trim();
  if (!teks) return null;

  const huruf = teks.toUpperCase().replace(/[^A-Z]/g, "");
  if (huruf.length === 1 && "ABCD".includes(huruf)) return "ABCD".indexOf(huruf);

  const angka = Number(teks);
  if (Number.isInteger(angka)) {
    if (angka >= 1 && angka <= 4) return angka - 1;
    if (angka >= 0 && angka <= 3) return angka;
  }

  const cocok = pilihan.findIndex(
    (item) => item && item.trim().toLowerCase() === teks.toLowerCase(),
  );
  return cocok >= 0 ? cocok : null;
}

function draftDariBaris(baris: Baris, kolom: { teks: number; topik: number; pembahasan: number; kunci: number; pilihan: number[] }) {
  const pilihan = kolom.pilihan.map((i) => String(baris[i] ?? "").trim());
  return normalisasiDraft({
    teks: String(baris[kolom.teks] ?? "").trim(),
    pilihan,
    kunci: keAngkaKunci(baris[kolom.kunci], pilihan),
    topik: kolom.topik >= 0 ? String(baris[kolom.topik] ?? "") : "",
    pembahasan: kolom.pembahasan >= 0 ? String(baris[kolom.pembahasan] ?? "") : "",
  });
}

export function parseExcel(buffer: Buffer): SoalDraft[] {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer" });
  } catch {
    throw new ImporError("File Excel tidak dapat dibaca.", 422);
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new ImporError("File Excel tidak memiliki lembar kerja.", 422);

  const baris = XLSX.utils.sheet_to_json<Baris>(sheet, {
    header: 1,
    blankrows: false,
    defval: "",
  });
  if (baris.length === 0) throw new ImporError("File Excel kosong.", 422);

  const headerIndex = baris.findIndex((item, i) => {
    if (i > 9) return false;
    return (
      cariKolom(item, KEPALA.teks) >= 0 || cariPilihan(item) !== null
    );
  });
  const adaHeader = headerIndex >= 0;
  const header = adaHeader ? baris[headerIndex] : baris[0];
  const pilihanHeader = adaHeader ? cariPilihan(header) : null;
  const kunciHeader = adaHeader ? cariKolom(header, KEPALA.kunci) : -1;
  const teksHeader = adaHeader ? cariKolom(header, KEPALA.teks) : -1;

  const kolom = adaHeader
    ? (() => {
        const teks = Math.max(teksHeader, 0);
        return {
          teks,
          topik: cariKolom(header, KEPALA.topik),
          pembahasan: cariKolom(header, KEPALA.pembahasan),
          kunci: kunciHeader >= 0 ? kunciHeader : teks + 5,
          pilihan: pilihanHeader ?? [teks + 1, teks + 2, teks + 3, teks + 4],
        };
      })()
    : {
        teks: 0,
        topik: -1,
        pembahasan: 6,
        kunci: 5,
        pilihan: [1, 2, 3, 4],
      };

  const hasil: SoalDraft[] = [];

  for (const item of baris.slice(adaHeader ? headerIndex + 1 : 0)) {
    if (hasil.length >= MAX_SOAL_IMPOR) break;
    const draft = draftDariBaris(item, kolom);
    if (!draft.teks) continue;
    hasil.push(draft);
  }

  if (hasil.length === 0) {
    throw new ImporError(
      "Tidak ada soal terdeteksi. Periksa kolom template Excel.",
      422,
    );
  }
  return hasil;
}

const SKEMA_GEMINI = {
  type: "OBJECT",
  properties: {
    soal: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          teks: { type: "STRING" },
          pilihan: { type: "ARRAY", items: { type: "STRING" } },
          kunci: { type: "INTEGER" },
          topik: { type: "STRING" },
          pembahasan: { type: "STRING" },
        },
        required: ["teks", "pilihan", "kunci"],
      },
    },
  },
  required: ["soal"],
};

const PROMPT = `Kamu membantu guru mengekstrak soal pilihan ganda dari gambar atau PDF lembar soal.

Aturan:
- Ekstrak SEMUA soal pilihan ganda yang terlihat, urut sesuai dokumen.
- Setiap soal wajib punya tepat 4 pilihan jawaban (A, B, C, D). Bila dokumen kurang atau lebih, isi kekurangan dengan string kosong. Jangan mengarang isi pilihan.
- kunci adalah indeks pilihan benar: 0=A, 1=B, 2=C, 3=D. Bila kunci tidak terlihat atau tidak ada, isi -1.
- teks berisi pertanyaan lengkap tanpa opsi. pembahasan diisi hanya bila ada di dokumen.
- Tulis rumus sebagai teks biasa atau unicode. Jangan memakai LaTeX.
- Abaikan nomor halaman, header, dan instruksi umum. Jangan membuat soal baru.
- Balas hanya JSON sesuai skema.`;

const MODEL_CADANGAN = ["gemini-3.5-flash"];

async function pesanError(res: Response) {
  const teks = await res.text().catch(() => "");
  try {
    const json = JSON.parse(teks) as { error?: { message?: string } };
    return (json.error?.message ?? "").slice(0, 300);
  } catch {
    return teks.slice(0, 300);
  }
}

export async function extractGemini(buffer: Buffer, mime: string): Promise<SoalDraft[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ImporError(
      "Ekstraksi foto/PDF belum dikonfigurasi. Isi GEMINI_API_KEY.",
      500,
    );
  }

  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const daftarModel = [...new Set([model, ...MODEL_CADANGAN])];
  let pesanTerakhir = "Gagal memproses file ke layanan ekstraksi.";

  for (const namaModel of daftarModel) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${namaModel}:generateContent`,
      {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: PROMPT },
                {
                  inlineData: {
                    mimeType: mime,
                    data: buffer.toString("base64"),
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: SKEMA_GEMINI,
          },
        }),
      },
    );

    if (!res.ok) {
      const detail = await pesanError(res);
      if (res.status === 429) {
        pesanTerakhir = "Kuota ekstraksi sedang habis. Tunggu sebentar lalu coba lagi.";
        continue;
      }
      if (res.status === 503 || res.status === 404) {
        pesanTerakhir = detail || "Layanan ekstraksi sedang sibuk. Coba lagi.";
        continue;
      }
      throw new ImporError(detail || "Gagal memproses file ke layanan ekstraksi.", 502);
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const teks =
      data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

    let json: { soal?: SoalDraft[] };
    try {
      json = JSON.parse(teks.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim());
    } catch {
      throw new ImporError(
        "Hasil ekstraksi tidak dapat dibaca. Coba foto yang lebih jelas.",
        422,
      );
    }

    const hasil = (Array.isArray(json.soal) ? json.soal : [])
      .map((item) =>
        normalisasiDraft({
          teks: item?.teks ?? "",
          pilihan: Array.isArray(item?.pilihan) ? item.pilihan : [],
          kunci:
            typeof item?.kunci === "number" && item.kunci >= 0 && item.kunci < 4
              ? item.kunci
              : null,
          topik: item?.topik ?? "",
          pembahasan: item?.pembahasan ?? "",
        }),
      )
      .filter((item) => item.teks)
      .slice(0, MAX_SOAL_IMPOR);

    if (hasil.length === 0) {
      throw new ImporError("Tidak ada soal terdeteksi pada file.", 422);
    }
    return hasil;
  }

  throw new ImporError(pesanTerakhir, 502);
}

export async function extractFile(input: {
  buffer: Buffer;
  mime: string;
  nama: string;
}) {
  const ext = input.nama.split(".").pop()?.toLowerCase() ?? "";
  const excel = ext === "xlsx" || ext === "xls" || input.mime.includes("sheet") || input.mime.includes("excel");
  if (excel) return parseExcel(input.buffer);
  return extractGemini(input.buffer, input.mime || "image/jpeg");
}

export function buatTemplateXlsx() {
  const data = [
    ["pertanyaan", "pilihan_a", "pilihan_b", "pilihan_c", "pilihan_d", "kunci", "topik", "pembahasan"],
    [
      "Hasil dari 3/4 + 1/2 adalah ...",
      "1",
      "5/4",
      "1/4",
      "2",
      "B",
      "Pecahan",
      "3/4 + 1/2 = 3/4 + 2/4 = 5/4.",
    ],
  ];
  const sheet = XLSX.utils.aoa_to_sheet(data);
  sheet["!cols"] = [
    { wch: 48 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 8 },
    { wch: 18 },
    { wch: 48 },
  ];
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Soal");
  return XLSX.write(book, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
