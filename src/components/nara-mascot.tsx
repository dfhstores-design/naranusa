export default function NaraMascot({ small = false }: { small?: boolean }) {
  const size = small ? 124 : 244;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      role="img"
      aria-label="Nara, anak perempuan berambut hitam berkepang dua, berjepit bintang, memakai baju hijau lengan panjang dan celana kuning"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="120" cy="228" rx="62" ry="7" fill="#2f315b" opacity=".12" />
      <path d="M43 66v12m-6-6h12m148 10v10m-5-5h10" stroke="#f3b545" strokeWidth="2.5" strokeLinecap="round" opacity=".78" />
      <path d="m186 48 2-5m7 12 5-3" stroke="#fff8e9" strokeWidth="3" strokeLinecap="round" />

      {/* Two long braids sit behind the shoulders and remain visible below them. */}
      <path d="M83 70c-13 2-22 12-22 26l2 16c-5 8-4 16 3 22-3 8-1 15 6 19l8-6 5-19 1-30Z" fill="#17171a" />
      <path d="M157 70c14 2 23 12 23 26l-2 16c5 8 4 16-3 22 3 8 1 15-6 19l-8-6-5-19-1-30Z" fill="#17171a" />
      <path d="M64 98c6-4 13-3 18 1m-17 9c6-4 13-3 18 1m-16 9c6-4 12-3 17 1m-14 9c5-4 11-3 16 1m-10 9c4-3 8-3 12 0" fill="none" stroke="#302e31" strokeWidth="5" strokeLinecap="round" />
      <path d="M176 98c-6-4-13-3-18 1m17 9c-6-4-13-3-18 1m16 9c-6-4-12-3-17 1m14 9c-5-4-11-3-16 1m10 9c-4-3-8-3-12 0" fill="none" stroke="#302e31" strokeWidth="5" strokeLinecap="round" />
      <path d="M72 148 58 138v20Zm0 0 14-10v20Z" fill="#f3b545" stroke="#2f315b" strokeWidth={2} strokeLinejoin="round" /><circle cx="72" cy="148" r="3.5" fill="#f3b545" stroke="#2f315b" strokeWidth={2} />
      <path d="M167 148 153 138v20Zm0 0 14-10v20Z" fill="#f3b545" stroke="#2f315b" strokeWidth={2} strokeLinejoin="round" /><circle cx="167" cy="148" r="3.5" fill="#f3b545" stroke="#2f315b" strokeWidth={2} />
      <path d="m67 148 10 9m96-9-10 9" stroke="#f2a18e" strokeWidth="2.5" strokeLinecap="round" />

      {/* Pink-coral backpack straps peek over both shoulders. */}
      <path d="M91 118c-8 5-13 15-13 29l4 22 12-1 1-26c0-9 3-15 8-19Z" fill="#f2a18e" />
      <path d="M149 118c8 5 13 15 13 29l-4 22-12-1-1-26c0-9-3-15-8-19Z" fill="#f2a18e" />
      <path d="M87 135c-2 6-2 13-1 20m66-20c2 6 2 13 1 20" fill="none" stroke="#ffd2c8" strokeWidth="3" strokeLinecap="round" opacity=".9" />

      {/* Long yellow trouser legs and bright white sneakers. */}
      <path d="M91 164h59l-2 31c-1 5-5 8-10 8h-12l-5-23-4 23h-17c-5 0-8-4-8-9Z" fill="#f3b545" />
      <path d="m95 171 19 2m18-2 15 1" stroke="#f8cf71" strokeWidth="3" strokeLinecap="round" />
      <path d="M103 198h17l-1 17H95c-5 0-8-3-7-7 1-5 6-9 15-10Zm30 0h10c8 1 13 5 14 10 1 4-2 7-7 7h-22Z" fill="#fff8e9" stroke="#d9e6e1" strokeWidth="2" strokeLinejoin="round" />
      <path d="M90 209c6 3 20 3 30 0m2 0c9 3 20 3 34 0" stroke="#249d87" strokeWidth="4" strokeLinecap="round" />
      <path d="m98 203 8 2m16 0 8-2m-27 7 9 1m12 0 9-1" stroke="#249d87" strokeWidth="2" strokeLinecap="round" />

      {/* Neck and teal long-sleeved top. */}
      <path d="M108 105h24v20c0 6-5 10-12 10s-12-4-12-10Z" fill="#e9a27e" />
      <path d="M97 117c5-5 13-8 23-8s18 3 23 8l12 12-5 39H90l-5-39Z" fill="#249d87" />
      <path d="M101 120c6-4 12-6 19-6 8 0 15 2 20 6" fill="none" stroke="#49b59f" strokeWidth="3" strokeLinecap="round" />
      <path d="M91 126c-8 1-13 5-18 12l-10 17 10 8 18-18 9-11Z" fill="#249d87" />
      <path d="m158 127 11 11 7 12-10 8-14-15-6-8Z" fill="#249d87" />
      <path d="M65 152c-4 0-7 3-8 7-1 3 1 6 4 8l10 3 6-13-7-4Z" fill="#e9a27e" />
      <path d="M174 149c-4 0-7 2-9 5l-3 7 10 5 8-8c2-3 1-7-2-8Z" fill="#e9a27e" />
      <path d="M86 164h69" stroke="#1e8274" strokeWidth="3" strokeLinecap="round" />
      <path d="M109 114 120 123l11-9" fill="none" stroke="#fff8e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {/* Small white archipelago motif: a simplified map of Indonesia. */}
      <path d="m101 136 4-3 3 2-2 4-4 2-3-2Zm8 9 5 1 3 2-2 2-6-1-4-2Zm10-8 4-3 4 1 2 4-3 3-4-2-4 1-3-2Zm9 12 3-2 3 2-1 3-4 1-2-2Zm7-7 3-3 3 2-1 4-3 2-3-2Zm8 2 4-2 4 3-2 3-4 1-3-3Z" fill="#fff8e9" />
      <circle cx="103" cy="147" r="1.2" fill="#fff8e9" />
      <circle cx="145" cy="137" r="1.3" fill="#fff8e9" />

      {/* Raised right hand (viewer-left) waving hello. */}
      <path d="M75 130 68 123 58 106 54 91c-1-3-4-4-6-2-2 1-3 3-2 5l3 10-8-13c-2-3-5-3-7-1-2 2-1 4 1 7l8 12-10-8c-3-2-6-1-7 2-1 2 0 4 3 6l11 9-8-2c-3-1-6 1-6 4 0 2 2 4 5 5l14 4 8 9Z" fill="#f1b18e" stroke="#dd8b6b" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m44 106 4 5m-2 8 5 3m1-18 2 6" stroke="#ffd3b8" strokeWidth="2" strokeLinecap="round" />

      {/* Round friendly face, with large bright eyes and an open smile. */}
      <ellipse cx="82" cy="80" rx="7" ry="10" fill="#e9a27e" />
      <ellipse cx="158" cy="80" rx="7" ry="10" fill="#e9a27e" />
      <path d="M81 61c0-24 16-40 39-40s39 16 39 40v26c0 24-16 39-39 39S81 111 81 87Z" fill="#f1b18e" />
      <path d="M79 68c-3-28 13-47 39-50 28-3 47 16 43 47-12-1-21-7-27-16-8 11-26 20-55 19Z" fill="#17171a" />
      <path d="M87 55c5-15 17-24 32-25m18 5c10 5 17 15 19 26" fill="none" stroke="#302e31" strokeWidth="3" strokeLinecap="round" />
      <path d="M95 74c5-4 11-5 16-2m14 0c5-3 11-2 16 2" fill="none" stroke="#17171a" strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="105" cy="84" rx="8" ry="10" fill="#fff8e9" />
      <ellipse cx="136" cy="84" rx="8" ry="10" fill="#fff8e9" />
      <ellipse cx="106" cy="85" rx="4.4" ry="6.5" fill="#17171a" />
      <ellipse cx="137" cy="85" rx="4.4" ry="6.5" fill="#17171a" />
      <circle cx="107.5" cy="82.5" r="2.1" fill="#fff8e9" />
      <circle cx="138.5" cy="82.5" r="2.1" fill="#fff8e9" />
      <ellipse cx="93" cy="96" rx="7" ry="4" fill="#ec765f" opacity=".32" />
      <ellipse cx="149" cy="96" rx="7" ry="4" fill="#ec765f" opacity=".32" />
      <path d="M113 99c0 8 4 12 10 12s11-5 11-12c-6 4-15 4-21 0Z" fill="#7c2f31" />
      <path d="M115 101c5 3 12 3 17 0v3c-4 4-12 4-16 0Z" fill="#fff8e9" />
      <path d="M123 110v2" stroke="#ec765f" strokeWidth="2" strokeLinecap="round" />

      {/* Yellow star clip on the upper-left side of her uncovered hair. */}
      <path d="m91 39 4 8 9 1-6.5 6 1.6 9-8.1-4.3-8.1 4.3 1.6-9-6.5-6 9-1Z" fill="#f3b545" stroke="#fff8e9" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="151" cy="45" r="2" fill="#ec765f" />

      {/* Orange-coral book and the hand holding it. */}
      <path d="m165 145 25 5c3 1 5 3 5 6v31c0 2-2 4-5 3l-24-5c-2 0-4-2-4-5v-31c0-3 1-5 3-4Z" fill="#f07732" stroke="#d95f1e" strokeWidth="2" strokeLinejoin="round" />
      <path d="m166 149 19 4v29l-19-4Z" fill="#f3b545" />
      <path d="m185 153 8 2v31l-8-2Z" fill="#fff8e9" />
      <path d="m170 155 11 2m-11 5 11 2m-10 17 9 2" stroke="#fff8e9" strokeWidth="2" strokeLinecap="round" />
      <path d="M159 150c-4 1-7 5-6 9l2 7c1 3 4 5 7 5l4-1v-14Z" fill="#f1b18e" stroke="#dd8b6b" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="m156 158 6 3" stroke="#ffd3b8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
