import { PageHead } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import PenggunaClient from "./pengguna-client";

export default async function HalamanPengguna() {
  const admin = await requireAdmin();
  const session = await getSession();

  const gurus = await prisma.user.findMany({
    where: { role: "GURU" },
    orderBy: [{ admin: "desc" }, { nama: "asc" }],
    select: { id: true, nama: true, nisNip: true, admin: true },
  });

  return (
    <>
      <PageHead
        icon="🛡"
        title="Pengguna Guru"
        sub="Tambahkan atau hapus akun guru. Hanya admin yang punya akses ini."
      />
      <PenggunaClient
        gurus={gurus.map((g) => ({
          id: g.id,
          nama: g.nama,
          nisNip: g.nisNip,
          admin: g.admin,
          idDiri: g.id === session?.userId,
        }))}
      />
    </>
  );
}
