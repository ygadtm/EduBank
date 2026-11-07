"use client";

import { useActionState } from "react";
import { gantiPassword } from "@/lib/actions/auth";
import { inp } from "@/components/ui";

const lbl = "block space-y-1.5 text-xs font-bold uppercase text-slate-700";
const fld = `${inp} w-full normal-case`;

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
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
          {state.error}
        </p>
      )}
      <button
        disabled={pending}
        className="w-full rounded-xl bg-blue-700 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : "Simpan Password Baru"}
      </button>
    </form>
  );
}
