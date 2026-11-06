/* HitungUang — semua perhitungan berjalan 100% di browser pengunjung. */
'use strict';
var rpFmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
function rp(n) { if (!isFinite(n)) return '—'; return rpFmt.format(Math.round(n)); }
function num(n) { if (!isFinite(n)) return '—'; return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Math.round(n)); }
function parseAngka(v) {
  if (typeof v === 'number') return v;
  if (!v) return 0;
  var s = String(v).trim().replace(/[^\d,.\-]/g, '');
  // format Indonesia: titik = ribuan, koma = desimal
  if (s.indexOf(',') >= 0) { s = s.replace(/\./g, '').replace(',', '.'); }
  var n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}
function val(id) { var el = document.getElementById(id); return el ? parseAngka(el.value) : 0; }
function str(id) { var el = document.getElementById(id); return el ? el.value : ''; }
function on(idList, ev, fn) { idList.forEach(function (id) { var el = document.getElementById(id); if (el) el.addEventListener(ev, fn); }); }
function hitungAnuitas(pokok, bungaTahunanPersen, jumlahBulan) {
  var r = bungaTahunanPersen / 100 / 12;
  if (r === 0) return pokok / jumlahBulan;
  var f = Math.pow(1 + r, jumlahBulan);
  return pokok * r * f / (f - 1);
}
function row(label, value, cls) {
  return '<div class="row' + (cls ? ' ' + cls : '') + '"><dt>' + label + '</dt><dd>' + value + '</dd></div>';
}
function initOnLoad(ids, btnId, fn) {
  if (!document.getElementById(btnId) && !document.getElementById(ids[0])) return false;
  var b = document.getElementById(btnId); if (b) b.addEventListener('click', fn);
  on(ids, 'input', fn); on(ids, 'change', fn); fn(); return true;
}

/* ---------- KPR ---------- */
function hitungKPR() {
  var harga = val('kpr-harga'), dp = val('kpr-dp'), bunga = val('kpr-bunga'), tenorTh = val('kpr-tenor');
  var out = document.getElementById('kpr-hasil'); if (!out) return;
  var pinjaman = Math.max(harga - dp, 0), n = Math.round(tenorTh * 12);
  if (pinjaman <= 0 || n <= 0) { out.innerHTML = '<p>Masukkan harga rumah yang lebih besar dari uang muka dan tenor di atas 0.</p>'; return; }
  var cicilan = hitungAnuitas(pinjaman, bunga, n);
  var totalBayar = cicilan * n, totalBunga = totalBayar - pinjaman;
  var html = '<h2>Hasil perhitungan</h2><p style="margin:0">Cicilan per bulan</p><p class="big">' + rp(cicilan) + '</p>' +
    '<dl class="rincian">' +
    row('Jumlah pinjaman (harga − uang muka)', rp(pinjaman)) +
    row('Uang muka', rp(dp)) +
    row('Total bunga selama ' + tenorTh + ' tahun', rp(totalBunga)) +
    row('Total pembayaran pinjaman', rp(totalBayar)) +
    row('Total keseluruhan (uang muka + pinjaman)', rp(dp + totalBayar), 'total') + '</dl>';
  out.innerHTML = html;
  var tb = document.getElementById('kpr-tabel-body');
  if (tb) {
    var r = bunga / 100 / 12, sisa = pinjaman, rows = '';
    for (var i = 1; i <= Math.min(12, n); i++) {
      var bBulan = sisa * r, pokok = cicilan - bBulan; sisa -= pokok;
      rows += '<tr><td>' + i + '</td><td>' + rp(cicilan) + '</td><td>' + rp(bBulan) + '</td><td>' + rp(pokok) + '</td><td>' + rp(Math.max(sisa, 0)) + '</td></tr>';
    }
    tb.innerHTML = rows;
  }
}

