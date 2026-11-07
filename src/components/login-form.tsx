"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { login } from "@/lib/actions/auth";
import { inp } from "@/components/ui";

const lbl = "block space-y-1.5 text-xs font-bold uppercase text-slate-700";
const fld = `${inp} w-full normal-case`;

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
        className="absolute right-3 top-2.5 text-sm normal-case"
      >
        👁
      </button>
    </span>
  );
}

export default function LoginForm() {
  const [guru, setGuru] = useState(false);
  const [state, formAction, pending] = useActionState(login, { error: "" });

  return (
    <div className="grid min-h-screen place-items-center bg-[#f4f7fc] p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-linear-to-b from-blue-50 to-blue-100 shadow-xl">
        <div className="px-8 pt-8 text-center">
          <h1 className="text-3xl font-extrabold">Selamat Datang 👋</h1>
          <p className="text-sm text-slate-500">
            {guru
              ? "Masuk ke ruang kelola belajar guru"
              : "Masuk ke ruang belajar ceria dan pintar"}
          </p>
          <div className="relative mx-auto mt-4 aspect-video max-h-52 w-full overflow-hidden rounded-2xl bg-cyan-50">
            <Image
              src={guru ? "/img/loginGuru.jpg" : "/img/loginSiswa.jpg"}
              alt={guru ? "Ilustrasi guru" : "Ilustrasi siswa"}
              fill
              priority
              sizes="(max-width: 448px) calc(100vw - 96px), 384px"
              quality={85}
              className="object-cover"
            />
          </div>
        </div>
        <form action={formAction} className="space-y-4 p-8">
          <input type="hidden" name="role" value={guru ? "GURU" : "SISWA"} />
          <label className={lbl}>
            {guru ? "NIP Guru" : "NIS"}
            <input
              required
              name="nisNip"
              placeholder={guru ? "Masukkan NIP Guru" : "Masukkan NIS"}
              autoComplete="username"
              className={fld}
            />
          </label>
          <label className={lbl}>
            Kata sandi
            <Sandi placeholder="Masukkan kata sandi" />
          </label>
          {state.error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
              {state.error}
            </p>
          )}
          <button
            disabled={pending}
            className="w-full rounded-full bg-blue-700 py-3 text-sm font-bold text-white shadow-lg shadow-blue-300 hover:bg-blue-800 disabled:opacity-60"
          >
            {pending
              ? "Memproses..."
              : `Masuk sebagai ${guru ? "Guru" : "Siswa"} →`}
          </button>
          <div className="border-t border-blue-200 pt-3 text-center">
            <button
              type="button"
              onClick={() => setGuru(!guru)}
              className="text-xs font-semibold text-blue-600 underline"
            >
              Masuk sebagai {guru ? "Siswa" : "Guru"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
