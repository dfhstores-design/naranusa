import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import AppShell from "@/components/app-shell";
import NaraMascot from "@/components/nara-mascot";

export default function TutorPage() {
  return <AppShell audience="student" title="Tanya Nara">
    <section className="message-card tutor-placeholder">
      <div className="mascot-disc"><NaraMascot small /></div>
      <span className="inactive-badge"><MessageCircle size={15} /> Belum aktif</span>
      <p className="eyebrow">TEMAN BELAJAR NARA</p>
      <h2>Tanya Nara belum aktif</h2>
      <p>Untuk saat ini, kita belajar lewat soal-soal pilihan yang sudah disiapkan. Kalau ada soal yang terasa sulit, tandai supaya bisa dibahas bersama guru.</p>
      <Link className="button primary" href="/mapel/matematika">Pilih latihan kurasi <ArrowRight size={18} /></Link>
    </section>
  </AppShell>;
}
