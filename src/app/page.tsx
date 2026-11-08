import { redirect } from "next/navigation";
import LoginForm from "@/components/login-form";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export default async function Login() {
  const session = await getSession();
  if (session) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true, harusGantiPassword: true, aktif: true },
    });
    if (user?.aktif) {
      if (user.role === "GURU" && user.harusGantiPassword) {
        redirect("/ganti-password");
      }
      redirect(user.role === "GURU" ? "/guru/beranda" : "/siswa/beranda");
    }
  }

  return <LoginForm />;
}
