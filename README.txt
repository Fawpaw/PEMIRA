# PEMIRA — Figma Voting Bridge

Tujuan:
- Tampilan 100% prototype Figma.
- Link khusus: ?dev=1, ?dev=2, ?dev=3.
- Tidak ada overlay HTML di atas desain.
- Embed API Figma mengirim event klik prototype ke wrapper.
- Wrapper mengirim Dev + Paslon ke Google Apps Script.
- Sheets menyimpan satu baris terakhir untuk setiap Dev.

## 1. Buat Apps Script

Buat project Apps Script yang terhubung ke Google Sheet tujuan.
Paste `Code.gs`.

Deploy:
Deploy > New deployment > Web app
Execute as: Me
Who has access: Anyone

Copy URL `/exec` ke `CONFIG.API_URL`.

## 2. Figma Embed API

Ini WAJIB. Prototype event hanya dikirim jika Embed API dikonfigurasi.

Di Figma buat OAuth app:
- ambil Client ID
- aktifkan Embed API
- tambahkan "Embed origin" yang sama dengan domain tempat `index.html` di-host.

Isi:
CONFIG.FIGMA_CLIENT_ID

Catatan: `file://` lokal bukan setup yang cocok untuk Embed API. Host index.html di GitHub Pages, Netlify, Cloudflare Pages, atau hosting HTTPS lain.

## 3. Link Dev

Setelah di-host:
- /?dev=1
- /?dev=2
- /?dev=3

Berikan masing-masing link hanya ke perangkat Dev yang sesuai.

## 4. Tentang node ID

Yang sudah diketahui dari file Figma:
- Paslon 1: tombol 133:1031
- Paslon 2: tombol 133:933
- Paslon 3: tombol 133:982

Wrapper juga mencetak semua event Figma ke DevTools Console.
Kalau event klik ternyata mengembalikan ID text-child, tambahkan ID tersebut ke `VOTE_TEXT_NODES`.

## 5. Penting

Jangan pasang overlay merah lagi.
Jangan ubah posisi tombol.
Figma yang menangani klik dan perpindahan halaman.
Wrapper hanya menerima event resmi dari Figma Embed API dan menyimpan vote.
