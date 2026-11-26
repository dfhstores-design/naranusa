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
        {/* peta Indonesia — siluet kepulauan dari data Natural Earth 110m (public domain), diproyeksikan ke zona banner; warna palet terkunci */}
        <g>
          <path d="M320 206.6L323 214L327.3 214.5L330.2 218.2L328.5 234.6L322 234.7L309.5 225L302.6 216.7L295.2 204L290 199.1L286.1 189.5L280.8 185.8L277.8 180.8L267.2 171L266.7 168.1L279.6 169.4L298.1 187.9L304.1 188L309 192L312.4 196.9L316.9 199.6L314.5 204.4L320 206.6Z" fill="#249d87" />
          <path d="M440.9 252.4L441.6 255.4L437.8 259.7L432 260.3L435.1 254.7L440.9 252.4Z M495.1 240.7L494.6 236.3L496.8 232.2L498.2 236.7L495.1 240.7Z M413.5 260.4L405.7 256.3L411.2 255.2L416.3 258.7L415.9 260.3L413.5 260.4Z M419.6 250.3L428.8 247.7L427.9 251L419.1 252.7L411.3 251.9L411.3 249.8L415.9 248.6L419.6 250.3Z M401.5 249.3L405.2 248.8L406.6 251.3L392.6 253.2L394.6 249.9L397.8 249.8L399.4 247.7L401.5 249.3Z M344.2 237.9L345 240L356.2 240.6L357.5 238.2L368.4 241L370.5 244.8L379.3 245.9L386.5 249.4L379.8 251.6L373.4 249.2L362 248.9L345.4 245.1L342.9 245.8L332.2 243.4L331.2 240.9L325.8 240.4L329.9 234.8L337 235.2L344.2 237.9Z" fill="#f3b545" />
          <path d="M399.3 175.9L396 181.2L400.3 186.8L399.3 189.5L405.9 194.9L398.9 195.6L396.9 199.6L397.2 204.9L391.5 208.9L389.1 223.8L388.3 221.7L381.6 224.3L379.3 220.7L375.1 220.4L372.2 218.5L365.2 220.6L363 217.8L354.4 217.4L353.5 209.6L350.5 207.9L347.7 202.9L346.9 197.8L347.6 192.3L351.1 188.4L352 192.4L356.1 195.7L363.6 194.9L367 191.9L369.8 191.4L375.4 193.1L380.2 191.8L387.5 174.9L399.3 175.9Z" fill="#ec765f" />
          <path d="M428.9 195.1L435.7 194.8L441.5 190.6L442.5 191.9L437.8 197.7L433.4 198.8L427.7 197.7L412.8 198.8L412 203.3L417.2 208.5L420.4 205.8L431.3 203.8L430.9 206.5L428.3 205.7L425.8 209.1L420.6 211.4L426.1 218.9L425.1 220.9L430.4 227.7L430.3 231.6L427.2 233.3L424.9 231.2L427.7 226.4L421.9 228.7L420.5 227.1L421.2 224.8L417 221.4L417.4 215.6L413.5 217.4L414.3 232.7L410.5 233.5L408 231.8L409.7 226.4L408.8 220.7L406.3 220.7L404.5 216.7L406.9 212.8L410.7 199.3L416.9 192.5L428.9 195.1Z" fill="#2f315b" />
          <path d="M535 215.5L535.2 253.7L530 248.9L524 247.7L522.6 249.4L515.1 249.6L517.6 244.8L521.3 243.2L517 231.9L505.6 226.9L500.7 226.4L491.9 221L490.2 223.8L487.9 224.4L486.6 219.7L482.1 216.8L488.4 214.7L492.6 214.8L492.1 213.2L483.5 213.2L481.2 209.7L476 208.6L473.5 205.7L481.4 204.3L484.4 202.4L493.8 204.8L496.4 216.5L502.5 220L507.4 213.8L514.1 210.2L519.3 210.2L528.7 214.4L535 215.5Z M466.7 216.7L473.2 218.4L475.3 222.9L470.4 220.4L458.1 220.1L459.5 216.9L466.7 216.7Z M452.1 222.5L448 221.4L446.9 218.9L452.8 218.6L454.3 220.5L452.1 222.5Z M458.3 187.5L458.7 190.7L462.2 191.2L462.7 193.6L462.4 198.7L459.4 198.1L458.5 201.7L460.9 204.8L459.3 205.5L456.9 201.8L455.2 194.3L456.4 189.6L458.3 187.5Z" fill="#249d87" />
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
