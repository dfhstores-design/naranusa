# Karakter Nara & Nusa

Art karakter di sini adalah **potongan langsung dari lembar karakter yang
dikirim Andri** (`IMG-20261124-WA0006.jpg`, 25 Nov 2026) — bukan gambar baru
dan bukan revisi SVG lama. Bentuk wajah, bentuk tubuh, warna, dan detail
lainnya persis seperti di lembar. Jangan diganti dengan gambar karangan.

- `nara-full.png` (380×533) — Nara utuh: kepang dua + pita kuning, jepit
  bintang, baju hijau motif peta Indonesia, tali ransel pink, buku oranye,
  celana kuning panjang, sepatu putih. Background dihapus (transparan).
- `nusa-full.png` (400×538) — Nusa utuh: hoodie oranye, celana biru,
  ransel biru + kompas, jempol ke atas. Background dihapus (transparan).
- `nara-face.png` / `nusa-face.png` (260×260) — potongan wajah untuk avatar.

Dipakai lewat `src/components/character-art.tsx`: semua varian ekspresi &
pose memakai file full-body yang sama, karena lembar hanya punya satu pose
tiap karakter. Kalau suatu hari ada pose/ekspresi baru dari lembar yang sama,
tambahkan file PNG potongan baru di sini dan petakan di komponen itu.
