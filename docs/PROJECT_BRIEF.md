# NaraNusa — fondasi PWA belajar Kelas 4

## Nama dan konsep

Nama yang dipertimbangkan: **NaraNusa**, **KikoBelajar**, dan **Lentera Cilik**. Prototipe memakai **NaraNusa**: mudah diucapkan anak, terasa dekat dengan Indonesia, dan bisa dikembangkan ke kelas berikutnya.

Maskotnya **Nara**, anak burung rangkong yang suka bertanya dan menjelajah. Rangkong memberi identitas Nusantara tanpa memakai tokoh atau aset milik pihak lain. Ilustrasi SVG dibuat khusus untuk proyek ini dan ringan untuk PWA.

## Sasaran dan lingkup MVP

- Anak Kelas 4 SD, sekitar usia 9–11 tahun.
- Fase B Kurikulum Merdeka, dengan catatan bahwa CP adalah capaian akhir fase yang umumnya meliputi kelas III–IV.
- Empat mapel sejak MVP pertama: Matematika, Bahasa Indonesia, IPAS, dan Pendidikan Pancasila.
- Konten contoh dan daftar bab ditautkan pada sumber resmi/tepercaya. Soal contoh adalah rumusan baru, bukan salinan soal buku.
- Soal yang sudah dimuat, jawaban, dan progres contoh dapat dipakai offline pada perangkat yang sama.

## Sistem visual

- Warna dasar: ungu `#6D5BD0`, latar lembut `#F7F8FC`, teks `#292840`; aksen mapel: oranye-merah muda, hijau mint, dan kuning madu.
- Tipografi: system sans-serif tebal dan mudah dipindai; judul besar, label pendek, dan kontras yang jelas.
- Komponen: kartu dengan radius besar, tombol berukuran nyaman disentuh, progress bar, badge, tab mapel, feedback jawaban, dan bottom navigation pada layar kecil.
- Animasi Framer Motion bersifat singkat; prefers-reduced-motion dihormati.
- Ikon maskot dan peta materi disusun dengan SVG/CSS buatan proyek, tanpa aset komersial.

## Alur utama

1. Dashboard anak: misi hari ini, streak, XP, bintang, dan kartu empat mapel.
2. Jelajahi topik: daftar bab Kelas 4 per mapel, tujuan ringkas, dan tautan rujukan.
3. Latihan: contoh soal pilihan ganda dengan umpan balik, penjelasan, dan tautan sumber.
4. Progres: ringkasan lokal per mapel untuk ditinjau bersama orang tua.
5. PWA: manifest, service worker, fallback offline, dan cache app shell; konten statis contoh termasuk dalam bundle.
6. Masuk: halaman dasar Supabase Auth yang aktif hanya setelah env Supabase disiapkan.
7. Tanya Nara: endpoint Gemini server-side opsional, dibatasi pada topik terverifikasi; tidak aktif tanpa kunci server.

## Arsitektur proyek

```text
src/
  app/                 App Router: beranda, masuk, offline, API tutor
  components/          dashboard, maskot, kartu tutor
  content/             sumber, topik, tujuan dan soal contoh
  lib/                 klien Supabase opsional
  store/               progres lokal Zustand
supabase/schema.sql    skema awal dengan RLS
public/                manifest, ikon dan service worker
scripts/               (ruang untuk validasi konten/build)
docs/                  sumber kurikulum, skema soal, prompt AI, roadmap
```

Peta topik dan soal berada di `src/content/curriculum.ts`; `sourceIds` mengikat setiap mapel/topik/soal ke metadata rujukan. Untuk konten tambahan, tambah sumber dan bukti terlebih dahulu, lalu buat tujuan dan soal dengan `sourceIds` serta lokasi bab/halaman.

## Batas prototipe dan keputusan keselamatan

- Dashboard menggunakan profil demo “Alya”; tidak meminta data pribadi anak.
- Progres saat ini tersimpan di localStorage pada perangkat ini. Belum tersinkron antargawai atau akun.
- Supabase, Gemini, Vercel, dan Cloudflare belum diaktifkan atau diberi kredensial.
- Leaderboard publik dimatikan pada MVP; pertimbangkan hanya setelah persetujuan wali, nama samaran, opsi ikut/keluar, dan moderasi.
- AI tidak boleh mengarang CP, ATP, bab, jawaban, fakta, atau contoh yang tak didukung sumber. Variasi soal harus ditinjau manusia sebelum dipublikasikan.
- Katalog dan buku revisi berbeda tahun; simpan tahun/edisi sumber dan jangan menyamakan tujuan buku dengan CP nasional.

## Roadmap

### Fase 1 — MVP Kelas 4, empat mapel

- Beranda, empat mapel, peta topik, empat soal contoh (satu per mapel), XP/bintang demo, dan laporan orang tua sederhana.
- Installable PWA dan latihan contoh offline.
- Tautan sumber/tujuan belajar terlihat pada halaman topik dan saat menjawab.

### Fase 2 — Konten guru dan asesmen

- Tambah bank soal per topik setelah ada pemeriksaan pendidik.
- Tambahkan validator otomatis: semua soal harus menunjuk topik, sumber, lokasi bukti, serta kunci dan pembahasan.
- Dukungan guru untuk meninjau, menerima, menolak, atau memperbaiki soal.

### Fase 3 — Akun dan sinkronisasi

- Hubungkan Supabase Auth, profil wali/anak, serta sinkronisasi progres dengan kebijakan RLS.
- Simpan cache lokal agar sesi belajar tetap berjalan ketika sinyal lemah.
- Jangan memindahkan service-role key ke browser.

### Fase 4 — Tutor AI terbatas

- Aktifkan endpoint Gemini hanya di server dan setelah konfigurasi serta pemeriksaan biaya/kuota.
- Masukkan konteks sumber yang telah disetujui untuk setiap panggilan; abstain bila konteks tidak cukup.
- Keluaran soal variasi masuk antrean review, tidak otomatis diterbitkan.

### Fase 5 — Gamifikasi lanjutan

- Badge, avatar tambahan, tantangan mingguan, dan laporan wali.
- Kontes/leaderboard hanya dengan pilihan ikut serta dan perlindungan identitas anak.

## Target deployment

Target teknis adalah deploy Next.js di Vercel dan memakai Cloudflare untuk DNS/proxy bila diperlukan. Ini masih rencana, bukan layanan yang sudah dibuat atau dihubungkan. Sebelum memilih konfigurasi, cek kembali ketentuan dan harga terkini, minimalkan log/data anak, tempatkan semua kunci di environment server, dan minta persetujuan sebelum mengaktifkan layanan berbayar.
