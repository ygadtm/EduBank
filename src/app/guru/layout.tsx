import AppShell from "@/components/AppShell";
import { requireGuru } from "@/lib/auth";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireGuru();
  return (
    <AppShell role="guru" user={{ nama: user.nama, kelas: user.kelas }}>
      {children}
    </AppShell>
  );
}
