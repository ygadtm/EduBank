"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { hapusVideo, tambahVideo, ubahVideo } from "@/lib/actions/video";
import { PageHead, card, inp, btn } from "@/components/ui";

export type VideoKartu = {
  id: string;
  kelas: number;
  judul: string;
  ringkasan: string | null;
  videoUrl: string;
};

type VideoState = { error?: string; ok?: boolean };

function FormVideo({
  aksi,
  batal,
  awal,
  mapelId,
}: {
  aksi: (state: VideoState, formData: FormData) => Promise<VideoState>;
  batal?: () => void;
  awal?: VideoKartu;
  mapelId?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [state, formAction, pending] = useActionState(aksi, {});

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
      batal?.();
    }
  }, [state, router, batal]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      {mapelId && <input type="hidden" name="mapelId" value={mapelId} />}
      <label className="w-full text-sm sm:w-36">
        <span className="mb-1 block font-semibold text-slate-700">Kelas</span>
        <select name="kelas" required defaultValue={awal ? awal.kelas : ""} className={`${inp} w-full`}>
          <option value="" disabled>Pilih</option>
          <option value="5">Kelas 5</option>
          <option value="6">Kelas 6</option>
        </select>
      </label>
      <label className="min-w-[180px] flex-1 text-sm">
        <span className="mb-1 block font-semibold text-slate-700">Judul Materi</span>
        <input name="judul" required defaultValue={awal?.judul} className={`${inp} w-full`} placeholder="Contoh: Siklus Air" />
      </label>
      <label className="w-full text-sm sm:w-72">
        <span className="mb-1 block font-semibold text-slate-700">Link Video</span>
        <input
          name="videoUrl"
          required
          inputMode="url"
          defaultValue={awal?.videoUrl}
          className={`${inp} w-full`}
          placeholder="https://youtube.com/..."
        />
      </label>
      <label className="min-w-[180px] flex-1 text-sm">
        <span className="mb-1 block font-semibold text-slate-700">Ringkasan (opsional)</span>
        <input name="ringkasan" defaultValue={awal?.ringkasan ?? ""} className={`${inp} w-full`} placeholder="Deskripsi singkat" />
      </label>
      <button disabled={pending} className={`${btn} disabled:opacity-60`}>
        {pending ? "Menyimpan..." : awal ? "Simpan" : "Tambah"}
      </button>
      {batal && (
        <button type="button" onClick={batal} className="text-sm font-semibold text-slate-500 hover:text-slate-700">
          Batal
        </button>
      )}
      {state.error && <p className="w-full text-sm text-rose-600">{state.error}</p>}
    </form>
  );
}

function KartuVideo({
  video,
  warna,
  bg,
}: {
  video: VideoKartu;
  warna: string;
  bg: string;
}) {
  const router = useRouter();
  const [sunting, setSunting] = useState(false);
  const [busy, setBusy] = useState(false);

  async function hapus() {
    if (!confirm(`Hapus materi "${video.judul}"?`)) return;
    setBusy(true);
    const hasil = await hapusVideo(video.id);
    setBusy(false);
    if ("error" in hasil) alert(hasil.error);
    else router.refresh();
  }

  return (
    <article className={`${card} flex flex-col p-5`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
            Kelas {video.kelas}
          </span>
          <h3 className="mt-2 font-bold">{video.judul}</h3>
        </div>
        <div
          aria-hidden="true"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-xl"
          style={{ background: `linear-gradient(135deg, ${bg}, #fff)` }}
        >
          ▶
        </div>
      </div>
      {video.ringkasan && <p className="mt-1 text-sm text-slate-500">{video.ringkasan}</p>}
      {sunting ? (
        <div className="mt-4 rounded-xl bg-paper p-4">
          <FormVideo aksi={(state, formData) => ubahVideo(video.id, state, formData)} batal={() => setSunting(false)} awal={video} />
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: warna }}
          >
            Tonton
          </a>
          <button
            onClick={() => setSunting(true)}
            className="rounded border border-line px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-paper"
          >
            Ubah
          </button>
          <button disabled={busy} onClick={hapus} className="text-sm font-bold text-red-500 hover:underline disabled:opacity-50">
            {busy ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      )}
    </article>
  );
}

export default function VideoClient({
  mapel,
  judul,
  sub,
  icon,
  warna,
  bg,
  videos,
}: {
  mapel: { id: string; slug: string; nama: string };
  judul: string;
  sub: string;
  icon: string;
  warna: string;
  bg: string;
  videos: VideoKartu[];
}) {
  return (
    <>
      <PageHead icon={icon} title={judul} sub={sub}>
        <Link
          href="/guru/video"
          className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-bold text-slate-600"
        >
          ← Semua Mapel
        </Link>
      </PageHead>

      <section className={`${card} mt-3 p-5`}>
        <h2 className="font-bold">Tambah Materi Video</h2>
        <div className="mt-3">
          <FormVideo mapelId={mapel.id} aksi={tambahVideo} />
        </div>
      </section>

      {videos.length === 0 ? (
        <div className={`${card} mt-3 px-5 py-10 text-center text-sm text-slate-500`}>
          Belum ada materi video untuk mapel ini.
        </div>
      ) : (
        [5, 6].map((kelas) => {
          const daftar = videos.filter((v) => v.kelas === kelas);
          if (daftar.length === 0) return null;
          return (
            <section key={kelas} className="mt-5">
              <h2 className="mb-3 text-sm font-bold text-muted">Kelas {kelas}</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {daftar.map((v) => (
                  <KartuVideo key={v.id} video={v} warna={warna} bg={bg} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </>
  );
}
