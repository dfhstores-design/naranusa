import type { Metadata, Viewport } from "next";
import TutorLauncher from "@/components/tutor-launcher";
import "./globals.css";

export const metadata: Metadata = {
  title: "NaraNusa — Belajar Seru Kelas 4",
  description: "Temani petualangan belajar Kelas 4 dengan materi yang dirujuk ke sumber Kurikulum Merdeka.",
  applicationName: "NaraNusa",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "NaraNusa",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f8fc",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}<TutorLauncher /></body>
    </html>
  );
}
