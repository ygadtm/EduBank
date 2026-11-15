/**
 * URL publik situs. Dipakai untuk metadata, robots, dan sitemap.
 * Bisa ditimpa lewat env saat deploy ke domain lain.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://edubank-fajarbaru.vercel.app";
