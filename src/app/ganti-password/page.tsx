import { requireSessionUser } from "@/lib/auth";
import GantiPasswordForm from "@/components/ganti-password-form";

export default async function HalamanGantiPassword() {
  const user = await requireSessionUser();

  return (
    <div className="grid min-h-screen place-items-center bg-paper p-4">
      <div className="w-full max-w-md rounded-[10px] border border-line bg-surface p-8 shadow-[0_1px_2px_rgba(27,42,65,.06)]">
        <h1 className="text-[22px] font-bold leading-[30px] text-ink">Ganti Password</h1>
        <p className="mt-2 text-sm text-muted">
          Hai {user.nama}, ganti password awal sebelum melanjutkan.
        </p>
        <div className="mt-6">
          <GantiPasswordForm />
        </div>
      </div>
    </div>
  );
}
