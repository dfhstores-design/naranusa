# NaraNusa — PWA belajar seru Kelas 4

Prototipe edukasi mobile-first untuk Kelas 4/Fase B. Topik dan soal contoh ditautkan pada sumber pemerintah yang dapat diperiksa. Ini fondasi aplikasi, bukan produk sekolah siap rilis.

## Jalankan lokal

```bash
pnpm install
pnpm dev
```

Buka `http://localhost:3000`. Untuk memeriksa PWA offline, gunakan build produksi:

```bash
pnpm build
pnpm start
```

Di browser Chromium, buka beranda, tunggu service worker aktif, lalu coba putuskan koneksi dan muat ulang. Soal contoh terbundel dan progres yang disimpan di perangkat tetap tersedia. Dukungan instalasi ditampilkan jika browser mengirim event install.

## Fitur yang sudah dibuat

- Next.js 15 App Router, TypeScript, Tailwind CSS 4, Framer Motion, Zustand, Lucide, dan pola komponen shadcn/ui.
- Dashboard anak, empat mapel, daftar topik, empat soal contoh, umpan balik dan sumber per soal.
- Misi demo, latihan topik, ujian mini, mode cepat, XP/bintang/streak, progres lokal, dan ringkasan orang tua.
- Manifest PWA, service worker, ikon SVG, cache shell, serta halaman fallback offline.
- Halaman masuk Supabase opsional dan endpoint Tanya Nara Gemini opsional yang hanya berjalan di server; tutor hanya dapat memproses topik dengan contoh soal dan pembahasan yang telah disetujui guru. Seluruh contoh saat ini masih berstatus perlu ditinjau sehingga tutor belum aktif.
- Skema SQL awal dengan RLS dan tabel kunci jawaban terpisah.

## Integrasi opsional

Salin `.env.example` ke `.env.local`, lalu isi hanya nilai konfigurasi milik proyek. Jangan commit `.env.local`.

- `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`: untuk Supabase Auth prototipe. Halaman masuk aktif hanya setelah keduanya diisi. Sebelum produksi, gunakan session/cookie server dan tinjau ulang seluruh RLS.
- `GEMINI_API_KEY`: hanya di server, jangan beri prefix `NEXT_PUBLIC_`.
- `GEMINI_MODEL`: opsional; contoh awal `gemini-2.5-flash`.

Gemini tidak dipanggil tanpa `GEMINI_API_KEY`. Pemakaian API dapat terkait kuota/tagihan; periksa batas dan kebijakan penyedia sebelum menambahkan kunci.

## Prinsip konten

`src/content/curriculum.ts` adalah sumber data UI. CP Fase B umumnya mencakup Kelas III–IV; daftar bab buku memberi konteks Kelas IV, bukan pembagian nasional wajib. Contoh ATP Ruang GTK merupakan inspirasi yang dapat disesuaikan. Lihat [peta sumber](docs/CURRICULUM_SOURCES.md), [prompt Gemini](docs/GEMINI_PROMPT.md), [skema soal](docs/QUESTION_SCHEMA.json), [brief dan roadmap](docs/PROJECT_BRIEF.md), serta [schema SQL](supabase/schema.sql).

Soal contoh memakai redaksi baru dan belum menggantikan pemeriksaan guru. Variasi AI harus masuk draf dan ditinjau sebelum diterbitkan. Tidak ada konten dari repo GitHub pihak ketiga dipakai sebagai sumber pada MVP.

## Batas prototipe

Profil “Alya Putri” dan progres awal adalah demo, bukan identitas nyata. Dashboard belum tersambung ke database; progres masih lokal. Supabase schema tersedia sebagai fondasi, tetapi Supabase, Gemini, hosting, dan Cloudflare belum dikonfigurasi. Tutor AI membutuhkan kunci server dan contoh yang disetujui guru; saat ini tidak ada contoh yang disetujui. Instruksi model tidak menjamin jawaban bebas kesalahan. Endpoint belum memiliki autentikasi, persetujuan wali, rate limit terdistribusi, atau batas biaya; pesan murid akan diteruskan ke Gemini jika tutor diaktifkan. Jangan digunakan oleh anak atau dipublikasikan sebelum kontrol tersebut dirancang dan diuji. Kunci jawaban contoh ada pada klien sehingga bukan asesmen aman. Mode latihan dan statistik masih demo. Sinkronisasi multi-perangkat, bank soal lengkap, avatar editor, laporan mingguan, serta kompetisi/leaderboard belum diimplementasikan. Leaderboard publik sebaiknya tidak diaktifkan tanpa persetujuan wali dan kontrol identitas anak.

## Struktur folder

```text
src/app/                 App Router, beranda, masuk, offline, API tutor
src/components/          dashboard, maskot, kartu tutor
src/content/             peta kurikulum, sumber dan soal
src/lib/                 helper Supabase
src/store/               progres lokal Zustand
public/                   ikon, manifest, service worker
supabase/schema.sql       tabel awal dan kebijakan RLS
docs/                     sumber, prompt, schema soal, roadmap
```

Sebelum deployment, lakukan audit keamanan, uji aksesibilitas bersama anak/guru, verifikasi konten oleh guru, dan uji sinkronisasi/offline pada perangkat nyata.


## UI reusable dan target deploy

Komponen reusable di `src/components/ui/` memakai Radix UI, Class Variance Authority, dan helper Tailwind merge dengan pola shadcn/ui: `Button`, `Card`, `Badge`, dan `Progress`. Target deploy yang diminta adalah Vercel untuk Next.js dan Cloudflare sebagai lapisan DNS/proxy; keduanya belum diaktifkan. Sebelum publikasi, cek ulang kuota, harga, lokasi pemrosesan data, kebutuhan domain, serta persetujuan wali untuk fitur anak.
