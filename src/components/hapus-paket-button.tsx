"use client";

import { useState } from "react";
import { hapusPaket } from "@/lib/actions/paket-latihan";

export default function HapusPaketButton({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);

  return (
    <button
      disabled={busy}
      onClick={async () => {
        if (!confirm("Hapus paket latihan ini?")) return;
        setBusy(true);
        const hasil = await hapusPaket(id);
        setBusy(false);
        if ("error" in hasil) alert(hasil.error);
      }}
      className="ml-2 text-red-500 hover:underline disabled:opacity-50"
    >
      {busy ? "Menghapus..." : "Hapus"}
    </button>
  );
}
