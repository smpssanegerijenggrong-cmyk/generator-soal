# SANJARA TKA — AI Online Premium

Versi ini sudah memiliki backend AI serverless di folder `api/` dan siap dijalankan di Vercel.

## Arsitektur

Browser hanya mengirim konfigurasi ujian (mapel, kelas, CP/TP, materi, distribusi bab, level, bentuk soal) ke `POST /api/generate`. API key AI tidak pernah dikirim ke browser. Backend memakai Vercel AI Gateway sehingga satu integrasi dapat merutekan permintaan ke model OpenAI, Anthropic, dan Google.

Pilihan model di aplikasi:

- **Auto Premium** — GPT-6.1 Sol sebagai model utama, lalu Claude Opus 5.5 dan Gemini 3.1 Pro Preview sebagai fallback provider/model.
- **OpenAI GPT-6.1 Sol** — prioritas OpenAI, dengan fallback bila provider gagal.
- **Claude Opus 5.5** — prioritas Anthropic, dengan fallback bila provider gagal.
- **Gemini 3.1 Pro Preview** — prioritas Google, dengan fallback bila provider gagal.
- **Premium** — satu proses generasi terstruktur.
- **Premium Max** — proses generasi lalu audit/revisi oleh model frontier kedua.

> Nama paket langganan konsumen seperti ChatGPT Pro, Claude Pro, atau paket Gemini tidak sama dengan akses API. Aplikasi ini menggunakan model API melalui AI Gateway dan pemakaian API ditagihkan sesuai penggunaan.

## Environment Variables

Buat environment variable berikut di Vercel Project Settings → Environment Variables:

```env
AI_GATEWAY_API_KEY=isi_api_key_gateway_anda
SANJARA_AI_ACCESS_CODE=kode_rahasia_sekolah_opsional
```

`SANJARA_AI_ACCESS_CODE` opsional. Jika diisi, guru harus memasukkan kode yang sama pada kolom **Kode akses sekolah** sebelum melakukan generate AI.

Jangan menaruh `AI_GATEWAY_API_KEY` di `index.html`, `app.js`, GitHub, atau kode frontend.

## Deploy ke Vercel

1. Upload/push seluruh folder proyek ini ke repository GitHub.
2. Import repository tersebut sebagai project Vercel.
3. Tambahkan `AI_GATEWAY_API_KEY` pada environment variable Vercel untuk Production dan Preview sesuai kebutuhan.
4. Opsional: tambahkan `SANJARA_AI_ACCESS_CODE`.
5. Deploy ulang setelah environment variable disimpan.
6. Buka `/api/health`. Respons sehat akan menunjukkan `gatewayConfigured: true` tanpa menampilkan nilai key.
7. Buka aplikasi dan pastikan status **AI online siap** muncul.

## Menjalankan Lokal

Instal dependency:

```bash
npm install
```

Gunakan runtime/development server yang mendukung Vercel Functions. File `preview.html` adalah preview mandiri untuk tampilan dan generator offline; file tersebut tidak dapat menjalankan endpoint AI tanpa server backend.

## Alur Generate Premium

1. Pilih mode/mapel, kelas, semester, dan jenis ujian.
2. Masukkan CP/TP/indikator.
3. Tentukan satu materi atau beberapa bab beserta distribusi jumlah soal.
4. Pilih bentuk soal, taksonomi, jumlah opsi, dan tingkat kesulitan.
5. Pilih **AI Online Premium**.
6. Pilih model dan kualitas.
7. Klik **Generate Premium AI**.
8. Hasil AI langsung menggunakan sistem preview/kisi-kisi/kartu soal/kunci/penskoran/Word/PDF yang sama dengan aplikasi SANJARA.

## Keamanan & Mutu

- API key hanya dibaca oleh backend.
- Output AI dipaksa ke schema terstruktur dan divalidasi lagi oleh frontend.
- PG harus memiliki satu kunci; PG kompleks MCMA lebih dari satu kunci.
- Jumlah soal, nomor, materi, TP, level, dan bentuk mengikuti blueprint yang disiapkan aplikasi.
- Premium Max menggunakan audit model kedua untuk memperbaiki kunci, distraktor, ambiguitas, level kognitif, dan pembahasan.
- Hasil asesmen AI tetap perlu ditinjau guru sebelum dipakai sebagai naskah resmi.

## File Penting

- `index.html` — antarmuka utama.
- `app.js` — state, generator, preview, bank soal, cetak/ekspor, integrasi API.
- `styles.css` — tampilan aplikasi dan naskah.
- `api/generate.js` — endpoint AI online premium.
- `api/health.js` — pemeriksaan konfigurasi backend.
- `vercel.json` — konfigurasi fungsi.
- `.env.example` — contoh environment variable.
