import questionBank from "./question-bank.json";

export type SubjectId = "matematika" | "bahasa-indonesia" | "ipas" | "pendidikan-pancasila";

export type CurriculumSource = {
  id: string;
  title: string;
  publisher: string;
  year: string;
  url: string;
  evidence: string;
  note?: string;
};

export type Topic = {
  id: string;
  subjectId: SubjectId;
  title: string;
  chapter: string;
  objective: string;
  sourceIds: string[];
  status: "verified-book" | "phase-context";
};

export type Question = {
  id: string;
  subjectId: SubjectId;
  topicId: string;
  stem: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  sourceIds: string[];
  sourceLocator: string;
  type: "multiple-choice";
  reviewStatus: "needs_teacher_review" | "teacher_approved";
  learnerAvailability: "available" | "hidden";
};

export const curriculumNote =
  "CP Fase B adalah capaian akhir untuk rentang yang umumnya mencakup kelas III–IV, bukan pembagian nasional wajib per kelas. Bab buku resmi Kelas IV menjadi konteks materi kelas IV pada prototipe ini. Contoh ATP pemerintah diperlakukan sebagai inspirasi yang dapat disesuaikan, bukan ketentuan yang harus disalin.";

export const sources: CurriculumSource[] = [
  {
    id: "cp-046-2025",
    title: "Keputusan Kepala BSKAP Nomor 046/H/KR/2025 tentang Capaian Pembelajaran",
    publisher: "BSKAP, Kementerian Pendidikan Dasar dan Menengah",
    year: "2025",
    url: "https://kurikulum.kemendikdasmen.go.id/file/1753929861_manage_file.pdf",
    evidence: "Lampiran CP per mata pelajaran, bagian Fase B (umumnya kelas III dan IV). Digunakan sebagai konteks kompetensi fase, bukan daftar materi khusus kelas IV.",
  },
  {
    id: "ruang-gtk-atp",
    title: "Inspirasi Alur Tujuan Pembelajaran (ATP) Fase B",
    publisher: "Ruang GTK, Kemendikdasmen",
    year: "2026",
    url: "https://guru.kemendikdasmen.go.id/kurikulum/referensi-penerapan/capaian-pembelajaran/sd-sma/",
    evidence: "Portal menandai contoh ATP sebagai inspirasi dan meminta pendidik menyusun ATP sesuai kondisi murid. Pilih mata pelajaran dari menu Fase B.",
    note: "Contoh ATP bukan dokumen nasional yang wajib diikuti; URL adalah laman referensi portal, gunakan menu mapel/Fase B.",
  },
  {
    id: "matematika-bs-2022",
    title: "Matematika untuk SD/MI Kelas IV — Buku Siswa",
    publisher: "Pusat Perbukuan, Kemendikbudristek; katalog resmi SIBI Kemendikdasmen",
    year: "2022",
    url: "https://buku.kemendikdasmen.go.id/katalog/Matematika-untuk-SDMI-Kelas-IV",
    evidence: "Daftar isi hlm. v–vi memuat enam bab. Tujuan Bab 1 pada hlm. 2–3; bab meliputi bilangan sampai 10.000, pecahan, pola, pengukuran, bangun datar, serta piktogram/diagram batang.",
  },
  {
    id: "matematika-bg-2022",
    title: "Panduan Guru Matematika untuk SD/MI Kelas IV",
    publisher: "Pusat Perbukuan, Kemendikbudristek; katalog resmi SIBI Kemendikdasmen",
    year: "2022",
    url: "https://buku.kemendikdasmen.go.id/katalog/Buku-Panduan-Guru-Matematika-untuk-SDMI-Kelas-IV",
    evidence: "Daftar isi dan pemetaan tujuan pembelajaran per bab; hlm. 8–11 memuat pemetaan elemen CP, enam bab dibahas dalam buku.",
  },
  {
    id: "bahasa-bs-2023",
    title: "Bahasa Indonesia: Lihat Sekitar untuk SD/MI Kelas IV (Edisi Revisi) — Buku Siswa",
    publisher: "Pusat Perbukuan, Kemendikbudristek; Repositori Institusi Kemendikdasmen",
    year: "2023",
    url: "https://repositori.kemendikdasmen.go.id/36974/1/Bahasa_Indonesia_BS_KLS_IV_Rev.pdf",
    evidence: "Daftar isi tercetak hlm. vi–vii memuat delapan bab; tujuan belajar per bab tercetak di awal bab, misalnya Bab 4 hlm. 70–71.",
  },
  {
    id: "bahasa-bg-2023",
    title: "Panduan Guru Bahasa Indonesia: Lihat Sekitar untuk SD/MI Kelas IV (Edisi Revisi)",
    publisher: "Pusat Perbukuan, Kemendikbudristek; Repositori Institusi Kemendikdasmen",
    year: "2023",
    url: "https://repositori.kemendikdasmen.go.id/35912/1/Bahasa_Indonesia_BG_KLS_IV_Rev.pdf",
    evidence: "Panduan guru menguraikan capaian, tujuan, kegiatan, asesmen, remedial dan pengayaan pada bab-bab buku siswa.",
  },
  {
    id: "ipas-bs-2023",
    title: "Ilmu Pengetahuan Alam dan Sosial untuk SD/MI Kelas IV (Edisi Revisi) — Buku Siswa",
    publisher: "Pusat Perbukuan, Kemendikbudristek; Repositori Institusi Kemendikdasmen",
    year: "2023",
    url: "https://repositori.kemendikdasmen.go.id/35919/1/IPAS_BS_KLS_IV_Rev.pdf",
    evidence: "Identitas buku mencantumkan edisi revisi 2023; Daftar Isi tercetak hlm. v memuat delapan bab dan subbab.",
  },
  {
    id: "ipas-bg-2023",
    title: "Panduan Guru IPAS untuk SD/MI Kelas IV (Edisi Revisi)",
    publisher: "Pusat Perbukuan, Kemendikbudristek; katalog SIBI dan PDF panduan guru",
    year: "2023",
    url: "https://static-sc.cloudapp.web.id/content/pdf/bukuteks/kurikulum21/IPAS_BG_KLS_IV_Rev.pdf",
    evidence: "Panduan guru memuat delapan bab dan panduan tujuan/pembelajaran. Bab III mengarahkan penggunaan peta untuk menelaah letak geografis dan bentang alam.",
    note: "PDF berada pada host berkas buku; katalog resmi SIBI: https://buku.kemendikdasmen.go.id/katalog/panduan-guru-ilmu-pengetahuan-alam-dan-sosial-untuk-sd-mi-kelas-iv-edisi-revisi.",
  },
  {
    id: "pancasila-bs-catalog",
    title: "Pendidikan Pancasila untuk SD/MI Kelas IV — katalog SIBI",
    publisher: "Pusat Perbukuan, Kemendikdasmen",
    year: "2023",
    url: "https://buku.kemendikdasmen.go.id/katalog/pendidikan-pancasila-untuk-sd-mi-kelas-iv",
    evidence: "Katalog resmi menyediakan entri buku siswa Kelas IV; metadata dinamis pada katalog tidak seluruhnya terpapar saat verifikasi.",
  },
  {
    id: "pancasila-bs-2023",
    title: "Pendidikan Pancasila untuk SD/MI Kelas IV — Buku Siswa (edisi 2023)",
    publisher: "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi (identitas pada PDF)",
    year: "2023",
    url: "https://static-sc.cloudapp.web.id/content/pdf/bukuteks/kurikulum21/Pendidikan-Pancasila-BS-KLS-IV.pdf",
    evidence: "Daftar Isi tercetak hlm. viii–x memuat empat bab dan subbab: lingkungan, disiplin, kerja sama, dan Pancasila.",
    note: "Salinan PDF yang isinya diperiksa berada pada host berkas non-pemerintah; katalog SIBI resmi disertakan terpisah.",
  },
  {
    id: "pancasila-bg-2021",
    title: "Panduan Guru Pendidikan Pancasila untuk SD/MI Kelas IV",
    publisher: "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi (identitas pada PDF)",
    year: "2021",
    url: "https://static-sc.cloudapp.web.id/content/pdf/bukuteks/kurikulum21/Pendidikan-Pancasila-BG-KLS-IV.pdf",
    evidence: "Tabel alur tujuan pembelajaran tercetak hlm. 6; skema pembelajaran mulai hlm. 16 dan memetakan tujuan serta pokok materi.",
    note: "Panduan ini edisi 2021, tidak diperlakukan sebagai pengganti CP 2025.",
  },
  {
    id: "pmm-perangkat-ajar",
    title: "Apa Itu Perangkat Ajar?",
    publisher: "Rumah Pendidikan / Kemendikdasmen",
    year: "2026",
    url: "https://pusatinformasi.rumahpendidikan.kemendikdasmen.go.id/hc/id/articles/52514585828249-Apa-Itu-Perangkat-Ajar",
    evidence: "Perangkat ajar disajikan sebagai referensi/inspirasi yang dapat disesuaikan; kegiatan belajar memuat tujuan, langkah, media, dan strategi asesmen.",
  },
  {
    id: "pmm-pembaruan-2026",
    title: "Pembaruan Fitur Perangkat Ajar di Ruang GTK",
    publisher: "Rumah Pendidikan / Kemendikdasmen",
    year: "2026",
    url: "https://rumah.pendidikan.go.id/artikel/pembaruan-fitur-perangkat-ajar-di-ruang-gtk",
    evidence: "Artikel menjelaskan perubahan nama Modul Ajar menjadi Kegiatan Intrakurikuler dan Modul Projek menjadi Kegiatan Kokurikuler.",
  },
  {
    id: "panduan-asesmen",
    title: "Panduan Pembelajaran dan Asesmen, Jenjang Pendidikan Dasar dan Menengah",
    publisher: "Pusat Asesmen dan Pembelajaran, Kemendikbudristek",
    year: "2021",
    url: "https://repositori.kemendikdasmen.go.id/24921/1/Panduan%20Pembelajaran%20dan%20Asesmen.pdf",
    evidence: "Panduan menekankan asesmen yang terpadu dengan pembelajaran, adil, proporsional, valid, reliabel, serta digunakan untuk umpan balik dan tindak lanjut.",
    note: "Digunakan sebagai prinsip desain, bukan pengganti ketentuan asesmen terbaru.",
  },
];