/* ---------- Cicilan umum ---------- */
function hitungCicilan() {
  var P = val('cic-pinjaman'), bunga = val('cic-bunga'), n = Math.round(val('cic-tenor'));
  var metode = str('cic-metode') || 'anuitas';
  var out = document.getElementById('cic-hasil'); if (!out) return;
  if (P <= 0 || n <= 0) { out.innerHTML = '<p>Masukkan jumlah pinjaman dan tenor di atas 0.</p>'; return; }
  var cicilan, totalBunga;
  if (metode === 'flat') {
    totalBunga = P * (bunga / 100) * (n / 12);
    cicilan = (P + totalBunga) / n;
  } else {
    cicilan = hitungAnuitas(P, bunga, n);
    totalBunga = cicilan * n - P;
  }
  out.innerHTML = '<h2>Hasil perhitungan</h2><p style="margin:0">Cicilan per bulan (' + (metode === 'flat' ? 'metode flat' : 'metode anuitas') + ')</p><p class="big">' + rp(cicilan) + '</p>' +
    '<dl class="rincian">' + row('Jumlah pinjaman', rp(P)) + row('Total bunga', rp(totalBunga)) +
    row('Total pembayaran', rp(P + totalBunga), 'total') + '</dl>' +
    '<p style="font-size:.9rem">Pada metode flat, bunga dihitung selalu dari pinjaman awal sehingga total bunga biasanya lebih besar daripada anuitas dengan suku bunga yang sama.</p>';
}

/* ---------- Gaji bersih ---------- */
var PTKP_STATUS = {
  'TK/0': [0, 0], 'TK/1': [0, 1], 'TK/2': [0, 2], 'TK/3': [0, 3],
  'K/0': [1, 0], 'K/1': [1, 1], 'K/2': [1, 2], 'K/3': [1, 3]
};
function ptkp(status) {
  var s = PTKP_STATUS[status] || [0, 0];
  return 54000000 + (s[0] ? 4500000 : 0) + Math.min(s[1], 3) * 4500000;
}
function pphTahunan(pkp) {
  var lapis = [[60000000, .05], [250000000, .15], [500000000, .25], [5000000000, .30], [Infinity, .35]];
  var pajak = 0, bawah = 0;
  for (var i = 0; i < lapis.length && pkp > bawah; i++) {
    var kena = Math.min(pkp, lapis[i][0]) - bawah;
    if (kena > 0) pajak += kena * lapis[i][1];
    bawah = lapis[i][0];
  }
  return pajak;
}
function hitungGaji() {
  var gaji = val('gaji-kotor'), status = str('gaji-status') || 'TK/0';
  var ikut = document.getElementById('gaji-bpjs') ? document.getElementById('gaji-bpjs').checked : true;
  var out = document.getElementById('gaji-hasil'); if (!out) return;
  if (gaji <= 0) { out.innerHTML = '<p>Masukkan gaji kotor per bulan di atas 0.</p>'; return; }
  var brutoTh = gaji * 12;
  var kesBln = 0, jhtBln = 0, jpBln = 0;
  if (ikut) {
    kesBln = 0.01 * Math.min(gaji, 12000000);
    jhtBln = 0.02 * gaji;
    jpBln = 0.01 * Math.min(gaji, 11086300); // batas upah JP sejak Maret 2026
  }
  var biayaJabatan = Math.min(0.05 * brutoTh, 6000000);
  var netoTh = brutoTh - biayaJabatan - (jhtBln + jpBln) * 12;
  var nilaiPTKP = ptkp(status);
  var pkp = Math.max(netoTh - nilaiPTKP, 0);
  pkp = Math.floor(pkp / 1000) * 1000;
  var pphTh = pphTahunan(pkp), pphBln = pphTh / 12;
  var bpjsBln = kesBln + jhtBln + jpBln;
  var bersih = gaji - bpjsBln - pphBln;
  out.innerHTML = '<h2>Hasil perhitungan</h2><p style="margin:0">Perkiraan gaji bersih per bulan</p><p class="big">' + rp(bersih) + '</p>' +
    '<dl class="rincian">' +
    row('Gaji kotor per bulan', rp(gaji)) +
    row('BPJS Kesehatan (karyawan 1%)', '− ' + rp(kesBln)) +
    row('BPJS JHT (karyawan 2%)', '− ' + rp(jhtBln)) +
    row('BPJS JP (karyawan 1%)', '− ' + rp(jpBln)) +
    row('PPh 21 per bulan (tahunan ÷ 12)', '− ' + rp(pphBln)) +
    row('Gaji bersih per bulan', rp(bersih), 'total') + '</dl>' +
    '<p style="font-size:.9rem">Rincian setahun: penghasilan bruto ' + rp(brutoTh) + ', biaya jabatan ' + rp(biayaJabatan) +
    ', PTKP ' + status + ' ' + rp(nilaiPTKP) + ', PKP ' + rp(pkp) + ', PPh setahun ' + rp(pphTh) + '.</p>';
}

