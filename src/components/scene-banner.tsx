import type { ReactNode } from "react";

/**
 * Latar adegan sesuai mockup pratinjau (halaman 01 Masuk & 05 Hasil):
 * langit, awan putih, peta Indonesia, angka besar 1-2-3, buku, dan
 * bintang — dengan karakter dari lembar (bukan gambar duo.webp pratinjau:
 * karakter di gambar itu masih versi lama, Nara berlengan & bercelana pendek).
 * Semua warna dari palet terkunci di Space (bg #f7f8fc, teal #249d87,
 * amber #f3b545, coral #ec765f, navy #2f315b, cream #fff8e9) — tanpa
 * warna baru, tanpa gradasi.
 */
export function SceneBanner({
  children,
  className = "",
  label = "Nara dan Nusa di peta Indonesia",
  numbersDy = 0,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
  /** Geser angka 1-2-3 ke bawah (dipakai kartu selesai yang lebar & pendek:
      potongan vertikal SVG-nya memotong bagian atas, jadi angka harus turun). */
  numbersDy?: number;
}) {
  return (
    <div className={`scene-banner ${className}`} role="img" aria-label={label}>
      <svg
        className="scene-banner-art"
        viewBox="0 0 800 320"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {/* awan */}
        <g fill="#ffffff">
          <ellipse cx="90" cy="52" rx="72" ry="26" />
          <ellipse cx="150" cy="66" rx="56" ry="20" />
          <ellipse cx="700" cy="44" rx="78" ry="24" />
          <ellipse cx="640" cy="60" rx="48" ry="17" />
          <ellipse cx="410" cy="30" rx="52" ry="15" opacity="0.7" />
          <ellipse cx="60" cy="250" rx="46" ry="15" opacity="0.8" />
          <ellipse cx="750" cy="255" rx="50" ry="16" opacity="0.8" />
        </g>
        {/* angka 1-2-3 seperti mockup, warna palet terkunci: amber, teal, koral.
            Posisi di atas kepala karakter & di celah antar-karakter supaya
            tidak tertutup (zona aman yang terlihat di banner login maupun
            kartu selesai: x 230-570, y 80-240). */}
        <g fontFamily="'Nunito Variable', Nunito, sans-serif" fontWeight="950" fontSize="60" textAnchor="middle" transform={`translate(0 ${numbersDy})`}>
          <text x="240" y="98" fill="#f3b545" transform="rotate(-6 240 98)">1</text>
          <text x="400" y="92" fill="#249d87" transform="rotate(3 400 92)">2</text>
          <text x="560" y="98" fill="#ec765f" transform="rotate(6 560 98)">3</text>
        </g>
        {/* peta Indonesia (bentuk yang sama dengan banner peta di login) */}
        <g transform="translate(215 165) scale(2.6)">
          <path d="M6 26Q10 12 20 10q6 2 2 12-4 10-12 6-6-2-4-2Z" fill="#249d87" />
          <path d="M28 30q12-4 30-2 2 4-8 5-14 1-22-1Z" fill="#f3b545" />
          <path d="M52 12q10-6 18 0 4 8-4 14-10 0-14-6Z" fill="#ec765f" />
          <path d="M76 14q4-6 8-2-2 8-6 10-4-2-2-8Z" fill="#2f315b" />
          <path d="M90 16q10-8 20-4 6 6 0 12-10 2-18-2-4-4-2-6Z" fill="#249d87" />
        </g>
        {/* buku-buku */}
        <g>
          <g transform="rotate(-14 92 190)">
            <rect x="62" y="172" width="60" height="38" rx="6" fill="#249d87" />
            <rect x="68" y="178" width="48" height="26" rx="3" fill="#ffffff" opacity="0.85" />
          </g>
          <g transform="rotate(12 712 185)">
            <rect x="682" y="168" width="60" height="38" rx="6" fill="#f3b545" />
            <rect x="688" y="174" width="48" height="26" rx="3" fill="#ffffff" opacity="0.85" />
          </g>
          <g transform="rotate(-8 730 268)">
            <rect x="700" y="252" width="56" height="34" rx="6" fill="#ec765f" />
            <rect x="706" y="258" width="44" height="22" rx="3" fill="#ffffff" opacity="0.85" />
          </g>
        </g>
        {/* bintang & titik */}
        <g fill="#f3b545">
          <path d="M150 150l5 12 12 5-12 5-5 12-5-12-12-5 12-5Z" />
          <path d="M655 135l4 10 10 4-10 4-4 10-4-10-10-4 10-4Z" />
        </g>
        <g fill="#ec765f">
          <path d="M300 150l4 10 10 4-10 4-4 10-4-10-10-4 10-4Z" />
          <path d="M520 165l4 10 10 4-10 4-4 10-4-10-10-4 10-4Z" />
        </g>
        <g fill="#249d87">
          <circle cx="120" cy="120" r="5" />
          <circle cx="680" cy="100" r="5" />
          <circle cx="360" cy="150" r="4" />
          <circle cx="470" cy="130" r="4" />
        </g>
      </svg>
      <div className="scene-banner-characters">{children}</div>
    </div>
  );
}
