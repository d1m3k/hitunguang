# HitungUang — Versi Lengkap (contoh/demo statis)

Situs **Kalkulator Finansial Indonesia** versi lengkap dalam bentuk statis murni
(HTML/CSS/JS, tanpa build step), dibuat sebagai contoh yang akan tayang di
GitHub Pages repo `d1m3k/hitunguang` → https://d1m3k.github.io/hitunguang/

Semua perhitungan berjalan 100% client-side di browser pengunjung.
Semua tautan internal relatif, sehingga situs bekerja di subpath project Pages
(`/hitunguang/`). Setelah versi ini di-ACC, produksi akan dibangun ulang
dengan pola biasa (Astro + Cloudflare + GitHub).

## Cara menjalankan lokal

- Buka `index.html` langsung di browser, atau:
- `python3 -m http.server` dari folder ini, lalu buka `http://localhost:8000/`

## Struktur & inventaris halaman (24 URL di sitemap)

- `index.html` — beranda: hub 16 kalkulator dalam 5 kategori (Kredit & Pinjaman,
  Gaji & Kerja, Pajak & Zakat, Tabungan & Investasi, Perencanaan), seksi panduan,
  kenapa HitungUang, cara kerja, FAQ ringkas, JSON-LD WebApplication + FAQPage.
- `kalkulator/` — 16 kalkulator, masing-masing: formulir berfungsi, hasil dengan
  rincian, contoh hitungan, penjelasan rumus, 3 FAQ, disclaimer:
  1. `kpr.html` — cicilan KPR anuitas + tabel amortisasi 12 bulan pertama
  2. `cicilan.html` — kredit umum, metode anuitas/flat
  3. `kredit-kendaraan.html` — kredit kendaraan bunga flat + biaya admin/provisi
  4. `gaji-bersih.html` — PPh 21 (metode disetahunkan) + BPJS, per status PTKP
  5. `bpjs.html` — rincian iuran karyawan vs perusahaan
  6. `lembur.html` — upah lembur Kepmenakertrans 102/2004
  7. `thr.html` — THR proporsional Permenaker 6/2016
  8. `pesangon.html` — UP + UPMK tabel PP 35/2021 Pasal 40, pengali alasan PHK
  9. `zakat.html` — zakat penghasilan, nisab BAZNAS 2026 (kolom nisab editable)
  10. `zakat-mal.html` — zakat harta, nisab 85 gram emas (harga emas editable)
  11. `deposito.html` — bunga deposito setelah PPh final 20%
  12. `bunga-majemuk.html` — pertumbuhan modal + setoran rutin, tabel tahunan
  13. `dana-darurat.html` — target 3/6/9/12 bulan pengeluaran
  14. `tujuan-keuangan.html` — solver setoran bulanan untuk target dana
  15. `dana-pendidikan.html` — biaya masa depan dengan inflasi pendidikan
  16. `dana-pensiun.html` — kebutuhan pensiun pendekatan 25× + setoran bulanan
- `panduan/` — 3 artikel orisinal (±660–690 kata):
  `cara-menghitung-cicilan-kpr.html`, `gaji-bersih-pph21-bpjs-dijelaskan.html`,
  `dana-darurat-berapa-bulan.html`
- Halaman pendukung: `tentang.html` (metodologi + sumber + disclaimer),
  `privasi.html`, `disclaimer.html` (ketentuan penggunaan), `kontak.html`.
- `assets/style.css` — tema "buku kas/ledger": hijau tua `#0E3B2E`, kertas krem
  `#FAF6EC`, aksen emas `#C9A227`, Fraunces + Inter, garis ruled, hard shadow.
- `assets/app.js` — helper format Rupiah (Intl id-ID) + logika 16 kalkulator.
- `sitemap.xml` (URL absolut `https://d1m3k.github.io/hitunguang/…`, 24 URL),
  `robots.txt` (allow all + baris Sitemap), `.nojekyll` (kosong).

**Catatan placeholder:** alamat email di `kontak.html` (`halo@hitunguang`)
adalah contoh/placeholder versi demo — dinyatakan sebagai placeholder di
halaman itu sendiri — dan formulir kontaknya adalah contoh UI yang tidak
mengirim apa pun.

## Konstanta & sumber (diverifikasi 2026-11-06)