/* ---------- THR ---------- */
function hitungTHR() {
  var upah = val('thr-upah'), masa = val('thr-masa');
  var out = document.getElementById('thr-hasil'); if (!out) return;
  var thr, ket;
  if (masa < 1) { thr = 0; ket = 'Masa kerja belum genap 1 bulan, sehingga menurut Permenaker 6/2016 belum berhak atas THR.'; }
  else if (masa >= 12) { thr = upah; ket = 'Masa kerja 12 bulan atau lebih: THR sebesar 1× upah sebulan.'; }
  else { thr = masa / 12 * upah; ket = 'Masa kerja ' + masa + ' bulan: THR proporsional = ' + masa + '/12 × upah sebulan.'; }
  out.innerHTML = '<h2>Hasil perhitungan</h2><p style="margin:0">Perkiraan THR</p><p class="big">' + rp(thr) + '</p>' +
    '<dl class="rincian">' + row('Upah sebulan (pokok + tunjangan tetap)', rp(upah)) + row('Masa kerja', num(masa) + ' bulan') +
    row('THR', rp(thr), 'total') + '</dl><p style="font-size:.92rem">' + ket + '</p>';
}

/* ---------- Zakat penghasilan ---------- */
function hitungZakat() {
  var peng = val('zak-penghasilan'), lain = val('zak-lain'), nisab = val('zak-nisab') || 7640144;
  var out = document.getElementById('zak-hasil'); if (!out) return;
  var total = peng + lain;
  if (total >= nisab) {
    out.innerHTML = '<h2>Hasil perhitungan</h2><p style="margin:0">Zakat penghasilan per bulan (2,5%)</p><p class="big">' + rp(0.025 * total) + '</p>' +
      '<dl class="rincian">' + row('Total penghasilan bruto per bulan', rp(total)) + row('Nisab per bulan', rp(nisab)) +
      row('Zakat per bulan', rp(0.025 * total), 'total') + row('Zakat bila dibayar setahun sekali', rp(0.025 * total * 12)) + '</dl>' +
      '<p style="font-size:.92rem">Penghasilan Anda sudah mencapai nisab, sehingga wajib zakat penghasilan sebesar 2,5% dari penghasilan bruto.</p>';
  } else {
    out.innerHTML = '<h2>Hasil perhitungan</h2><p style="margin:0">Status nisab</p><p class="big">Belum wajib zakat</p>' +
      '<dl class="rincian">' + row('Total penghasilan bruto per bulan', rp(total)) + row('Nisab per bulan', rp(nisab)) +
      row('Selisih menuju nisab', rp(nisab - total), 'total') + '</dl>' +
      '<p style="font-size:.92rem">Penghasilan Anda masih di bawah nisab, jadi zakat penghasilan belum wajib. Anda tetap bisa bersedekah/infak secara sukarela.</p>';
  }
}

/* ---------- Bunga majemuk ---------- */
function hitungMajemuk() {
  var modal = val('maj-modal'), setoran = val('maj-setoran'), ret = val('maj-return'), th = val('maj-tahun');
  var out = document.getElementById('maj-hasil'); if (!out) return;
  if (th <= 0) { out.innerHTML = '<p>Masukkan durasi di atas 0 tahun.</p>'; return; }
  var r = ret / 100 / 12, n = Math.round(th * 12);
  var fvModal = modal * Math.pow(1 + r, n);
  var fvSetoran = r === 0 ? setoran * n : setoran * ((Math.pow(1 + r, n) - 1) / r);
  var akhir = fvModal + fvSetoran, totalSetoran = modal + setoran * n, bunga = akhir - totalSetoran;
  var html = '<h2>Hasil perhitungan</h2><p style="margin:0">Perkiraan nilai akhir setelah ' + th + ' tahun</p><p class="big">' + rp(akhir) + '</p>' +
    '<dl class="rincian">' + row('Modal awal', rp(modal)) + row('Total setoran rutin', rp(setoran * n)) +
    row('Total uang yang disetor', rp(totalSetoran)) + row('Total bunga/imbal hasil', rp(bunga)) +
    row('Nilai akhir', rp(akhir), 'total') + '</dl>';
  out.innerHTML = html;
  var tb = document.getElementById('maj-tabel-body');
  if (tb) {
    var rows = '';
    for (var t = 1; t <= th; t++) {
      var m = t * 12, fm = modal * Math.pow(1 + r, m);
      var fs = r === 0 ? setoran * m : setoran * ((Math.pow(1 + r, m) - 1) / r);
      rows += '<tr><td>' + t + '</td><td>' + rp(modal + setoran * m) + '</td><td>' + rp(fm + fs - (modal + setoran * m)) + '</td><td>' + rp(fm + fs) + '</td></tr>';
    }
    tb.innerHTML = rows;
  }
}

