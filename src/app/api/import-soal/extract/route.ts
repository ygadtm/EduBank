import { requireGuruApi } from "@/lib/auth";
import { extractFile, hapusFile, ImporError, unduhFile } from "@/lib/impor";
import { MAX_FILE_BYTES } from "@/lib/impor-types";

export const runtime = "nodejs";
export const maxDuration = 60;

const POLA = /^imports\/[A-Za-z0-9]+\/[A-Za-z0-9-]+\.(jpg|jpeg|png|webp|pdf|xlsx|xls)$/;

const MIME_DARI_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
};

function tolak(error: string, status: number) {
  return Response.json({ error }, { status });
}

export async function POST(request: Request) {
  const user = await requireGuruApi();
  if (!user) return tolak("Tidak memiliki akses.", 401);

  let body: { path?: string; mime?: string; nama?: string };
  try {
    body = await request.json();
  } catch {
    return tolak("Permintaan tidak valid.", 400);
  }

  const path = String(body.path ?? "");
  const nama = String(body.nama ?? "");
  if (!POLA.test(path) || !path.startsWith(`imports/${user.id}/`)) {
    return tolak("File tidak valid.", 400);
  }

  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const mime =
    MIME_DARI_EXT[ext] ||
    (body.mime ?? "").toLowerCase() ||
    "application/octet-stream";

  try {
    const buffer = await unduhFile(path);
    if (buffer.byteLength > MAX_FILE_BYTES) {
      throw new ImporError("Ukuran file maksimal 10 MB.", 413);
    }
    const soal = await extractFile({ buffer, mime, nama });
    return Response.json({ soal });
  } catch (error) {
    if (error instanceof ImporError) {
      return tolak(error.message, error.status);
    }
    return tolak("Gagal mengekstrak soal. Coba lagi.", 500);
  } finally {
    await hapusFile(path).catch(() => {});
  }
}
