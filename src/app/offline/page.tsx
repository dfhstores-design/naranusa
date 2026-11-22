import Link from "next/link";
import NaraMascot from "@/components/nara-mascot";

export default function OfflinePage() {
  return (
    <main className="offline-shell">
      <div className="offline-card"><NaraMascot small /><p className="section-overline">KONEKSI TERPUTUS</p><h1>Kita tetap bisa belajar!</h1><p>Jika halaman ini sudah pernah dibuka, soal contoh yang tersimpan di perangkat masih bisa dikerjakan.</p><Link href="/" className="primary-button">Kembali ke beranda →</Link></div>
    </main>
  );
}
