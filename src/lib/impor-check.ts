import assert from "node:assert/strict";
import * as XLSX from "xlsx";
import { buatTemplateXlsx, parseExcel } from "@/lib/impor";
import { normalisasiDraft, validasiDraft } from "@/lib/impor-types";

const buku = XLSX.utils.book_new();
const sheet = XLSX.utils.aoa_to_sheet([
  ["pertanyaan", "pilihan_a", "pilihan_b", "pilihan_c", "pilihan_d", "kunci", "topik", "pembahasan"],
  ["2 + 2 = ...", "3", "4", "5", "6", "B", "Penjumlahan", "2 + 2 = 4."],
  ["Ibu kota Indonesia?", "Bandung", "Surabaya", "Jakarta", "Medan", "3", "", ""],
  ["", "", "", "", "", "", "", ""],
]);
XLSX.utils.book_append_sheet(buku, sheet, "Soal");
const buffer = XLSX.write(buku, { type: "buffer", bookType: "xlsx" }) as Buffer;

const hasil = parseExcel(buffer);
assert.equal(hasil.length, 2, "dua baris soal harus terbaca");
assert.equal(hasil[0].kunci, 1, "kunci B harus indeks 1");
assert.equal(hasil[1].kunci, 2, "kunci 3 harus indeks 2");
assert.equal(hasil[0].pilihan[1], "4");
assert.equal(hasil[0].topik, "Penjumlahan");

const posisional = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(
  posisional,
  XLSX.utils.aoa_to_sheet([
    ["Soal tanpa header", "satu", "dua", "tiga", "empat", "D", "Topik"],
  ]),
  "Soal",
);
const buffer2 = XLSX.write(posisional, { type: "buffer", bookType: "xlsx" }) as Buffer;
const hasil2 = parseExcel(buffer2);
assert.equal(hasil2.length, 1);
assert.equal(hasil2[0].kunci, 3);
assert.equal(hasil2[0].pilihan[3], "empat");

const template = parseExcel(buatTemplateXlsx());
assert.equal(template.length, 1, "template berisi satu contoh soal");
assert.equal(template[0].kunci, 1);

const bergeser = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(
  bergeser,
  XLSX.utils.aoa_to_sheet([
    ["No", "Pertanyaan", "Jawaban A", "Jawaban B", "Jawaban C", "Jawaban D", "Kunci"],
    [1, "1 + 1 = ...", "1", "2", "3", "4", "B"],
  ]),
  "Soal",
);
const buffer3 = XLSX.write(bergeser, { type: "buffer", bookType: "xlsx" }) as Buffer;
const hasil3 = parseExcel(buffer3);
assert.equal(hasil3[0].teks, "1 + 1 = ...");
assert.equal(hasil3[0].pilihan[1], "2");
assert.equal(hasil3[0].kunci, 1);

const berjudul = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(
  berjudul,
  XLSX.utils.aoa_to_sheet([
    ["BANK SOAL MATEMATIKA SD"],
    ["Lengkap dengan kunci jawaban"],
    ["No", "Kategori Materi", "Sub-Topik", "Pertanyaan", "Opsi A", "Opsi B", "Opsi C", "Opsi D", "Kunci", "Jawaban Benar", "Pembahasan Singkat"],
    [1, "Operasi Hitung", "Penjumlahan", "2 + 3 = ...", "4", "5", "6", "7", "B", "5", "2 + 3 = 5."],
    ["TOTAL", "", "Keterangan akhir"],
  ]),
  "Soal",
);
const buffer4 = XLSX.write(berjudul, { type: "buffer", bookType: "xlsx" }) as Buffer;
const hasil4 = parseExcel(buffer4);
assert.equal(hasil4.length, 1, "baris judul dan footer tidak boleh jadi soal");
assert.equal(hasil4[0].teks, "2 + 3 = ...");
assert.equal(hasil4[0].pilihan.join(","), "4,5,6,7");
assert.equal(hasil4[0].kunci, 1);
assert.equal(hasil4[0].pembahasan, "2 + 3 = 5.");

const kurang = normalisasiDraft({
  teks: "Tes",
  pilihan: ["a", "b"],
  kunci: 5,
  topik: "",
  pembahasan: "",
});
assert.equal(kurang.pilihan.length, 4);
assert.equal(kurang.pilihan[2], "");
assert.equal(kurang.kunci, null);
assert.notEqual(validasiDraft(kurang), "");
assert.equal(
  validasiDraft(normalisasiDraft({ teks: "Tes", pilihan: ["a", "b", "c", "d"], kunci: 0, topik: "", pembahasan: "" })),
  "",
);

console.log("impor-check: semua pemeriksaan lulus");
