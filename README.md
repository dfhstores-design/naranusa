# NaraNusa — Belajar Seru Kelas 4

NaraNusa adalah PWA belajar Kelas 4/Fase B untuk pilot terbatas. Antarmuka dibangun sebagai aset statis Next.js dan diterbitkan melalui GitHub Pages; autentikasi, soal, penilaian, progres, dan workbench dewasa memakai satu endpoint Google Apps Script.

## Menjalankan secara lokal

```bash
pnpm install
pnpm dev
```

Untuk memeriksa ekspor statis lokal:

```bash
pnpm lint
pnpm test
pnpm build
pnpm verify:export
```

Hasil ekspor berada di `out/`. Build mengatur `basePath` `/naranusa`, memakai trailing slash untuk halaman, dan tidak mengambil bank soal lokal. Jangan menguji login pilot atau mengirim perubahan data ke backend produksi.

## Fitur pilot

- Login username dan kata sandi melalui GAS; tidak ada pendaftaran mandiri dan browser hanya menyimpan token sesi di `sessionStorage`.
- Beranda anak, sembilan mata pelajaran, 75 topik kurikulum, latihan topik, Tantangan harian, Ujian mini, dan Mode cepat.
- Setiap jawaban diperiksa server. Umpan balik dan penjelasan muncul setelah jawaban dikirim.
- Tombol “Soal ini susah” mengelola tanda lewat backend; workbench dewasa menampilkan grup soal, jumlah murid, dan filter. “Sudah dibahas di kelas” hanya menyembunyikan grup pada tampilan saat itu.
- Workbench dewasa untuk bank soal, pembuatan/edit/impor, tinjauan topik, reset kata sandi, akun, pemetaan wali–murid, dan jejak audit sesuai peran backend.
- Tanya Nara tetap berupa placeholder yang belum aktif; tidak ada panggilan AI pada frontend.
- Manifest dan service worker bekerja di subfolder Pages; cache terbatas pada halaman shell dan aset statis, bukan respons API.

## Data dan keamanan

Sumber materi/kurikulum dan metadata topik berada di `src/content/curriculum.ts`. Bank soal yang diizinkan oleh keputusan D-015 tetap berada di repositori sumber, tetapi tidak boleh menjadi bagian dari `out/` atau dikirim sebagai data ke browser murid. `questions.forTopic` mengirim pertanyaan dan pilihan tanpa kunci; `answers.submit` memeriksa jawaban di server. Tidak ada kunci layanan atau data pribadi anak yang boleh masuk ke artefak publik.

Frontend memanggil endpoint GAS pilot yang sudah disetujui untuk proyek ini. Jangan menambahkan secret, konfigurasi pribadi, atau file data murid ke repositori, dan jangan menguji akun pilot saat verifikasi build.

## Sumber kurikulum

CP Fase B umumnya mencakup Kelas III–IV; bab buku resmi Kelas IV memberi konteks materi, bukan pembagian nasional wajib per kelas. Contoh ATP Ruang GTK adalah inspirasi yang dapat disesuaikan. Rujukan terperinci ada di `src/content/curriculum.ts` dan dokumen proyek yang tersimpan di arsip NaraNusa.

## Deployment

Push ke `main` menjalankan workflow GitHub Actions: lint, test, build static export, lalu publish `out/` ke GitHub Pages. Alamat pilot yang direncanakan adalah `https://dfhstores-design.github.io/naranusa/`. Verifikasi deployment hanya memastikan shell statis dan aset termuat; jangan masuk dengan akun pilot saat uji penerbitan.

## Dukung NaraNusa

NaraNusa gratis dan akan tetap gratis untuk semua anak. Kalau aplikasi ini membantu anakmu belajar, kamu bisa mendukung pengembangannya lewat Sociabuzz — sekadar traktir kopi, supaya saya bisa terus menambah soal dan fitur baru.

[Dukung lewat Sociabuzz](https://sociabuzz.com/andri_ndi/tribe)

Tentang pengembang: saya Andri, ayah dari seorang anak Kelas 4. NaraNusa saya buat karena saya ingin anak saya belajar dengan soal-soal yang sesuai bukunya, dengan cara yang menyenangkan.
