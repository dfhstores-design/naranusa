"use client";

import Link from "next/link";
import NaraMascot from "@/components/nara-mascot";

export default function OfflinePage() {
  return (
    <main className="center-page">
      <section className="message-card offline-card">
        <div className="mascot-disc"><NaraMascot small /></div>
        <p className="eyebrow">KONEKSI TERPUTUS</p>
        <h1>Yuk, sambungkan internet dulu</h1>
        <p>Latihan dan progres perlu tersambung ke server. Setelah online, coba buka lagi.</p>
        <div className="button-row centered">
          <button className="button primary" onClick={() => window.location.reload()}>Coba lagi</button>
          <Link className="button secondary" href="/">Ke beranda</Link>
        </div>
      </section>
    </main>
  );
}