export const subjects: {
  id: SubjectId;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  tint: string;
  description: string;
  sourceIds: string[];
  objectives: string[];
}[] = [
  {
    id: "matematika",
    name: "Matematika",
    shortName: "MTK",
    icon: "✦",
    color: "#6b56d9",
    tint: "#f1efff",
    description: "Angka, pola, bentuk, dan data",
    sourceIds: ["cp-046-2025", "matematika-bs-2022", "matematika-bg-2022"],
    objectives: [
      "Menggunakan bilangan cacah, nilai tempat, operasi hitung, faktor, dan kelipatan sesuai batas materi di buku.",
      "Membandingkan pecahan dan mengenali pecahan senilai, desimal, serta persen yang dibahas buku.",
      "Membaca pola, mengukur luas/volume, menjelaskan bangun datar, dan menafsirkan data sederhana.",
    ],
  },
  {
    id: "bahasa-indonesia",
    name: "Bahasa Indonesia",
    shortName: "B. Indo",
    icon: "❝",
    color: "#ec765f",
    tint: "#fff1ec",
    description: "Membaca, berbicara, dan menulis",
    sourceIds: ["cp-046-2025", "bahasa-bs-2023", "bahasa-bg-2023"],
    objectives: [
      "Memahami informasi, kosakata, ide pokok, dan pesan sesuai teks atau simakan yang dipakai.",
      "Menyampaikan pendapat dan berdiskusi dengan jelas serta santun sesuai tujuan bab.",
      "Mengenali atau menulis ragam teks dan kaidah bahasa yang memang tercantum pada bab terkait.",
    ],
  },
  {
    id: "ipas",
    name: "IPAS",
    shortName: "IPAS",
    icon: "✿",
    color: "#249d87",
    tint: "#e9f8f3",
    description: "Sains dan kehidupan sekitar",
    sourceIds: ["cp-046-2025", "ipas-bs-2023", "ipas-bg-2023"],
    objectives: [
      "Mengamati perubahan energi, gaya, peta, iklim, lingkungan, sumber daya, dan masyarakat sesuai bab buku.",
      "Melatih keterampilan proses Fase B: mengamati, bertanya, memprediksi, menyelidiki, mengolah informasi, dan mengomunikasikan hasil.",
    ],
  },
  {
    id: "pendidikan-pancasila",
    name: "Pendidikan Pancasila",
    shortName: "P. Pancasila",
    icon: "♡",
    color: "#e4a62b",
    tint: "#fff7e5",
    description: "Nilai, aturan, dan hidup bersama",
    sourceIds: ["cp-046-2025", "pancasila-bs-catalog", "pancasila-bs-2023", "pancasila-bg-2021"],
    objectives: [
      "Mengenali makna dan pengamalan sila-sila Pancasila dalam kehidupan sehari-hari.",
      "Mengenali aturan, hak, dan kewajiban di keluarga, sekolah, serta lingkungan sekitar.",
      "Menghargai identitas dan keberagaman serta bekerja sama dalam lingkungan yang beragam.",
    ],
  },
];

