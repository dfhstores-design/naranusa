export default function NaraMascot({ small = false }: { small?: boolean }) {
  const size = small ? 124 : 244;
  return (
    <svg width={size} height={size} viewBox="0 0 240 240" role="img" aria-label="Nara, anak perempuan berambut kepang dan berjepit bintang">
      <ellipse cx="121" cy="222" rx="68" ry="10" fill="#403769" opacity=".11" />
      <circle cx="45" cy="73" r="10" fill="#fff" opacity=".6" />
      <path d="M43 74h9m-4-4v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".75" />
      <path d="M195 44l3-8m8 13 8-4" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".8" />

      {/* Side braid, drawn behind the face and shoulder. */}
      <path d="M87 70c-18 3-28 17-27 33 1 8 8 12 7 19-2 8-1 15 6 21 4 4 4 9 6 15l15-8-2-22 5-38Z" fill="#3d2d4d" />
      <path d="M67 101c6-2 12 0 16 5m-17 5c6-2 12 0 16 5m-15 6c6-2 12 1 15 5m-12 7c5-2 10 0 13 4" fill="none" stroke="#70536a" strokeWidth="5" strokeLinecap="round" />
      <path d="M72 95c4 1 7 3 10 6m-12 27c4 0 7 2 10 5" fill="none" stroke="#9a725f" strokeWidth="2.5" strokeLinecap="round" opacity=".8" />

      {/* Face and ears; hair stays visibly uncovered. */}
      <ellipse cx="82" cy="100" rx="7" ry="10" fill="#eaa47e" />
      <ellipse cx="158" cy="100" rx="7" ry="10" fill="#eaa47e" />
      <path d="M84 73c0-23 15-38 37-38 23 0 38 16 38 40v27c0 22-16 38-38 38-21 0-37-16-37-38Z" fill="#f2b68f" />
      <path d="M78 82c-3-27 14-50 42-51 29-1 46 18 43 48-12 0-24-4-33-14-11 12-27 18-50 17Z" fill="#3d2d4d" />
      <path d="M93 90c5-4 11-5 17-3m16 0c6-2 12-1 17 3" fill="none" stroke="#49344e" strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="105" cy="101" rx="3.7" ry="5" fill="#342f51" />
      <ellipse cx="137" cy="101" rx="3.7" ry="5" fill="#342f51" />
      <circle cx="106.3" cy="99.5" r="1.2" fill="#fff" />
      <circle cx="138.3" cy="99.5" r="1.2" fill="#fff" />
      <path d="M112 119c6 6 14 6 20 0" fill="none" stroke="#cf735f" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="94" cy="113" r="5" fill="#e8917b" opacity=".32" />
      <circle cx="148" cy="113" r="5" fill="#e8917b" opacity=".32" />

      {/* Star hair clip. */}
      <path d="m148 43 3.5 7 7.8 1.1-5.7 5.3 1.4 7.7-7-3.8-7 3.8 1.4-7.7-5.7-5.3 7.8-1.1Z" fill="#f3b545" stroke="#fff8e9" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="132" cy="43" r="2.5" fill="#ec765f" />

      {/* Neck and long-sleeved top. */}
      <path d="M109 132h25v17h-25z" fill="#eaa47e" />
      <path d="M101 142c6-4 13-6 20-6s15 2 21 6l14 10-7 28H90l-7-28Z" fill="#32a98e" />
      <path d="M97 145 79 148 60 169l12 10 20-18 2 16 12 1 7-26Z" fill="#32a98e" />
      <path d="M145 145 163 148l19 21-12 10-20-18-2 16-12 1-7-26Z" fill="#32a98e" />
      <path d="M91 158l11 4m47-4-11 4" stroke="#218f7d" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 169c2-4 7-6 11-4l5 3-7 11-8-3c-3-2-3-5-1-7Zm119 0c-2-4-7-6-11-4l-5 3 7 11 8-3c3-2 3-5 1-7Z" fill="#f2b68f" />
      <path d="M109 139l9 9h7l9-9" fill="none" stroke="#fff8e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M91 180h60" stroke="#218f7d" strokeWidth="4" strokeLinecap="round" />

      {/* Long pants and small shoes. */}
      <path d="M90 179h60l-3 43h-24l-3-30-4 30H92Z" fill="#4a5274" />
      <path d="M91 185h25m9 0h24" stroke="#646d8d" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M94 216h25l-1 9H86c0-5 3-8 8-9Zm30 0h24c5 1 8 4 8 9h-33Z" fill="#f3b545" />
      <path d="M92 220h17m24 0h15" stroke="#fff8e9" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
