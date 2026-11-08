import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { mapelMeta } from "@/lib/mapel";
import VideoClient, { type VideoKartu } from "./video-client";

export default async function VideoPerMapelGuru({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const mapel = await prisma.mapel.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      nama: true,
      deskripsi: true,
      video: {
        orderBy: [{ urutan: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          kelas: true,
          judul: true,
          ringkasan: true,
          videoUrl: true,
        },
      },
    },
  });

  if (!mapel) notFound();

  const meta = mapelMeta(mapel.slug);
  const videos: VideoKartu[] = mapel.video;

  return (
    <VideoClient
      mapel={{ id: mapel.id, slug: mapel.slug, nama: mapel.nama }}
      judul={mapel.nama}
      sub={mapel.deskripsi ?? "Kelola materi dan video untuk mapel ini."}
      icon={meta.icon}
      warna={meta.color}
      bg={meta.bg}
      videos={videos}
    />
  );
}