/* ---------- Dana darurat ---------- */
function hitungDarurat() {
  var keluar = val('dar-pengeluaran'), targetBln = val('dar-target'), punya = val('dar-punya'), nabung = val('dar-nabung');
  var out = document.getElementById('dar-hasil'); if (!out) return;
  var target = keluar * targetBln, kurang = Math.max(target - punya, 0);
  var bulan = kurang === 0 ? 0 : (nabung > 0 ? Math.ceil(kurang / nabung) : Infinity);
  out.innerHTML = '<h2>Hasil perhitungan</h2><p style="margin:0">Target dana darurat (' + targetBln + '× pengeluaran bulanan)</p><p class="big">' + rp(target) + '</p>' +
    '<dl class="rincian">' + row('Pengeluaran per bulan', rp(keluar)) + row('Tabungan saat ini', rp(punya)) +
    row('Kekurangan', rp(kurang)) +
    row('Estimasi waktu tercapai', kurang === 0 ? 'Sudah tercapai 🎉' : (isFinite(bulan) ? '± ' + num(bulan) + ' bulan' : 'Isi jumlah nabung per bulan'), 'total') + '</dl>' +
    '<p style="font-size:.92rem">Asumsi: tabungan tidak diberi imbal hasil/return (0%) dan pengeluaran tetap — estimasi konservatif. Bila tabungan ditempatkan di instrumen berimbal hasil, target bisa tercapai lebih cepat.</p>';
}

document.addEventListener('DOMContentLoaded', function () {
  initOnLoad(['kpr-harga', 'kpr-dp', 'kpr-bunga', 'kpr-tenor'], 'kpr-hitung', hitungKPR);
  initOnLoad(['cic-pinjaman', 'cic-bunga', 'cic-tenor', 'cic-metode'], 'cic-hitung', hitungCicilan);
  initOnLoad(['gaji-kotor', 'gaji-status', 'gaji-bpjs'], 'gaji-hitung', hitungGaji);
  initOnLoad(['thr-upah', 'thr-masa'], 'thr-hitung', hitungTHR);
  initOnLoad(['zak-penghasilan', 'zak-lain', 'zak-nisab'], 'zak-hitung', hitungZakat);
  initOnLoad(['maj-modal', 'maj-setoran', 'maj-return', 'maj-tahun'], 'maj-hitung', hitungMajemuk);
  initOnLoad(['dar-pengeluaran', 'dar-target', 'dar-punya', 'dar-nabung'], 'dar-hitung', hitungDarurat);
});

