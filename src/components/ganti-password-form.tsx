"use client";

import { useActionState } from "react";
import { gantiPassword } from "@/lib/actions/auth";
import { btn, inp } from "@/components/ui";

const lbl = "block space-y-1.5 text-sm font-semibold text-ink";
const fld = `${inp} w-full`;

export default function GantiPasswordForm() {
  const [state, formAction, pending] = useActionState(gantiPassword, {
    error: "",
  });

  return (
    <form action={formAction} className="space-y-4">
      <label className={lbl}>
        Password lama
        <input
          required
          name="lama"
          type="password"
          autoComplete="current-password"
          className={fld}
        />
      </label>
      <label className={lbl}>
        Password baru
        <input
          required
          name="baru"
          type="password"
          minLength={8}
          autoComplete="new-password"
          className={fld}
        />
      </label>
      <label className={lbl}>
        Ulangi password baru
        <input
          required
          name="ulang"
          type="password"
          minLength={8}
          autoComplete="new-password"
          className={fld}
        />
      </label>
      {state.error && (
        <p className="rounded border border-danger/30 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">
          {state.error}
        </p>
      )}
      <button disabled={pending} className={`${btn} w-full py-3`}>
        {pending ? "Menyimpan..." : "Simpan Password Baru"}
      </button>
    </form>
  );
}