| Topik | Konstanta yang dipakai | Sumber |
|---|---|---|
| PTKP | Rp54.000.000/thn; +Rp4.500.000 kawin; +Rp4.500.000/tanggungan (maks 3) | Ketentuan PTKP yang berlaku |
| Biaya jabatan | 5% dari bruto, maks Rp6.000.000/thn | Ketentuan perpajakan yang berlaku |
| Tarif PPh | 5% ≤60jt; 15% 60–250jt; 25% 250–500jt; 30% 500jt–5M; 35% >5M; PKP dibulatkan ke bawah ke ribuan | UU HPP |
| PPh bulanan resmi | Jan–Nov memakai TER, rekonsiliasi Desember — kalkulator memakai metode disetahunkan dan melabelinya sebagai estimasi | PP 58/2023 |
| BPJS Kesehatan | karyawan 1%, perusahaan 4%, basis upah maks Rp12.000.000 | Ketentuan BPJS Kesehatan |
| BPJS JHT | karyawan 2%, perusahaan 3,7%, tanpa batas | Ketentuan BPJS Ketenagakerjaan |
| BPJS JP | karyawan 1%, perusahaan 2%, basis maks Rp11.086.300 | Berlaku sejak Maret 2026 |
| BPJS JKK / JKM | JKK 0,24% (asumsi risiko terendah; rentang nyata 0,24%–1,74%), JKM 0,3% — keduanya perusahaan | Ketentuan BPJS Ketenagakerjaan |
| THR | ≥12 bln = 1× upah; 1–<12 bln = masa kerja/12 × upah; <1 bln belum berhak | Permenaker 6/2016 |
| Nisab zakat penghasilan | Rp7.640.144/bln (Rp91.681.728/thn, 85 gram emas); kadar 2,5% | SK Ketua BAZNAS 15/2026 |
| Zakat mal | nisab 85 gram × harga emas/gram (input editable); kadar 2,5%; syarat haul disebut di halaman | Kaidah zakat mal |
| Deposito | bunga bruto = pokok × tarif × bulan/12; PPh final 20% dari bunga; total simpanan ≤ Rp7.500.000 → pajak 0 | PP 131/2000 jo. PP 123/2015 |
| Lembur | upah sejam = 1/173 × upah; hari kerja 1,5× lalu 2×; libur 5-hari 2×/3×/4× (8 jam, jam ke-9, jam ke-10–11); libur 6-hari 2×/3×/4× (7 jam, jam ke-8, jam ke-9–10) | Kepmenakertrans 102/2004 |
| Pesangon | UP: <1th 1 bln, +1/thn, ≥8th 9 bln. UPMK: <3th 0; 3–<6: 2; 6–<9: 3; 9–<12: 4; 12–<15: 5; 15–<18: 6; 18–<21: 7; 21–<24: 8; ≥24: 10 bln. Pengali alasan PHK dipilih user (0,5/1/2/kustom) | PP 35/2021 Pasal 40 — **caveat: regulasi pesangon sedang berubah (UU baru 2026, aturan pelaksana belum terbit); hasil estimasi dasar, belum termasuk UPH, bukan kepastian hukum** |
| Dana pensiun | target = pengeluaran tahun pertama pensiun × 25 — **dilabeli jelas sebagai pendekatan rule-of-thumb (aturan 4%), bukan standar resmi** | Literatur perencanaan keuangan |

## Hasil tes (Node, menjalankan fungsi asli di `assets/app.js` dengan stub DOM)

Semua 22 pemeriksaan **PASS**. Angka kunci:

| Tes | Hasil |
|---|---|
| KPR anuitas: pinjaman Rp400.000.000, 7%/thn, 20 thn | cicilan **Rp3.101.196/bln** (lihat catatan di bawah); sisa setelah bln ke-12 Rp390.484.200 |
| Gaji bersih: bruto Rp10.000.000, TK/0, ikut BPJS | bersih **Rp9.365.000**; PPh Rp235.000/bln; BPJS karyawan Rp400.000 |
| THR: 6 bulan × upah Rp6.000.000 | **Rp3.000.000** |
| Zakat penghasilan: Rp10.000.000 | **Rp250.000** |
| Deposito: Rp100.000.000, 5,5%, 12 bln | bruto **Rp5.500.000**, pajak **Rp1.100.000**, bersih Rp4.400.000, total Rp104.400.000 |
| Lembur hari kerja: upah Rp6.000.000, 3 jam | sejam mentah **34.682,08** (= 6.000.000/173), total mentah **190.751,45** → tampil **Rp190.751** |
| Pesangon: upah Rp8.000.000, 8 thn, pengali 1 | UP **Rp72.000.000**, UPMK **Rp24.000.000**, total **Rp96.000.000** |
| BPJS: upah Rp10.000.000 | karyawan **Rp400.000** (100rb+200rb+100rb); perusahaan Rp1.024.000 |
| Tujuan keuangan: target Rp100.000.000, 5 thn, return 0%, modal 0 | setoran **Rp1.666.667/bln** |
| Cek tambahan | bunga majemuk contoh Rp182.073.314; zakat mal contoh Rp4.375.000; dana darurat contoh target Rp30.000.000; kredit kendaraan contoh Rp6.888.889/bln; dana pendidikan contoh setoran Rp1.155.088/bln; dana pensiun contoh setoran Rp4.582.907/bln; cicilan anuitas Rp50jt/12%/12bln Rp4.442.439/bln |

Pemeriksaan struktur: seluruh 28 berkas yang dilayani HTTP lokal membalas 200;
tidak ada tautan `href="/…"`/`src="/…"` absolut; semua tautan relatif ter-resolve
ke berkas yang ada; semua ID tombol/hasil kalkulator terhubung di `app.js`.

**Catatan selisih kecil dari angka acuan awal:** rumus anuitas standar untuk
pinjaman Rp400 juta/7%/20 tahun menghasilkan Rp3.101.196, bukan ±Rp3.100.177
(selisih ±0,03%, kemungkinan varian pembulatan/effective rate pada acuan).
Situs dan contoh hitungannya memakai angka hasil rumus standar yang konsisten
satu sama lain. Hal yang sama pada lembur: 6.000.000/173 = 34.682,08 pada dua
desimal (acuan menulis 34.682,09).

## Penyederhanaan & caveat yang disengaja

- Gaji bersih memakai metode disetahunkan, bukan tabel TER bulanan — dilabeli
  jelas di halaman sebagai estimasi; total setahun kurang lebih sama.
- JKK memakai 0,24% (risiko terendah) sebagai asumsi yang ditampilkan terbuka.
- Pengali pesangon dipilih sendiri oleh user; halaman memberi peringatan
  menonjol soal UPH, alasan PHK, dan perubahan regulasi.
- Kredit kendaraan/KPR tidak memasukkan asuransi dan biaya pihak ketiga kecuali
  user memasukkannya ke kolom biaya (kendaraan).
- Dana pensiun memakai pendekatan 25× yang dilabeli rule-of-thumb; dana darurat
  memakai asumsi return 0% yang dinyatakan di halaman.
- Setoran pada solver (tujuan/pendidikan/pensiun/bunga majemuk) diasumsikan di
  akhir setiap bulan, return tetap — bukan janji hasil investasi.
