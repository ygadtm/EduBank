import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import { requireSiswa } from "@/lib/auth";

// Area privat: jangan diindeks mesin pencari.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

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
