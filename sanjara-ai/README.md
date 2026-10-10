# SANJARA AI — Generator Kartu Soal & Naskah Ujian

Aplikasi web mandiri berbasis satu file HTML. Aplikasi lama **SANJARA TKA** pada root repository sengaja tidak ditimpa.

## Akses

- Sumber aplikasi: `sanjara-ai/index.html`
- Di Vercel dengan konfigurasi static root: buka `/sanjara-ai/index.html` pada domain proyek ini.
- Jalankan lokal: buka `index.html` di browser, lalu gunakan tombol **Coba Demo 5 Soal**.

## Fitur

Tahap 1: kisi-kisi, kartu soal, kunci, dan rubrik. Tahap 2: naskah ujian, LJS, dan kunci guru. Mendukung materi multi-bab, unggah PDF berbasis teks, pengaturan bentuk soal, level kognitif, kop/logo, ekspor Word dan cetak/PDF.

## Mengaktifkan AI

Dari **Pengaturan AI**, gunakan Google Gemini dengan API key pengguna atau masukkan URL backend proxy milik sekolah yang sesuai kontrak API aplikasi ini. API key yang dimasukkan secara langsung digunakan oleh browser dan hanya dipertahankan selama tab terbuka. **Jangan memasukkan API key rahasia ke kode sumber atau commit GitHub publik.**

Backend lama di `/api/generate` milik SANJARA TKA **tidak otomatis kompatibel** dengan mode proxy aplikasi ini; perlu adapter sebelum dapat dipakai bersama. Guru tetap perlu menelaah soal dan kunci dari AI sebelum digunakan dalam ujian.

## Deploy Vercel

Jika repo sudah terhubung dengan proyek Vercel, perubahan branch `main` biasanya memicu build otomatis. Bila belum terhubung, import repo `smpssanegerijenggrong-cmyk/generator-soal` ke Vercel; jangan membuat proyek yang menimpa proyek sekolah lain. Pilih root direktori repository, framework Other/static.
