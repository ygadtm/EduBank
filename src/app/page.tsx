"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { inp } from "@/components/ui";

const lbl = "block space-y-1.5 text-xs font-bold uppercase text-slate-700";
const fld = `${inp} w-full normal-case`;
const NAMA = [
  "Isnaini Febriana",
  "Budi Santoso",
  "Citra Lestari",
  "Dimas Pratama",
];

function Sandi({ placeholder }: { placeholder: string }) {
  const [lihat, setLihat] = useState(false);
  return (
    <span className="relative block">
      <input
        required
        type={lihat ? "text" : "password"}
        placeholder={placeholder}
        className={`${fld} pr-10`}
      />
      <button
        type="button"
        onClick={() => setLihat(!lihat)}
        className="absolute right-3 top-2.5 text-sm normal-case"
      >
        👁
      </button>
    </span>
  );
}

export default function Login() {
  const router = useRouter();
  const [guru, setGuru] = useState(false);
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("6");
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
        <form
          className="space-y-4 p-8"
          onSubmit={(e) => {
            e.preventDefault();
            localStorage.setItem("kapsel-name", nama);
            localStorage.setItem("kapsel-role", guru ? "guru" : "siswa");
            if (!guru) localStorage.setItem("kapsel-kelas", kelas);
            router.push(guru ? "/guru/beranda" : "/siswa/beranda");
          }}
        >
          {guru ? (
            <>
              <label className={lbl}>
                Nama
                <input
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama"
                  className={fld}
                />
              </label>
              <label className={lbl}>
                NIP Guru
                <Sandi placeholder="Masukkan NIP Guru" />
              </label>
            </>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <label className={`${lbl} col-span-2`}>
                  Nama
                  <select
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className={fld}
                  >
                    <option value="">Pilih nama siswa</option>
                    {NAMA.map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <label className={lbl}>
                  Kelas
                  <select
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className={fld}
                  >
                    <option value="5">Kelas 5</option>
                    <option value="6">Kelas 6</option>
                  </select>
                </label>
              </div>
              <label className={lbl}>
                Kata sandi
                <Sandi placeholder="Masukkan kata sandi" />
              </label>
            </>
          )}
          <button className="w-full rounded-full bg-blue-700 py-3 text-sm font-bold text-white shadow-lg shadow-blue-300 hover:bg-blue-800">
            Masuk sebagai {guru ? "Guru" : "Siswa"} →
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
