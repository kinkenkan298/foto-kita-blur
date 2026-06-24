# Foto Kita Blur

Foto Kita Blur adalah eksperimen photobox web sederhana. Aplikasi membuka kamera, menampilkan frame foto pastel, lalu mendeteksi gestur tangan dengan MediaPipe Tasks Vision.

Jika kamera melihat gestur peace sign (✌️), preview foto otomatis berubah blur. Jika gestur hilang, preview kembali normal.

## Fitur

- Live camera preview di browser
- Deteksi tangan dengan MediaPipe Hand Landmarker
- Efek blur otomatis saat peace sign terdeteksi
- UI photobox pastel pink
- Berjalan lokal dengan Vite + React + TanStack Start

## Cara menjalankan

Install dependency:

```bash
bun install
```

Jalankan development server:

```bash
bun run dev
```

Buka:

```text
http://localhost:3000
```

Izinkan akses kamera saat browser meminta permission.

## Cara menggunakan

1. Buka aplikasi di browser.
2. Pastikan kamera aktif.
3. Arahkan wajah/tangan ke frame foto.
4. Tunjukkan gestur peace sign (✌️).
5. Frame akan berubah blur selama gestur terdeteksi.
6. Turunkan tangan atau ubah gestur untuk kembali normal.

## Build production

```bash
bun run build
```

## Test

```bash
bun run test
```

## Catatan

Deteksi peace sign masih MVP: memakai heuristic sederhana dari posisi landmark jari. Jika akurasi perlu lebih kuat untuk banyak pose tangan, upgrade ke classifier berbasis sudut jari.
