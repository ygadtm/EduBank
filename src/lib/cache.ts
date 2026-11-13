import { unstable_cache } from "next/cache";
import { prisma } from "./db";

export const getMapelRingkas = unstable_cache(
  async () =>
    prisma.mapel.findMany({
      orderBy: { urutan: "asc" },
      select: { id: true, slug: true, nama: true },
    }),
  ["mapel-ringkas"],
  { revalidate: 300, tags: ["mapel"] },
);
