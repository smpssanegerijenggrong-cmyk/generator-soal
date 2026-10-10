# SANJARA AI — Generator Kartu Soal & Naskah Ujian

Aplikasi baru ini berada di `sanjara-ai/index.html` dan **tidak mengganti** frontend lama `index.html` maupun endpoint lama `/api/generate`.

## Menjalankan di Vercel dari repository ini

Gunakan URL website proyek Vercel yang terhubung ke root repository, lalu buka `/sanjara-ai/index.html`.

Endpoint baru yang dipakai halaman ini:
- `POST /api/sanjara-generate` — memanggil Google Gemini
- `GET /api/sanjara-health` — status apakah API siap

Atur di **Vercel → Project → Settings → Environment Variables**:
- `GEMINI_API_KEY`: kunci API Google Gemini dari Google AI Studio (rahasia)
- `SANJARA_ACCESS_CODE`: kode akses yang hanya diberikan kepada guru

Atur di lingkungan **Production**, kemudian lakukan **Redeploy**. Jangan menaruh nilai kunci di source code GitHub. `ALLOW_PUBLIC_GENERATION=true` bisa menghilangkan kewajiban kode akses, tetapi berisiko menghabiskan kuota Gemini bila situs publik.

## Cara menggunakan

1. Buka `/api/sanjara-health` dari domain yang sama. Pastikan `ready`, `keyConfigured`, dan `accessConfigured` bernilai `true`.
2. Buka `/sanjara-ai/index.html`, klik **Pengaturan AI**.
3. Pilih **Backend Vercel**, gunakan endpoint `/api/sanjara-generate` dan kode yang sama dengan `SANJARA_ACCESS_CODE`; klik **Tes Koneksi Server**.
4. Isi jenjang, kelas, mapel, materi, komposisi soal, lalu klik **Generate Kisi-Kisi & Kartu Soal AI**. Hasil diproses dalam batch sampai 6 soal.
5. Periksa kunci dan indikator secara manual, lalu buat naskah, LJS, serta pedoman penskoran di Tahap 2.

**Mode Demo** berjalan tanpa API key, tetapi contoh soalnya bukan keluaran AI. PDF harus mengandung teks agar dapat dibaca. Jangan unggah materi rahasia atau data pribadi murid tanpa izin.
