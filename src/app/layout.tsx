import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const DESKRIPSI =
  "Bank soal dan latihan soal interaktif untuk siswa kelas V–VI SDN 1 Fajar Baru. Dilengkapi materi dan video pembelajaran dari guru.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "EduBank – Bank Soal & Latihan Interaktif SDN 1 Fajar Baru",
    template: "%s – EduBank",
  },
  description: DESKRIPSI,
  keywords: [
    "edubank",
    "sdn 1 fajar baru",
    "bank soal",
    "latihan soal",
    "soal kelas 5",
    "soal kelas 6",
    "website edubank sdn 1 fajar baru",
  ],
  applicationName: "EduBank",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "EduBank SDN 1 Fajar Baru",
    title: "EduBank – Bank Soal & Latihan Interaktif SDN 1 Fajar Baru",
    description: DESKRIPSI,
  },
  twitter: {
    card: "summary",
    title: "EduBank – Bank Soal & Latihan Interaktif SDN 1 Fajar Baru",
    description: DESKRIPSI,
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${jakarta.className} text-slate-800`}>{children}</body>
    </html>
  );
}