/* ================= VERSI LENGKAP: 9 kalkulator tambahan ================= */
/* ---------- Deposito ---------- */
function hitungDeposito() {
  var pokok = val('dep-pokok'), tarif = val('dep-bunga'), bln = val('dep-tenor');
  var out = document.getElementById('dep-hasil'); if (!out) return;
  if (pokok <= 0 || bln <= 0) { out.innerHTML = '<p>Masukkan pokok dan tenor di atas 0.</p>'; return; }
  var bruto = pokok * (tarif / 100) * (bln / 12);
  var pajak = pokok <= 7500000 ? 0 : 0.20 * bruto;
  var bersih = bruto - pajak, total = pokok + bersih;
  var yieldEf = pokok > 0 ? (bersih / pokok) * (12 / bln) * 100 : 0;
  out.innerHTML = '<h2>Hasil perhitungan</h2><p style="margin:0">Total diterima saat jatuh tempo</p><p class="big">' + rp(total) + '</p>' +
    '<dl class="rincian">' + row('Pokok deposito', rp(pokok)) + row('Bunga bruto (' + tarif + '% × ' + bln + '/12)', rp(bruto)) +
    row('PPh final atas bunga' + (pajak === 0 ? ' (0% — total simpanan ≤ Rp7.500.000)' : ' (20%)'), '− ' + rp(pajak)) +
    row('Bunga bersih', rp(bersih)) + row('Total diterima', rp(total), 'total') +
    row('Yield efektif setelah pajak', yieldEf.toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' % per tahun') + '</dl>';
}
/* ---------- BPJS rincian ---------- */
function hitungBPJS() {
  var upah = val('bpj-upah'); var out = document.getElementById('bpj-hasil'); if (!out) return;
  if (upah <= 0) { out.innerHTML = '<p>Masukkan upah per bulan di atas 0.</p>'; return; }
  var bKes = Math.min(upah, 12000000), bJP = Math.min(upah, 11086300);
  var k = { kes: 0.01 * bKes, jht: 0.02 * upah, jp: 0.01 * bJP };
  var p = { kes: 0.04 * bKes, jht: 0.037 * upah, jp: 0.02 * bJP, jkk: 0.0024 * upah, jkm: 0.003 * upah };
  var totK = k.kes + k.jht + k.jp, totP = p.kes + p.jht + p.jp + p.jkk + p.jkm;
  out.innerHTML = '<h2>Hasil perhitungan — iuran per bulan</h2>' +
    '<dl class="rincian">' + row('Karyawan — Kesehatan 1%', rp(k.kes)) + row('Karyawan — JHT 2%', rp(k.jht)) + row('Karyawan — JP 1%', rp(k.jp)) +
    row('Total dipotong dari gaji karyawan', rp(totK), 'total') +
    row('Perusahaan — Kesehatan 4%', rp(p.kes)) + row('Perusahaan — JHT 3,7%', rp(p.jht)) + row('Perusahaan — JP 2%', rp(p.jp)) +
    row('Perusahaan — JKK 0,24% (asumsi risiko terendah)', rp(p.jkk)) + row('Perusahaan — JKM 0,3%', rp(p.jkm)) +
    row('Total dibayar perusahaan', rp(totP), 'total') + row('Total iuran sebulan (karyawan + perusahaan)', rp(totK + totP)) + '</dl>' +
    '<p style="font-size:.9rem">Basis Kesehatan dibatasi upah Rp12.000.000 dan basis JP dibatasi Rp11.086.300 (sejak Maret 2026). Tarif JKK sebenarnya 0,24%–1,74% tergantung tingkat risiko pekerjaan; di sini dipakai 0,24% sebagai asumsi.</p>';
}
/* ---------- Lembur ---------- */
function hitungLembur() {
  var upah = val('lem-upah'), jenis = str('lem-jenis') || 'kerja', jamIn = val('lem-jam');
  var out = document.getElementById('lem-hasil'); if (!out) return;
  if (upah <= 0 || jamIn <= 0) { out.innerHTML = '<p>Masukkan upah dan jumlah jam lembur di atas 0.</p>'; return; }
  var sejam = upah / 173, sisa = jamIn, total = 0, rincian = '';
  function kelompok(label, ambil, kali) {
    if (sisa <= 0 || ambil <= 0) return;
    var j = Math.min(sisa, ambil), bayar = j * kali * sejam; total += bayar; sisa -= j;
    rincian += row(label + ' — ' + j + ' jam × ' + String(kali).replace('.', ',') + '×', rp(bayar));
  }
  if (jenis === 'kerja') { kelompok('Jam pertama', 1, 1.5); kelompok('Jam berikutnya', Infinity, 2); }
  else if (jenis === 'libur5') { kelompok('8 jam pertama', 8, 2); kelompok('Jam ke-9', 1, 3); kelompok('Jam ke-10–11', 2, 4); }
  else { kelompok('7 jam pertama', 7, 2); kelompok('Jam ke-8', 1, 3); kelompok('Jam ke-9–10', 2, 4); }
  if (sisa > 0) rincian += row('Jam di luar kelompok tarif di atas (tidak dihitung)', num(sisa) + ' jam');
  out.innerHTML = '<h2>Hasil perhitungan</h2><p style="margin:0">Total upah lembur</p><p class="big">' + rp(total) + '</p>' +
    '<dl class="rincian">' + row('Upah sejam (1/173 × upah sebulan)', rp(sejam)) + rincian + row('Total upah lembur', rp(total), 'total') + '</dl>';
}
/* ---------- Pesangon ---------- */
function tabelPesangon(th) { return th < 1 ? 1 : Math.min(Math.floor(th) + 1, 9); }
function tabelUPMK(th) {
  if (th < 3) return 0; if (th < 6) return 2; if (th < 9) return 3; if (th < 12) return 4;
  if (th < 15) return 5; if (th < 18) return 6; if (th < 21) return 7; if (th < 24) return 8; return 10;
}
function hitungPesangon() {
  var upah = val('pes-upah'), masaIn = val('pes-masa');
  var pengaliSel = str('pes-pengali') || '1';
  var pengali = pengaliSel === 'kustom' ? val('pes-pengali-kustom') : parseFloat(pengaliSel);
  var out = document.getElementById('pes-hasil'); if (!out) return;
  if (upah <= 0) { out.innerHTML = '<p>Masukkan upah sebulan di atas 0.</p>'; return; }
  var th = Math.floor(Math.max(masaIn, 0));
  var upBln = tabelPesangon(th), upmkBln = tabelUPMK(th);
  var upDasar = upBln * upah, up = upDasar * pengali, upmk = upmkBln * upah;
  out.innerHTML = '<h2>Hasil perhitungan (estimasi dasar)</h2><p style="margin:0">Total UP + UPMK (sebelum Uang Penggantian Hak)</p><p class="big">' + rp(up + upmk) + '</p>' +
    '<dl class="rincian">' + row('Masa kerja yang dihitung', th + ' tahun penuh') +
    row('Uang Pesangon dasar: ' + upBln + ' bulan × upah', rp(upDasar)) +
    row('Pengali alasan PHK yang Anda pilih', '× ' + String(pengali).replace('.', ',')) +
    row('Uang Pesangon setelah pengali', rp(up)) +
    row('UPMK: ' + upmkBln + ' bulan × upah', rp(upmk)) +
    row('Total (belum termasuk UPH)', rp(up + upmk), 'total') + '</dl>' +
    '<p style="font-size:.9rem">Belum termasuk Uang Penggantian Hak (UPH) seperti sisa cuti yang belum diambil dan ongkos pulang. Pengali sebenarnya ditentukan oleh alasan PHK menurut peraturan yang berlaku.</p>';
}
/* ---------- Kredit kendaraan ---------- */
function hitungKendaraan() {
  var harga = val('ken-harga'), dp = val('ken-dp'), tarif = val('ken-bunga'), bln = Math.round(val('ken-tenor')), biaya = val('ken-biaya');
  var out = document.getElementById('ken-hasil'); if (!out) return;
  var pokok = Math.max(harga - dp, 0);
  if (pokok <= 0 || bln <= 0) { out.innerHTML = '<p>Masukkan harga yang lebih besar dari DP dan tenor di atas 0.</p>'; return; }
  var bungaTotal = pokok * (tarif / 100) * (bln / 12);
  var cicilan = (pokok + bungaTotal) / bln;
  var totalBiaya = bungaTotal + biaya, totalSemua = dp + pokok + bungaTotal + biaya;
  out.innerHTML = '<h2>Hasil perhitungan</h2><p style="margin:0">Cicilan per bulan (flat)</p><p class="big">' + rp(cicilan) + '</p>' +
    '<dl class="rincian">' + row('Pokok kredit (harga − DP)', rp(pokok)) + row('Total bunga flat', rp(bungaTotal)) +
    row('Biaya admin + provisi', rp(biaya)) + row('Total biaya kredit (bunga + biaya)', rp(totalBiaya)) +
    row('Total keseluruhan (DP + semua cicilan + biaya)', rp(totalSemua), 'total') + '</dl>' +
    '<p style="font-size:.92rem">Peringatan: bunga flat terlihat kecil, tetapi bunga efektifnya jauh lebih tinggi karena bunga selalu dihitung dari pokok awal. Bandingkan dengan <a href="cicilan.html" style="color:#EFE3B8">Kalkulator Cicilan metode anuitas</a>.</p>';
}
/* ---------- Tujuan keuangan ---------- */
function setoranBulanan(target, modalAwal, retTahunan, tahun) {
  var r = retTahunan / 100 / 12, n = Math.round(tahun * 12);
  var fvModal = modalAwal * Math.pow(1 + r, n), sisa = target - fvModal;
  if (sisa <= 0) return { setoran: 0, fvModal: fvModal, sisa: sisa, n: n };
  var s = r === 0 ? sisa / n : sisa / ((Math.pow(1 + r, n) - 1) / r);
  return { setoran: s, fvModal: fvModal, sisa: sisa, n: n };
}
function hitungTujuan() {
  var target = val('tuj-target'), th = val('tuj-tahun'), ret = val('tuj-return'), modal = val('tuj-modal');
  var out = document.getElementById('tuj-hasil'); if (!out) return;
  if (target <= 0 || th <= 0) { out.innerHTML = '<p>Masukkan target dana dan waktu di atas 0.</p>'; return; }
  var h = setoranBulanan(target, modal, ret, th), totalSetoran = modal + h.setoran * h.n;
  out.innerHTML = '<h2>Hasil perhitungan</h2><p style="margin:0">Setoran yang dibutuhkan per bulan</p><p class="big">' + rp(h.setoran) + '</p>' +
    '<dl class="rincian">' + row('Target dana', rp(target)) + row('Modal awal', rp(modal)) +
    row('Modal awal tumbuh menjadi', rp(h.fvModal)) + row('Total setoran rutin (' + h.n + ' bulan)', rp(h.setoran * h.n)) +
    row('Total uang yang Anda setor', rp(totalSetoran)) + row('Porsi dari pertumbuhan/return', rp(Math.max(target - totalSetoran, 0)), 'total') + '</dl>' +
    (h.sisa <= 0 ? '<p style="font-size:.92rem">Modal awal Anda saja, dengan asumsi return ini, sudah cukup mencapai target — tidak perlu setoran rutin.</p>' : '');
}
/* ---------- Dana pendidikan ---------- */
function hitungPendidikan() {
  var biaya = val('pen-biaya'), usia = val('pen-usia'), masuk = val('pen-masuk'), infl = val('pen-inflasi'), ret = val('pen-return');
  var out = document.getElementById('pen-hasil'); if (!out) return;
  var th = masuk - usia;
  if (biaya <= 0 || th <= 0) { out.innerHTML = '<p>Usia masuk harus lebih besar dari usia anak sekarang, dan biaya target di atas 0.</p>'; return; }
  var future = biaya * Math.pow(1 + infl / 100, th);
  var h = setoranBulanan(future, 0, ret, th), totalSetoran = h.setoran * h.n;
  out.innerHTML = '<h2>Hasil perhitungan</h2><p style="margin:0">Setoran yang dibutuhkan per bulan</p><p class="big">' + rp(h.setoran) + '</p>' +
    '<dl class="rincian">' + row('Biaya pendidikan saat ini', rp(biaya)) + row('Waktu persiapan', th + ' tahun') +
    row('Perkiraan biaya saat anak masuk (inflasi ' + infl + '%/tahun)', rp(future)) +
    row('Total setoran rutin (' + h.n + ' bulan)', rp(totalSetoran)) + row('Porsi dari pertumbuhan/return', rp(Math.max(future - totalSetoran, 0)), 'total') + '</dl>' +
    '<p style="font-size:.92rem">Inflasi biaya pendidikan di Indonesia sering dikutip di kisaran tinggi (default kalkulator ini 8%/tahun, dapat Anda ubah) — jauh di atas inflasi umum, karena itu persiapan sejak dini sangat membantu.</p>';
}
/* ---------- Dana pensiun ---------- */
function hitungPensiun() {
  var usia = val('ret-usia'), pensiun = val('ret-pensiun'), keluar = val('ret-pengeluaran'), infl = val('ret-inflasi'), ret = val('ret-return'), punya = val('ret-punya');
  var out = document.getElementById('ret-hasil'); if (!out) return;
  var th = pensiun - usia;
  if (keluar <= 0 || th <= 0) { out.innerHTML = '<p>Usia pensiun harus lebih besar dari usia sekarang, dan pengeluaran di atas 0.</p>'; return; }
  var keluarNanti = keluar * Math.pow(1 + infl / 100, th);
  var tahunPertama = keluarNanti * 12, target = tahunPertama * 25;
  var h = setoranBulanan(target, punya, ret, th), totalSetoran = punya + h.setoran * h.n;
  out.innerHTML = '<h2>Hasil perhitungan</h2><p style="margin:0">Setoran yang dibutuhkan per bulan sampai pensiun</p><p class="big">' + rp(h.setoran) + '</p>' +
    '<dl class="rincian">' + row('Waktu persiapan', th + ' tahun') +
    row('Pengeluaran bulanan yang diinginkan, dalam nilai saat pensiun (setelah inflasi ' + infl + '%/tahun)', rp(keluarNanti)) +
    row('Kebutuhan tahun pertama pensiun', rp(tahunPertama)) +
    row('Dana target saat pensiun (25× kebutuhan tahunan — pendekatan aturan 4%)', rp(target)) +
    row('Tabungan saat ini tumbuh menjadi', rp(h.fvModal)) +
    row('Total uang yang Anda setor (tabungan awal + setoran rutin)', rp(totalSetoran), 'total') + '</dl>' +
    '<p style="font-size:.92rem">Angka 25× adalah pendekatan rule-of-thumb (aturan 4%), bukan standar resmi dan bukan jaminan kecukupan — lihat penjelasan asumsi di halaman ini.</p>';
}
/* ---------- Zakat mal ---------- */
function hitungZakatMal() {
  var tab = val('mal-tabungan'), emas = val('mal-emas'), lain = val('mal-lain'), utang = val('mal-utang'), hargaEmas = val('mal-harga-emas');
  var out = document.getElementById('mal-hasil'); if (!out) return;
  var nisab = 85 * hargaEmas, bersih = Math.max(tab + emas + lain - utang, 0);
  var wajib = bersih >= nisab && nisab > 0;
  out.innerHTML = '<h2>Hasil perhitungan</h2><p style="margin:0">' + (wajib ? 'Zakat mal yang perlu ditunaikan (2,5%)' : 'Status nisab') + '</p><p class="big">' + (wajib ? rp(0.025 * bersih) : 'Belum wajib zakat mal') + '</p>' +
    '<dl class="rincian">' + row('Nisab (85 gram × harga emas/gram)', rp(nisab)) +
    row('Total harta (tabungan + emas + aset lain)', rp(tab + emas + lain)) + row('Utang jatuh tempo', '− ' + rp(utang)) +
    row('Total harta bersih', rp(bersih), 'total') + (wajib ? row('Zakat mal 2,5%', rp(0.025 * bersih)) : row('Selisih menuju nisab', rp(nisab - bersih))) + '</dl>' +
    '<p style="font-size:.92rem">Zakat mal juga mensyaratkan haul: harta mencapai nisab dan telah dimiliki selama satu tahun hijriah. Kalkulator ini hanya memeriksa sisi jumlah (nisab); sisi haul Anda nilai dari kapan harta itu Anda miliki.</p>';
}
document.addEventListener('DOMContentLoaded', function () {
  initOnLoad(['dep-pokok', 'dep-bunga', 'dep-tenor'], 'dep-hitung', hitungDeposito);
  initOnLoad(['bpj-upah'], 'bpj-hitung', hitungBPJS);
  initOnLoad(['lem-upah', 'lem-jenis', 'lem-jam'], 'lem-hitung', hitungLembur);
  initOnLoad(['pes-upah', 'pes-masa', 'pes-pengali', 'pes-pengali-kustom'], 'pes-hitung', hitungPesangon);
  initOnLoad(['ken-harga', 'ken-dp', 'ken-bunga', 'ken-tenor', 'ken-biaya'], 'ken-hitung', hitungKendaraan);
  initOnLoad(['tuj-target', 'tuj-tahun', 'tuj-return', 'tuj-modal'], 'tuj-hitung', hitungTujuan);
  initOnLoad(['pen-biaya', 'pen-usia', 'pen-masuk', 'pen-inflasi', 'pen-return'], 'pen-hitung', hitungPendidikan);
  initOnLoad(['ret-usia', 'ret-pensiun', 'ret-pengeluaran', 'ret-inflasi', 'ret-return', 'ret-punya'], 'ret-hitung', hitungPensiun);
  initOnLoad(['mal-tabungan', 'mal-emas', 'mal-lain', 'mal-utang', 'mal-harga-emas'], 'mal-hitung', hitungZakatMal);
});
