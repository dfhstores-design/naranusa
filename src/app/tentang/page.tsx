import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import "@fontsource-variable/nunito";
import { CharacterArt } from "@/components/character-art";
import { SceneBanner } from "@/components/scene-banner";
import "@/components/mockup.css";

const SOCIABUZZ_URL = "https://sociabuzz.com/andri_ndi/tribe";

export default function TentangPage() {
  return (
    <main className="login-page">
      <section className="login-art" aria-label="NaraNusa">
        <Link href="/" className="brand-link">
          <span className="brand-mark" aria-hidden="true"><Image src="/naranusa/icon.svg" alt="" aria-hidden="true" width={44} height={44} /></span>
          <span><strong>Nara<span>Nusa</span></strong><small>jelajah ilmu, seru!</small></span>
        </Link>
        <SceneBanner>
          <CharacterArt character="nara" alt="Nara melambai" />
          <CharacterArt character="nusa" alt="Nusa menyapa" />
        </SceneBanner>
        <div className="login-art-copy"><h1>Tentang NaraNusa</h1><p>Belajar seru bareng Nara &amp; Nusa!</p></div>
      </section>
      <section className="login-form-side" aria-labelledby="tentang-heading">
        <div className="login-card">
          <h2 id="tentang-heading">Tentang NaraNusa</h2>
          <p className="muted">NaraNusa adalah aplikasi belajar untuk anak Kelas 4 SD (Fase B, Kurikulum Merdeka). Ada 9 mata pelajaran dan 1.185 soal latihan yang disusun mengikuti buku Erlangga, lengkap dengan pembahasan dan rujukan materi.</p>
          <h3>Tentang pengembang</h3>
          <p>Saya Andri, ayah dari seorang anak Kelas 4. NaraNusa saya buat karena saya ingin anak saya belajar dengan soal-soal yang sesuai bukunya, dengan cara yang menyenangkan. Aplikasi ini gratis — saya membuatnya untuk anak saya, dan saya senang kalau bisa membantu anak-anak lain juga.</p>
          <h3>Dukung NaraNusa</h3>
          <p>NaraNusa gratis dan akan tetap gratis untuk semua anak. Kalau aplikasi ini membantu anakmu belajar, kamu bisa mendukung pengembangannya lewat Sociabuzz — sekadar traktir kopi, supaya saya bisa terus menambah soal dan fitur baru.</p>
          <a className="button primary full" href={SOCIABUZZ_URL} target="_blank" rel="noreferrer">Dukung lewat Sociabuzz <ArrowRight size={19} aria-hidden="true" /></a>
          <p className="privacy-note">Dukungan bersifat sukarela dan tidak mengubah apa pun di aplikasi — semua soal dan fitur tetap gratis untuk semua anak.</p>
          <p className="privacy-note"><Link href="/masuk">Masuk untuk belajar</Link></p>
        </div>
      </section>
    </main>
  );
}
