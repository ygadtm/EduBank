import { requireSessionUser } from "@/lib/auth";
import GantiPasswordForm from "@/components/ganti-password-form";

export default async function HalamanGantiPassword() {
  const user = await requireSessionUser();

  return (
    <div className="grid min-h-screen place-items-center bg-[#f4f7fc] p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-extrabold">Ganti Password</h1>
        <p className="mt-1 text-sm text-slate-500">
          Hai {user.nama}, ganti password awal sebelum melanjutkan.
        </p>
        <div className="mt-6">
          <GantiPasswordForm />
        </div>
      </div>
    </div>
  );
}
