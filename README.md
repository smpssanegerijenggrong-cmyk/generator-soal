# SANJARA TKA — Generator Soal Ujian AI Premium

Generator asesmen SMP SSA Negeri Jenggrong Ranuyoso untuk membuat paket TKA dan ujian sekolah yang rapi, terstruktur, serta siap cetak.

## Fitur utama

- AI Online Premium melalui backend serverless + AI Gateway.
- Pilihan OpenAI GPT, Claude, Gemini, Auto Premium, serta Premium Max (generate + audit model kedua).
- Generator offline sebagai fallback/preview.
- Mapel sekolah, kelas VII–IX, semester, fase, dan jenis ujian (TKA/STS/ASAS/ASAT/US/Try Out/Harian/Custom).
- Satu materi atau multi-bab dengan distribusi jumlah soal untuk ujian satu semester.
- CP/TP/indikator custom.
- PG, PG kompleks MCMA, PG kompleks kategori, isian singkat, dan uraian.
- Level TKA, Bloom, dan SOLO.
- Kisi-kisi, kartu soal, naskah soal, kunci, pembahasan, pedoman penskoran, serta prompt ilustrasi.
- Kop sekolah default atau upload kop custom.
- Cetak/PDF, export Word, CSV, JSON, copy naskah, dan bank soal lokal.
- Perpustakaan paket untuk mapel/kelas/jenis ujian berbeda.

## Menjalankan versi preview

Buka `preview.html`. Preview mandiri dapat menjalankan fitur antarmuka dan mode **Offline Template**, tetapi AI online membutuhkan deployment/backend.

## Menjalankan versi online

Lihat **ONLINE-SETUP.md**. Backend AI berada di `api/generate.js`; key disimpan sebagai environment variable server, bukan di browser.

## Catatan

Output AI harus ditelaah guru sebelum digunakan sebagai naskah ujian resmi, terutama untuk ketepatan konten mata pelajaran, kebijakan kurikulum sekolah, dan konteks lokal.