export const topics: Topic[] = [
  {
    id: "mtk-bilangan",
    subjectId: "matematika",
    title: "Bilangan sampai 10.000",
    chapter: "Bab 1 · Bilangan Cacah sampai 10.000",
    objective: "Membaca, membandingkan, mengurutkan, menyusun, dan mengurai bilangan serta menggunakan nilai tempat.",
    sourceIds: ["matematika-bs-2022", "matematika-bg-2022", "cp-046-2025"],
    status: "verified-book",
  },
  {
    id: "mtk-pecahan",
    subjectId: "matematika",
    title: "Pecahan dan desimal",
    chapter: "Bab 2 · Pecahan",
    objective: "Mengenali pecahan berpembilang satu/berpenyebut sama, pecahan senilai, desimal, dan persen sebagaimana tercantum di buku.",
    sourceIds: ["matematika-bs-2022", "matematika-bg-2022"],
    status: "verified-book",
  },
  {
    id: "mtk-pola",
    subjectId: "matematika",
    title: "Pola gambar dan bilangan",
    chapter: "Bab 3 · Pola Gambar dan Pola Bilangan",
    objective: "Mengidentifikasi dan mengembangkan pola gambar atau bilangan yang membesar/mengecil.",
    sourceIds: ["matematika-bs-2022", "matematika-bg-2022"],
    status: "verified-book",
  },
  {
    id: "mtk-pengukuran",
    subjectId: "matematika",
    title: "Luas dan volume",
    chapter: "Bab 4 · Pengukuran Luas dan Volume",
    objective: "Mengukur atau mengestimasi luas dan volume menggunakan satuan yang dibahas buku.",
    sourceIds: ["matematika-bs-2022", "matematika-bg-2022"],
    status: "verified-book",
  },
  {
    id: "mtk-bangun-datar",
    subjectId: "matematika",
    title: "Bangun datar",
    chapter: "Bab 5 · Bangun Datar",
    objective: "Mendeskripsikan ciri bangun datar serta menyusun dan mengurai bentuk.",
    sourceIds: ["matematika-bs-2022", "matematika-bg-2022", "cp-046-2025"],
    status: "verified-book",
  },
  {
    id: "mtk-data",
    subjectId: "matematika",
    title: "Piktogram dan diagram batang",
    chapter: "Bab 6 · Piktogram dan Diagram Batang",
    objective: "Menyajikan dan menafsirkan data dalam piktogram atau diagram batang.",
    sourceIds: ["matematika-bs-2022", "matematika-bg-2022", "cp-046-2025"],
    status: "verified-book",
  },
  {
    id: "indo-sudah-besar",
    subjectId: "bahasa-indonesia",
    title: "Sudah Besar",
    chapter: "Bab 1",
    objective: "Memaknai teks narasi dan kosakata baru; mengenali perubahan diri serta kaidah bahasa yang dibahas pada bab.",
    sourceIds: ["bahasa-bs-2023", "bahasa-bg-2023"],
    status: "verified-book",
  },
  {
    id: "indo-di-bawah-atap",
    subjectId: "bahasa-indonesia",
    title: "Di Bawah Atap",
    chapter: "Bab 2",
    objective: "Memahami ide pokok teks yang dibacakan, membaca kata baru, dan menceritakan kembali informasi.",
    sourceIds: ["bahasa-bs-2023", "bahasa-bg-2023"],
    status: "verified-book",
  },
  {
    id: "indo-lihat-sekitar",
    subjectId: "bahasa-indonesia",
    title: "Lihat Sekitar",
    chapter: "Bab 3",
    objective: "Memahami instruksi, berpartisipasi dalam diskusi, serta mengenali teks argumentasi/deskripsi sesuai tujuan bab.",
    sourceIds: ["bahasa-bs-2023", "bahasa-bg-2023"],
    status: "verified-book",
  },
  {
    id: "indo-meliuk",
    subjectId: "bahasa-indonesia",
    title: "Meliuk dan Menerjang",
    chapter: "Bab 4",
    objective: "Menemukan ide pokok dan informasi pendukung, melakukan wawancara, serta mengenali kalimat persuasif.",
    sourceIds: ["bahasa-bs-2023", "bahasa-bg-2023"],
    status: "verified-book",
  },
  {
    id: "indo-bertukar",
    subjectId: "bahasa-indonesia",
    title: "Bertukar dan Membayar",
    chapter: "Bab 5",
    objective: "Memahami pesan teks dan menulis teks prosedur; tema bab mencakup barter, uang, fabel, dan menabung.",
    sourceIds: ["bahasa-bs-2023", "bahasa-bg-2023"],
    status: "verified-book",
  },
  {
    id: "indo-satu-titik",
    subjectId: "bahasa-indonesia",
    title: "Satu Titik",
    chapter: "Bab 6",
    objective: "Memahami maksud puisi dan teks narasi serta menggunakan pilihan/susunan kata dengan cermat.",
    sourceIds: ["bahasa-bs-2023", "bahasa-bg-2023"],
    status: "verified-book",
  },
  {
    id: "indo-asal-usul",
    subjectId: "bahasa-indonesia",
    title: "Asal-Usul",
    chapter: "Bab 7",
    objective: "Memahami teks audio/narasi dan menggunakan kata penghubung antarkalimat sebagaimana tercantum dalam bab.",
    sourceIds: ["bahasa-bs-2023", "bahasa-bg-2023"],
    status: "verified-book",
  },
  {
    id: "indo-sehatlah",
    subjectId: "bahasa-indonesia",
    title: "Sehatlah Ragaku",
    chapter: "Bab 8",
    objective: "Memahami ide pokok/informasi pada teks dan membedakan fakta dengan opini sesuai materi bab.",
    sourceIds: ["bahasa-bs-2023", "bahasa-bg-2023"],
    status: "verified-book",
  },
  {
    id: "ipas-energi",
    subjectId: "ipas",
    title: "Mengubah bentuk energi",
    chapter: "Bab I · Mengubah Bentuk Energi",
    objective: "Mengenali perubahan energi di sekitar serta fotosintesis sebagaimana dibahas pada buku.",
    sourceIds: ["ipas-bs-2023", "ipas-bg-2023", "cp-046-2025"],
    status: "verified-book",
  },
  {
    id: "ipas-gaya",
    subjectId: "ipas",
    title: "Gaya di sekitar kita",
    chapter: "Bab II · Gaya di Sekitar Kita",
    objective: "Mengenali gaya serta menyelidiki gaya gesek dan gaya magnet melalui contoh/pengamatan.",
    sourceIds: ["ipas-bs-2023", "ipas-bg-2023", "cp-046-2025"],
    status: "verified-book",
  },
  {
    id: "ipas-peta",
    subjectId: "ipas",
    title: "Peta dan tempat tinggalku",
    chapter: "Bab III · Di Sini Tempat Tinggalku!",
    objective: "Menggunakan peta untuk memperoleh informasi tentang letak dan bentang alam daerah.",
    sourceIds: ["ipas-bs-2023", "ipas-bg-2023", "cp-046-2025"],
    status: "verified-book",
  },
  {
    id: "ipas-iklim",
    subjectId: "ipas",
    title: "Iklim dan perubahannya",
    chapter: "Bab IV · Iklim dan Perubahannya",
    objective: "Mengenali musim/iklim, efek rumah kaca, dan gas karbon sebagaimana dibahas pada bab.",
    sourceIds: ["ipas-bs-2023", "ipas-bg-2023", "cp-046-2025"],
    status: "verified-book",
  },
  {
    id: "ipas-daerah",
    subjectId: "ipas",
    title: "Ini khas daerahku",
    chapter: "Bab V · Ini Khas Daerahku!",
    objective: "Mengenali keanekaragaman hayati, sumber daya, dan kehidupan masyarakat daerah.",
    sourceIds: ["ipas-bs-2023", "ipas-bg-2023", "cp-046-2025"],
    status: "verified-book",
  },
  {
    id: "ipas-peran",
    subjectId: "ipas",
    title: "Peranku di lingkungan",
    chapter: "Bab VI · Peranku di Lingkungan Sekolah dan Masyarakat",
    objective: "Mengenali peran/tugas, aturan/tanggung jawab, dan interaksi sosial di sekitar.",
    sourceIds: ["ipas-bs-2023", "ipas-bg-2023", "cp-046-2025"],
    status: "verified-book",
  },
  {
    id: "ipas-budaya",
    subjectId: "ipas",
    title: "Keragaman budaya dan kearifan lokal",
    chapter: "Bab VII · Keragaman Budaya dan Kearifan Lokal",
    objective: "Mengenali kearifan lokal, tradisi/budaya setempat, dan sikap menghargai keberagaman.",
    sourceIds: ["ipas-bs-2023", "ipas-bg-2023", "cp-046-2025"],
    status: "verified-book",
  },
  {
    id: "ipas-pahlawan-lingkungan",
    subjectId: "ipas",
    title: "Menjadi pahlawan lingkungan",
    chapter: "Bab VIII · Menjadi Pahlawan Lingkungan",
    objective: "Mengenali ancaman lingkungan dan upaya mengurangi jejak karbon/pelestarian yang dibahas di buku.",
    sourceIds: ["ipas-bs-2023", "ipas-bg-2023", "cp-046-2025"],
    status: "verified-book",
  },
  {
    id: "pancasila-lingkungan",
    subjectId: "pendidikan-pancasila",
    title: "Mengenal lingkungan sekitar",
    chapter: "Bab 1",
    objective: "Mengenali identitas masyarakat, menghargai perbedaan, dan memahami lingkungan tempat tinggal.",
    sourceIds: ["pancasila-bs-catalog", "pancasila-bs-2023", "pancasila-bg-2021", "cp-046-2025"],
    status: "verified-book",
  },
  {
    id: "pancasila-disiplin",
    subjectId: "pendidikan-pancasila",
    title: "Aku anak yang disiplin",
    chapter: "Bab 2",
    objective: "Mengenali aturan di lingkungan sekitar, serta hak dan kewajiban.",
    sourceIds: ["pancasila-bs-catalog", "pancasila-bs-2023", "pancasila-bg-2021", "cp-046-2025"],
    status: "verified-book",
  },
  {
    id: "pancasila-kerjasama",
    subjectId: "pendidikan-pancasila",
    title: "Kerja sama di lingkunganku",
    chapter: "Bab 3",
    objective: "Mengenali keberagaman, gotong royong, persatuan, dan Bahasa Indonesia sebagai bahasa persatuan.",
    sourceIds: ["pancasila-bs-catalog", "pancasila-bs-2023", "pancasila-bg-2021", "cp-046-2025"],
    status: "verified-book",
  },
  {
    id: "pancasila-diri",
    subjectId: "pendidikan-pancasila",
    title: "Pancasila dalam diriku",
    chapter: "Bab 4",
    objective: "Mengenali makna dan pengamalan sila-sila Pancasila serta karakter para perumus sesuai batas CP Fase B.",
    sourceIds: ["pancasila-bs-catalog", "pancasila-bs-2023", "pancasila-bg-2021", "cp-046-2025"],
    status: "verified-book",
  },
];

export const questions: Question[] = questionBank as unknown as Question[];

export const subjectById = (id: SubjectId) => subjects.find((subject) => subject.id === id)!;
export const topicById = (id: string) => topics.find((topic) => topic.id === id)!;
export const sourcesByIds = (ids: string[]) => sources.filter((source) => ids.includes(source.id));
