export type MapelMeta = {
  nama: string;
  icon: string;
  color: string;
  bg: string;
};

export const MAPEL_META: Record<string, MapelMeta> = {
  "bahasa-indonesia": {
    nama: "Bahasa Indonesia",
    icon: "📖",
    color: "#dc2626",
    bg: "#fef2f2",
  },
  ipa: {
    nama: "IPAS (Ilmu Pengetahuan Alam dan Sosial)",
    icon: "🌿",
    color: "#059669",
    bg: "#ecfdf5",
  },
  matematika: {
    nama: "Matematika",
    icon: "🧮",
    color: "#2563eb",
    bg: "#eff6ff",
  },
  ppkn: {
    nama: "Tematik & PPKn",
    icon: "🛡️",
    color: "#d97706",
    bg: "#fffbeb",
  },
  "bahasa-inggris": {
    nama: "Bahasa Inggris",
    icon: "🔤",
    color: "#9333ea",
    bg: "#faf5ff",
  },
  agama: {
    nama: "Agama",
    icon: "🕌",
    color: "#b45309",
    bg: "#fef3c7",
  },
  penjaskes: {
    nama: "Penjaskes",
    icon: "⚽",
    color: "#16a34a",
    bg: "#dcfce7",
  },
};

const fallback: MapelMeta = {
  nama: "Mapel",
  icon: "📘",
  color: "#2563eb",
  bg: "#eff6ff",
};

export function mapelMeta(slug: string) {
  return MAPEL_META[slug] ?? fallback;
}
