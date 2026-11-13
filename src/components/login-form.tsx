"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { login } from "@/lib/actions/auth";
import { btn, inp } from "@/components/ui";

const lbl = "block space-y-1.5 text-sm font-semibold text-ink";
const fld = `${inp} w-full`;

function Sandi({
  placeholder,
  name = "password",
}: {
  placeholder: string;
  name?: string;
}) {
  const [lihat, setLihat] = useState(false);
  return (
    <span className="relative block">
      <input
        required
        name={name}
        type={lihat ? "text" : "password"}
        placeholder={placeholder}
        autoComplete="current-password"
        className={`${fld} pr-10`}
      />
      <button
        type="button"
        onClick={() => setLihat(!lihat)}
        aria-label={lihat ? "Sembunyikan password" : "Lihat password"}
        className="absolute right-2 top-1.5 rounded px-2 py-1 text-xs font-semibold text-muted hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
      >
        {lihat ? "Sembunyikan" : "Lihat"}
      </button>
    </span>
  );
}

export default function LoginForm() {
  const [guru, setGuru] = useState(false);
  const [state, formAction, pending] = useActionState(login, { error: "" });

  return (
    <div className="grid min-h-screen place-items-center bg-paper p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[10px] border border-line bg-surface shadow-[0_1px_2px_rgba(27,42,65,.06)]">
        <div className="border-b border-line p-8">
          <p className="text-sm font-semibold text-accent">EduBank</p>
          <h1 className="mt-2 text-[32px] font-bold leading-[38px] text-ink">Selamat Datang</h1>
          <p className="mt-2 text-sm text-muted">
            {guru
              ? "Masuk ke ruang kelola belajar guru."
              : "Masuk ke ruang belajar ceria dan pintar"}
          </p>
          <div className="relative mt-4 aspect-video max-h-48 w-full overflow-hidden rounded-[10px] border border-line bg-paper">
            <Image
              src={guru ? "/img/loginGuru.jpg" : "/img/loginSiswa.jpg"}
              alt={guru ? "Ilustrasi guru" : "Ilustrasi siswa"}
              fill
              priority
              sizes="(max-width: 448px) calc(100vw - 64px), 384px"
              quality={85}
              className="object-cover"
            />
          </div>
        </div>
        <form action={formAction} className="space-y-4 p-8">
          <input type="hidden" name="role" value={guru ? "GURU" : "SISWA"} />
          {guru ? (
            <label className={lbl}>
              NIP Guru
              <input
                required
                name="nisNip"
                placeholder="Masukkan NIP Guru"
                autoComplete="username"
                className={fld}
              />
            </label>
          ) : (
            <label className={lbl}>
              Nama Lengkap
              <input
                required
                name="nama"
                placeholder="Masukkan nama lengkap"
                autoComplete="username"
                className={fld}
              />
            </label>
          )}
          <label className={lbl}>
            Kata sandi
            <Sandi placeholder="Masukkan kata sandi" />
          </label>
          {state.error && (
            <p className="rounded border border-danger/30 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">
              {state.error}
            </p>
          )}
          <button
            disabled={pending}
            className={`${btn} w-full py-3`}
          >
            {pending ? "Memproses..." : `Masuk sebagai ${guru ? "Guru" : "Siswa"}`}
          </button>
          <div className="border-t border-line pt-3 text-center">
            <button
              type="button"
              onClick={() => setGuru(!guru)}
              className="text-sm font-semibold text-accent underline underline-offset-2 hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
            >
              Masuk sebagai {guru ? "Siswa" : "Guru"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
