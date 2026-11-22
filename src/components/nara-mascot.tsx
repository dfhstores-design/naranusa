export default function NaraMascot({ tiny = false, small = false }: { tiny?: boolean; small?: boolean }) {
  const size = tiny ? 38 : small ? 124 : 244;
  return (
    <svg width={size} height={size} viewBox="0 0 240 240" role="img" aria-label="Nara, maskot burung rangkong NaraNusa">
      <ellipse cx="121" cy="218" rx="72" ry="12" fill="#403769" opacity=".11" />
      {!tiny && <>
        <circle cx="45" cy="73" r="10" fill="#fff" opacity=".6" />
        <path d="M43 74h9m-4-4v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".75" />
        <path d="M195 44l3-8m8 13 8-4" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".8" />
      </>}
      <path d="M67 177c-15 16-26 23-38 25 5-14 14-27 29-35" fill="#32a98e" />
      <path d="M64 183c-5 12-8 23-7 31 12-6 20-17 25-32" fill="#218f7d" />
      <path d="M173 173c14 11 22 21 27 34-17-1-31-10-42-26" fill="#f5b741" />
      <path d="M81 169c-8 15-11 26-9 36 14 13 33 20 53 20 23 0 42-8 57-24 2-16-4-28-12-40" fill="#f8c44e" />
      <path d="M85 184c10 14 24 21 40 21 17 0 31-7 42-21-2 20-14 34-41 35-25 1-37-11-41-35Z" fill="#f3a943" opacity=".7" />
      <path d="M67 125c0-42 23-73 63-73 42 0 67 29 67 69 0 39-25 63-67 63-38 0-63-21-63-59Z" fill="#fff8e9" />
      <path d="M66 129c-4-37 13-68 43-82 24-12 58-7 76 10-8 15-24 23-47 25-19 2-38-4-53 5-13 7-18 21-19 42Z" fill="#2f315b" />
      <path d="M90 65c16-29 58-39 85-23 11 7 19 17 22 31-14 12-30 17-48 16-22-1-35-15-59-7Z" fill="#ec765f" />
      <path d="M138 40c19-12 41-8 53 7 6 7 9 16 8 26-12 8-26 11-42 8-9-2-16-6-21-12 8-6 11-16 2-29Z" fill="#f3b545" />
      <path d="M155 108c25-16 57-12 69 0-11 13-32 20-63 15l-6-15Z" fill="#ef795e" />
      <path d="M85 128c4 17 18 29 34 30 20 1 32-14 34-32 2-18-11-32-31-32-22 0-40 13-37 34Z" fill="#fff" />
      <circle cx="123" cy="120" r="6" fill="#313150" />
      <circle cx="125" cy="118" r="2" fill="#fff" />
      <path d="M136 141c-7 7-17 8-25 2" stroke="#e8806b" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M93 75c12-11 26-14 40-10" stroke="#2f315b" strokeWidth="7" strokeLinecap="round" fill="none" />
      {!tiny && <>
        <path d="M95 228v6m38-6v6" stroke="#df8d43" strokeWidth="6" strokeLinecap="round" />
        <path d="M82 104c-15 4-23 15-25 31 13 6 25 1 34-11" fill="#f3b545" />
        <path d="M75 126c-6 5-12 9-20 10" stroke="#e68f45" strokeWidth="4" strokeLinecap="round" />
      </>}
    </svg>
  );
}
