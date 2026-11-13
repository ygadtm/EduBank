"use client";

import { useState } from "react";
import { hapusSoal } from "@/lib/actions/soal";

export default function HapusSoalButton({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);

  return (
    <button
      disabled={busy}
      onClick={async () => {
        if (!confirm("Hapus soal ini?")) return;
        setBusy(true);
        const hasil = await hapusSoal(id);
        setBusy(false);
        if ("error" in hasil) alert(hasil.error);
      }}
      className="ml-2 text-red-500 hover:underline disabled:opacity-50"
    >
      {busy ? "Menghapus..." : "Hapus"}
    </button>
  );
}
