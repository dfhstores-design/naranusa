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
- Dashboard anak, empat mapel, 26 topik, dan tepat 130 soal (5 per topik) dengan kunci, penjelasan, serta rujukan.
- Semua 130 soal tersedia langsung untuk latihan murid dan tetap berstatus `needs_teacher_review`; ketersediaan tidak berarti disetujui guru.
- Misi demo, latihan topik, ujian mini, mode cepat, XP/bintang/streak, progres lokal, dan ringkasan orang tua.
- Manifest PWA, service worker, ikon SVG, cache shell, serta halaman fallback offline.
- Halaman masuk Supabase opsional, endpoint tutor server-side, serta halaman pengelolaan provider privat di `/admin/ai-providers` dan `/owner/ai-providers`.
- Pool bersama server-side untuk Gemini, Claude, OpenAI, DeepSeek, dan endpoint kustom OpenAI-compatible; pencatatan token harian serta failover saat batas kuota tercapai.
- Skema SQL dengan RLS, role Owner, ketersediaan soal terpisah dari tinjauan guru, dan tabel kunci jawaban terpisah.

## Integrasi opsional

Salin `.env.example` ke `.env.local`, lalu isi hanya nilai konfigurasi milik proyek. Jangan commit `.env.local`.

- `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`: untuk Supabase Auth. Akun harus memiliki `profiles.role` tepercaya `teacher`, `admin`, atau `owner` untuk mengelola scope yang sesuai.
- `SUPABASE_SERVICE_ROLE_KEY`: wajib hanya di server untuk memeriksa role melalui profil tepercaya, menyimpan ciphertext, membangun pool, dan mencatat usage. Jangan pernah memberi prefix `NEXT_PUBLIC_` atau mengirimkannya ke browser.
- `AI_CONFIG_ENCRYPTION_KEY`: wajib hanya di server; kunci acak 32 byte yang dienkode base64 (buat sendiri, misalnya `openssl rand -base64 32`). AES-256-GCM mengenkripsi kunci API dan nilai header sebelum disimpan. Jika kunci hilang/berubah, rahasia yang tersimpan tidak dapat didekripsi.

Provider credentials dimasukkan melalui halaman pengaturan terkait role dan hanya tampil sebagai status “tersimpan”; tidak ada nilai kunci yang dikirim kembali ke browser. Semua provider aktif dari kedua scope masuk pool bersama. `daily_token_limit` adalah batas token internal, bukan batas biaya mata uang; usage dicatat menurut tanggal UTC. Kegagalan provider akan dicoba pada kandidat berikutnya, dan kuota harian yang terdeteksi ditandai untuk sisa hari UTC.

## Prinsip konten

`src/content/curriculum.ts` memetakan topik dan sumber; bank final ada di `src/content/question-bank.json`. CP Fase B umumnya mencakup Kelas III–IV; daftar bab buku memberi konteks Kelas IV, bukan pembagian nasional wajib. Contoh ATP Ruang GTK merupakan inspirasi yang dapat disesuaikan. Lihat [peta sumber](docs/CURRICULUM_SOURCES.md), [prompt tutor](docs/GEMINI_PROMPT.md), [skema soal](docs/QUESTION_SCHEMA.json), [brief dan roadmap](docs/PROJECT_BRIEF.md), serta [schema SQL](supabase/schema.sql).

Soal memakai redaksi baru dan belum menggantikan pemeriksaan guru. Semua butir yang belum ditinjau tetap `needs_teacher_review`; tutor mempertahankan gate HTTP 409 sampai ada contoh `teacher_approved`. Variasi AI harus masuk draf dan ditinjau sebelum diterbitkan. Tidak ada konten dari repo GitHub pihak ketiga dipakai sebagai sumber pada MVP.

## Batas prototipe

Profil “Alya Putri” dan progres awal adalah demo, bukan identitas nyata. Dashboard belum tersambung ke database; progres masih lokal. Supabase, provider keys, hosting, dan Cloudflare belum dikonfigurasi. Saat ini belum ada soal yang disetujui guru, sehingga tutor selalu menolak topik dengan HTTP 409 sebelum mencoba provider. Endpoint tutor belum memiliki autentikasi murid, persetujuan wali, rate limit terdistribusi, maupun batas biaya. Catatan usage dibuat atomik setelah respons provider, tetapi belum ada reservasi token sebelum panggilan; permintaan serentak dapat melampaui batas internal. Batas token harian bukan jaminan batas biaya provider. Jangan gunakan oleh anak atau publikasikan sebelum kontrol tersebut dirancang dan diuji. Bank statis dan kunci jawaban masih terbundel di klien sehingga bukan asesmen aman. Mode latihan dan statistik masih demo. Sinkronisasi multi-perangkat, avatar editor, laporan mingguan, serta leaderboard belum diimplementasikan.

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
