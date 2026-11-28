import type { Metadata, Viewport } from "next";
import "@fontsource-variable/nunito";
import "./globals.css";

const basePath = "/naranusa";

export const metadata: Metadata = {
  title: "NaraNusa — Belajar Seru Kelas 4",
  description: "Latihan Kelas 4 — 9 mata pelajaran, 1.185 soal kurasi Erlangga dengan pembahasan, progres tersimpan aman di server.",
  applicationName: "NaraNusa",
  manifest: `${basePath}/manifest.webmanifest`,
  appleWebApp: { capable: true, title: "NaraNusa", statusBarStyle: "default" },
  icons: { icon: `${basePath}/icon.svg`, apple: `${basePath}/icon.svg` },
};

export const viewport: Viewport = {
  themeColor: "#f7f8fc",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
