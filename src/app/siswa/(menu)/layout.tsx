import AppShell from "@/components/AppShell";
import { requireSiswa } from "@/lib/auth";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSiswa();
  return (
    <AppShell role="siswa" user={{ nama: user.nama, kelas: user.kelas }}>
      {children}
    </AppShell>
  );
}
