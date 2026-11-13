import { requireSiswa } from "@/lib/auth";
import { PageHead, card } from "@/components/ui";

export default async function ProfilSiswa() {
  const user = await requireSiswa();

  return (
    <>
      <PageHead icon="👤" title="Profil" sub="Informasi akun siswa Anda." />

      <section className={`${card} mx-auto mt-5 w-full max-w-md p-5`}>
        <h2 className="text-center font-bold">Informasi Akun</h2>
        <dl className="mt-4 grid gap-3 text-center text-sm">
          <div className="grid gap-0.5">
            <dt className="text-center text-muted">Nama</dt>
            <dd className="text-center font-semibold text-ink">{user.nama}</dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-center text-muted">NISN</dt>
            <dd className="text-center font-semibold text-ink">{user.nisNip}</dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-center text-muted">Kelas</dt>
            <dd className="text-center font-semibold text-ink">
              {user.kelas ? `Kelas ${user.kelas} SD` : "-"}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-center text-muted">Status</dt>
            <dd className="text-center font-semibold text-ink">
              {user.aktif ? "Aktif" : "Nonaktif"}
            </dd>
          </div>
        </dl>
      </section>
    </>
  );
}
