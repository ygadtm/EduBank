import { requireGuru } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mapelMeta } from "@/lib/mapel";
import { MapelBadge, PageHead, card } from "@/components/ui";
import GantiPasswordForm from "@/components/ganti-password-form";

function formatTanggal(value: Date | null) {
  if (!value) return "Belum pernah";
  return value.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ProfilGuru() {
  const user = await requireGuru();

  const [diampu, semuaMapel] = await Promise.all([
    prisma.guruMapel.findMany({
      where: { guruId: user.id },
      orderBy: [{ kelas: "asc" }],
      include: { mapel: { select: { slug: true, nama: true } } },
    }),
    prisma.mapel.findMany({ orderBy: { urutan: "asc" }, select: { slug: true, nama: true } }),
  ]);

  const semua = user.admin || diampu.length === 0;

  const grup = new Map<string, { nama: string; slug: string; kelas: number[] }>();
  for (const row of diampu) {
    const item = grup.get(row.mapelId) ?? {
      nama: row.mapel.nama,
      slug: row.mapel.slug,
      kelas: [],
    };
    item.kelas.push(row.kelas);
    grup.set(row.mapelId, item);
  }

  return (
    <>
      <PageHead icon="👤" title="Profil" sub="Informasi akun dan pengaturan keamanan Anda." />

      <div className="mt-5 grid gap-5">
        <section className={`${card} p-5`}>
          <h2 className="text-center font-bold">Informasi Akun</h2>
          <dl className="mt-4 grid gap-3 text-center text-sm">
            <div className="grid gap-0.5">
              <dt className="text-center text-muted">Nama</dt>
              <dd className="text-center font-semibold text-ink">{user.nama}</dd>
            </div>
            <div className="grid gap-0.5">
              <dt className="text-center text-muted">NIP</dt>
              <dd className="text-center font-semibold text-ink">{user.nisNip}</dd>
            </div>
            <div className="grid gap-0.5">
              <dt className="text-center text-muted">Peran</dt>
              <dd className="text-center font-semibold text-ink">
                {user.admin ? "Admin" : "Guru"}
              </dd>
            </div>
            <div className="grid gap-0.5">
              <dt className="text-center text-muted">Status</dt>
              <dd className="text-center font-semibold text-ink">
                {user.aktif ? "Aktif" : "Nonaktif"}
              </dd>
            </div>
            <div className="grid gap-0.5">
              <dt className="text-center text-muted">Terakhir login</dt>
              <dd className="text-center font-semibold text-ink">
                {formatTanggal(user.lastLoginAt)}
              </dd>
            </div>
            <div className="grid gap-0.5">
              <dt className="text-center text-muted">Terdaftar</dt>
              <dd className="text-center font-semibold text-ink">
                {formatTanggal(user.createdAt)}
              </dd>
            </div>
          </dl>
        </section>

        <section className={`${card} p-5`}>
          <h2 className="text-center font-bold">Mapel Diampu</h2>
          {semua && (
            <p className="mt-1 text-center text-xs text-muted">
              Semua mapel (belum ada penugasan khusus).
            </p>
          )}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {semua
              ? semuaMapel.map((m) => {
                  const meta = mapelMeta(m.slug);
                  return (
                    <MapelBadge key={m.slug} nama={m.nama} color={meta.color} bg={meta.bg} />
                  );
                })
              : [...grup.values()].map((m) => {
                  const meta = mapelMeta(m.slug);
                  return (
                    <span
                      key={m.slug}
                      className="inline-flex flex-wrap items-center justify-center gap-1.5 rounded-xl border border-line px-3 py-2"
                    >
                      <MapelBadge nama={m.nama} color={meta.color} bg={meta.bg} />
                      <span className="text-xs font-semibold text-muted">
                        {m.kelas.map((k) => `Kelas ${k}`).join(", ")}
                      </span>
                    </span>
                  );
                })}
          </div>
        </section>
      </div>

      <section className={`${card} mx-auto mt-5 w-full max-w-md p-5`}>
        <h2 className="text-center font-bold">Ganti Password</h2>
        <p className="mt-1 text-center text-xs text-muted">
          Gunakan minimal 8 karakter. Anda akan tetap di halaman ini setelah tersimpan.
        </p>
        <div className="mt-4">
          <GantiPasswordForm balik="/guru/profil" />
        </div>
      </section>
    </>
  );
}
