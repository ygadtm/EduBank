import { requireGuruApi } from "@/lib/auth";
import { buatTemplateXlsx } from "@/lib/impor";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireGuruApi();
  if (!user) return new Response("Tidak memiliki akses.", { status: 401 });

  const buffer = buatTemplateXlsx();
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="template-impor-soal.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
