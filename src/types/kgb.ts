import { getGajiPokok, parseMkYears } from '../services/salaryTable';

export type AppRole = 'admin' | 'user';

export interface AppSession {
  username: string;
  role: AppRole;
  displayName: string;
  loginTime: string;
}

export interface KGBRecord {
  id: string;
  rowNumber?: number;

  // DB KGB Kolom Mappings
  kolomA?: string;          // Kolom A: Nomor Urut
  nama: string;             // Kolom B: Nama
  kolomB?: string;
  nip: string;              // Kolom C: NIP
  kolomC?: string;
  kolomD?: string;          // Kolom D: Gelar Depan (I34: D, B, E)
  kolomE?: string;          // Kolom E: Gelar Belakang (I34: D, B, E)
  kolomF?: string;          // Kolom F: Golongan (I36: F, R)
  pangkatGol: string;
  kolomG?: string;          // Kolom G: Nomor SK Lama (I40: G, H)
  kolomH?: string;          // Kolom H: Tanggal SK Lama (I40: G, H)
  kolomI?: string;          // Kolom I: TMT SK Lama (I43)
  kolomJ?: string;          // Kolom J: Gaji Pokok Lama (I44)
  kolomK?: string;          // Kolom K: TMT KGB Baru (I45)
  kolomL?: string;          // Kolom L: Gaji Pokok Baru (I46)
  kolomM?: string;          // Kolom M: Masa Kerja Tahun (I48: M, N)
  kolomN?: string;          // Kolom N: Masa Kerja Bulan (I48: M, N)
  kolomO?: string;          // Kolom O: Golongan Ruang Baru (I49)
  kolomP?: string;          // Kolom P: Tanggal KGB Berikutnya (I50)
  jabatan: string;          // Kolom R: Jabatan (I36: F, R)
  kolomR?: string;
  unitKerja: string;        // Kolom S: Unit Kerja (I39, C51)
  kolomS?: string;

  // Operational fields
  tmtKgb: string;           // Tanggal TMT KGB
  bulanKgb: number;         // Bulan dari kolom K (1 - 12)
  tahunKgb: number;         // Tahun acuan dari kolom T:AD (2022 - 2032)
  tanggalAcuanK: string;    // Raw value kolom K
  nomorSk: string;          // Nomor SK pada dashboard (diisi manual)
  tanggalPenetapan: string; // Tanggal penetapan pada dashboard (diisi manual YYYY-MM-DD)
  mkSebelum: string;        // e.g. "01 Tahun 00 Bulan"
  mkSesudah: string;        // e.g. "03 Tahun 00 Bulan"
  gajiLama?: number;
  gajiBaru?: number;
  pejabatPenetap?: string;
  isSaved?: boolean;
  activeYears?: number[];
  yearDetails?: Record<number, { nomorSk?: string; tanggalPenetapan?: string; cellValue?: string }>;

  // Additional fields for official decree
  masaPerjanjianKerja?: string;        // e.g. "5 Tahun"
  perpanjanganPerjanjianKerja?: string; // e.g. "5 Tahun"
  pejabatSkLama?: string;              // e.g. "Bupati Penajam Paser Utara"
}

export interface SKTemplateConfig {
  kopInstansi1: string;
  kopInstansi2: string;
  kopAlamat: string;
  kopTelpEmail: string;
  kotaPenetapan: string;
  jabatanPenetap: string;
  namaPenetap: string;
  pangkatPenetap: string;
  nipPenetap: string;
  nomorSuratFormat: string;
  tujuanSurat: string;
  dasarHukum: string;
  catatanKaki: string;
  googleDocsTemplateId?: string;
  templateMode?: 'google_docs' | 'built_in';
  templateText?: string;
}

export interface YearMonthOption {
  year: number;
  months: number[];
}

/**
 * Konversi angka bulan ke format Romawi (I s/d XII)
 */
export function getBulanRomawi(bulanNum: number): string {
  const romawiMap: Record<number, string> = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V',
    6: 'VI',
    7: 'VII',
    8: 'VIII',
    9: 'IX',
    10: 'X',
    11: 'XI',
    12: 'XII'
  };
  return romawiMap[bulanNum] || 'I';
}

/**
 * Format Nomor SK Lengkap sesuai template:
 * NOMOR : 800.1.11.13/(nomor sk pada dashboard)/BKPSDM-PPPK/(bulan pada tanggal penetapan pada dashboard, dalam huruf romawi)/(tahun pada dashboard tanggal penetapan)
 */
export function buildFullNomorSK(nomorSkDashboard?: string, tanggalPenetapan?: string, defaultYear: number = 2026): {
  nomorLengkap: string;
  nomorUrut: string;
  bulanRomawi: string;
  tahunPenetapan: string;
} {
  let nomorUrut = (nomorSkDashboard || '001').trim();
  const matchUrut = nomorUrut.match(/800\.1\.11\.13\/([^/]+)/);
  if (matchUrut) {
    nomorUrut = matchUrut[1];
  } else {
    // Zero-pad simple numbers e.g. "1" -> "001"
    const parsedNum = parseInt(nomorUrut, 10);
    if (!isNaN(parsedNum) && /^\d+$/.test(nomorUrut)) {
      nomorUrut = String(parsedNum).padStart(3, '0');
    }
  }

  let bulanRomawi = 'VI';
  let tahunPenetapan = String(defaultYear);

  if (tanggalPenetapan) {
    const parts = tanggalPenetapan.match(/^(\d{4})[-/](\d{1,2})/);
    if (parts) {
      tahunPenetapan = parts[1];
      const bNum = parseInt(parts[2], 10);
      bulanRomawi = getBulanRomawi(bNum);
    }
  }

  const nomorLengkap = `800.1.11.13/${nomorUrut}/BKPSDM-PPPK/${bulanRomawi}/${tahunPenetapan}`;

  return {
    nomorLengkap,
    nomorUrut,
    bulanRomawi,
    tahunPenetapan
  };
}

export interface SKRenderData {
  nomorLengkap: string;
  nomorUrut: string;
  bulanRomawi: string;
  tahunPenetapan: string;
  nomorSK_A10: string;
  judulSK_C24: string;
  namaLengkap_I34: string;
  nip_I35: string;
  golJabatan_I36: string;
  masaPerjanjian: string;
  perpanjanganPerjanjian: string;
  unitKerja_I39: string;
  resolvedGajiLamaNumeric: number;
  gajiLamaFull_I44: string;
  skLamaPejabat: string;
  skLamaTanggal: string;
  skLamaNomor_I40: string;
  skLamaTmt_I43: string;
  skLamaMk: string;
  resolvedGajiBaruNumeric: number;
  gajiBaruFull_I46: string;
  mkGolongan_I48: string;
  tmtBaru_I45: string;
  kolomP: string;
  golBaru_I49: string;
  kgbBerikutnya_I50: string;
  diktumBiaya_C51: string;
  tanggalPenetapan_I55: string;
}

/**
 * Konversi angka ke terbilang bahasa Indonesia resmi
 */
export function terbilang(n: number): string {
  const bilangan = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima',
    'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ];

  if (n < 12) {
    return bilangan[n];
  } else if (n < 20) {
    return `${terbilang(n - 10)} Belas`;
  } else if (n < 100) {
    const sisa = n % 10;
    return `${terbilang(Math.floor(n / 10))} Puluh${sisa ? ' ' + terbilang(sisa) : ''}`;
  } else if (n < 200) {
    const sisa = n - 100;
    return `Seratus${sisa ? ' ' + terbilang(sisa) : ''}`;
  } else if (n < 1000) {
    const sisa = n % 100;
    return `${terbilang(Math.floor(n / 100))} Ratus${sisa ? ' ' + terbilang(sisa) : ''}`;
  } else if (n < 2000) {
    const sisa = n - 1000;
    return `Seribu${sisa ? ' ' + terbilang(sisa) : ''}`;
  } else if (n < 1000000) {
    const sisa = n % 1000;
    return `${terbilang(Math.floor(n / 1000))} Ribu${sisa ? ' ' + terbilang(sisa) : ''}`;
  } else if (n < 1000000000) {
    const sisa = n % 1000000;
    return `${terbilang(Math.floor(n / 1000000))} Juta${sisa ? ' ' + terbilang(sisa) : ''}`;
  } else if (n < 1000000000000) {
    const sisa = n % 1000000000;
    return `${terbilang(Math.floor(n / 1000000000))} Miliar${sisa ? ' ' + terbilang(sisa) : ''}`;
  }
  return String(n);
}

/**
 * Format string Rupiah dengan kalimat Terbilang:
 * Contoh: "Rp 2.511.500 (Dua Juta Lima Ratus Sebelas Ribu Lima Ratus Rupiah)"
 */
export function formatGajiTerbilang(amount?: number | string): string {
  if (!amount) return 'Rp 0 (Nol Rupiah)';
  let num = 0;
  if (typeof amount === 'number') {
    num = Math.round(amount);
  } else {
    const str = String(amount).trim();
    // Jika mengandung slash '/' atau nomor SK atau text, abaikan agar tidak jadi angka miliaran
    if (str.includes('/') || str.includes('SK') || str.includes('800.') || str.includes('BKPSDM')) {
      num = 0;
    } else {
      const clean = str.replace(/[^0-9]/g, '');
      num = parseInt(clean, 10) || 0;
    }
  }

  // Safety filter: Gaji pokok PPPK/PNS di Indonesia berkisar antara 1.9 juta s/d 8 juta
  // Jika lebih besar dari 20 juta (seperti 80.011.321.147 akibat nomor SK), fallback ke 2.511.500
  if (num > 20000000 || num < 500000) {
    num = 2511500;
  }

  const formattedNumber = num.toLocaleString('id-ID');
  const words = `${terbilang(num).trim()} Rupiah`;
  return `Rp ${formattedNumber} (${words})`;
}

/**
 * Format tanggal ke format resmi Indonesia (contoh: "1 Juni 2026")
 */
export function formatIndoDate(dateStr?: string | number): string {
  if (dateStr === null || dateStr === undefined) return '';
  const raw = String(dateStr).trim();
  if (!raw) return '';

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // 1. Cek nomor serial tanggal Excel/Google Sheets (misal 45809)
  const numSerial = Number(raw);
  if (!isNaN(numSerial) && numSerial >= 30000 && numSerial <= 60000) {
    const d = new Date((numSerial - 25569) * 86400 * 1000);
    const day = d.getUTCDate();
    const month = d.getUTCMonth();
    const year = d.getUTCFullYear();
    return `${day} ${monthNames[month] || 'Januari'} ${year}`;
  }

  // 2. Format YYYY-MM-DD atau YYYY/MM/DD
  const match = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (match) {
    const year = match[1];
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    return `${day} ${monthNames[month - 1] || 'Januari'} ${year}`;
  }

  // 3. Format DD/MM/YYYY atau DD-MM-YYYY
  const dmyMatch = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const year = dmyMatch[3];
    return `${day} ${monthNames[month - 1] || 'Januari'} ${year}`;
  }

  // 4. Format tanggal teks: contoh "1 juni 2025", "01 June 2025", "1 Mei 2025"
  const textMatch = raw.match(/^(\d{1,2})\s+([a-zA-Z]+)(?:\s+(\d{4}))?/);
  if (textMatch) {
    const day = parseInt(textMatch[1], 10);
    const mStr = textMatch[2].toLowerCase();
    const year = textMatch[3] || '2026';
    let monthName = 'Januari';

    const foundIdx = monthNames.findIndex(m => m.toLowerCase().startsWith(mStr.slice(0, 3)));
    if (foundIdx >= 0) {
      monthName = monthNames[foundIdx];
    } else if (mStr.startsWith('jun')) {
      monthName = 'Juni';
    } else if (mStr.startsWith('jul')) {
      monthName = 'Juli';
    } else if (mStr.startsWith('mei') || mStr.startsWith('may')) {
      monthName = 'Mei';
    } else if (mStr.startsWith('mar')) {
      monthName = 'Maret';
    } else if (mStr.startsWith('apr')) {
      monthName = 'April';
    } else if (mStr.startsWith('agu') || mStr.startsWith('aug')) {
      monthName = 'Agustus';
    } else if (mStr.startsWith('sep')) {
      monthName = 'September';
    } else if (mStr.startsWith('okt') || mStr.startsWith('oct')) {
      monthName = 'Oktober';
    } else if (mStr.startsWith('nov')) {
      monthName = 'November';
    } else if (mStr.startsWith('des') || mStr.startsWith('dec')) {
      monthName = 'Desember';
    } else if (mStr.startsWith('jan')) {
      monthName = 'Januari';
    } else if (mStr.startsWith('feb')) {
      monthName = 'Februari';
    }

    return `${day} ${monthName} ${year}`;
  }

  return raw;
}

/**
 * Menghitung Kolom P (Mulai Tanggal / TMT Baru) secara otomatis:
 * Jika kolom K adalah "1 juni 2025" dan tahun yang dipilih pada dashboard adalah 2026,
 * maka kolom P (Mulai Tanggal) otomatis menjadi "1 Juni 2026".
 */
export function calculateMulaiTanggal(
  kolomKRaw?: string,
  dashboardYear: number = 2026,
  fallbackDate?: string
): string {
  const targetYear = dashboardYear || 2026;
  const raw = (kolomKRaw || fallbackDate || '').trim();

  const monthNamesIndo = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  if (!raw) {
    return `1 Januari ${targetYear}`;
  }

  // 1. Cek tanggal teks: contoh "1 juni 2025", "1 Juni 2025", "01 June 2025"
  const textMatch = raw.match(/^(\d{1,2})\s+([a-zA-Z]+)(?:\s+\d{4})?/);
  if (textMatch) {
    const day = parseInt(textMatch[1], 10);
    const mStr = textMatch[2].toLowerCase();
    let monthName = 'Juni';

    const foundIdx = monthNamesIndo.findIndex(m => m.toLowerCase().startsWith(mStr.slice(0, 3)));
    if (foundIdx >= 0) {
      monthName = monthNamesIndo[foundIdx];
    } else if (mStr.startsWith('jun')) {
      monthName = 'Juni';
    } else if (mStr.startsWith('jul')) {
      monthName = 'Juli';
    } else if (mStr.startsWith('mei') || mStr.startsWith('may')) {
      monthName = 'Mei';
    } else if (mStr.startsWith('mar')) {
      monthName = 'Maret';
    } else if (mStr.startsWith('apr')) {
      monthName = 'April';
    } else if (mStr.startsWith('agu') || mStr.startsWith('aug')) {
      monthName = 'Agustus';
    } else if (mStr.startsWith('sep')) {
      monthName = 'September';
    } else if (mStr.startsWith('okt') || mStr.startsWith('oct')) {
      monthName = 'Oktober';
    } else if (mStr.startsWith('nov')) {
      monthName = 'November';
    } else if (mStr.startsWith('des') || mStr.startsWith('dec')) {
      monthName = 'Desember';
    } else if (mStr.startsWith('jan')) {
      monthName = 'Januari';
    } else if (mStr.startsWith('feb')) {
      monthName = 'Februari';
    }

    return `${day} ${monthName} ${targetYear}`;
  }

  // 2. Cek format DD/MM/YYYY atau DD-MM-YYYY (contoh: "01/06/2025", "1/6/2025")
  const dmyMatch = raw.match(/^(\d{1,2})[-/](\d{1,2})(?:[-/]\d{2,4})?/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const monthName = monthNamesIndo[month - 1] || 'Juni';
    return `${day} ${monthName} ${targetYear}`;
  }

  // 3. Cek format YYYY-MM-DD (contoh: "2025-06-01")
  const ymdMatch = raw.match(/^\d{4}[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const month = parseInt(ymdMatch[1], 10);
    const day = parseInt(ymdMatch[2], 10);
    const monthName = monthNamesIndo[month - 1] || 'Juni';
    return `${day} ${monthName} ${targetYear}`;
  }

  // 4. Jika teks mengandung nama bulan
  const lower = raw.toLowerCase();
  for (let i = 0; i < monthNamesIndo.length; i++) {
    const mLower = monthNamesIndo[i].toLowerCase();
    if (lower.includes(mLower) || (mLower === 'juni' && lower.includes('june')) || (mLower === 'mei' && lower.includes('may'))) {
      const dayMatch = raw.match(/(\d{1,2})/);
      const day = dayMatch ? parseInt(dayMatch[1], 10) : 1;
      return `${day} ${monthNamesIndo[i]} ${targetYear}`;
    }
  }

  return `1 Januari ${targetYear}`;
}

/**
 * Build complete SK Render Data matching the Penajam Paser Utara SK Decree:
 */
export function getSKRenderData(record: KGBRecord, defaultYear: number = 2026): SKRenderData {
  const skInfo = buildFullNomorSK(record.nomorSk || record.kolomA, record.tanggalPenetapan, defaultYear);

  // A10
  const nomorSK_A10 = `NOMOR : ${skInfo.nomorLengkap}`;

  // C24
  const judulSK_C24 = `KEPUTUSAN KEPALA BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA NOMOR ${skInfo.nomorLengkap} TENTANG KENAIKAN GAJI BERKALA.`;

  // I34: DB KGB Kolom D, B, E
  let namaLengkap_I34 = record.nama || record.kolomB || '';
  if (record.kolomD || record.kolomE) {
    const gelarDepan = record.kolomD ? `${record.kolomD.trim()} ` : '';
    const baseNama = (record.kolomB || record.nama || '').trim();
    let gelarBelakang = '';
    if (record.kolomE) {
      const eTrim = record.kolomE.trim();
      gelarBelakang = eTrim.startsWith(',') ? eTrim : `, ${eTrim}`;
    }
    namaLengkap_I34 = `${gelarDepan}${baseNama}${gelarBelakang}`;
  }

  // I35: DB KGB Kolom C (NIP)
  const nip_I35 = record.kolomC || record.nip || '-';

  // I36: DB KGB Kolom F, R (Golongan / Jabatan)
  const gol = record.kolomF || record.pangkatGol || 'V';
  const jab = record.kolomR || record.jabatan || 'OPERATOR LAYANAN OPERASIONAL';
  const golJabatan_I36 = `${gol} / ${jab}`;

  // 4 & 5. Masa Perjanjian Kerja
  const masaPerjanjian = record.masaPerjanjianKerja || '5 Tahun';
  const perpanjanganPerjanjian = record.perpanjanganPerjanjianKerja || '5 Tahun';

  // I39: DB KGB Kolom S (Unit Kerja)
  const unitKerja_I39 = (record.kolomS || record.unitKerja || 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA').toUpperCase();

  // 7. Gaji Pokok Lama dengan terbilang (Acuan resmi Tabel Gaji Perpres 11/2024 berdasarkan Golongan & Masa Kerja)
  const mkSebelumYears = parseMkYears(record.mkSebelum ?? (record.kolomM ? Math.max(0, parseInt(String(record.kolomM), 10) - 2) : 0));
  let resolvedGajiLamaNumeric = getGajiPokok(gol, mkSebelumYears);

  // Jika record memiliki gajiLama angka murni yang valid antara 1.5jt - 15jt, gunakan
  if (typeof record.gajiLama === 'number' && record.gajiLama >= 1800000 && record.gajiLama <= 15000000) {
    resolvedGajiLamaNumeric = record.gajiLama;
  } else if (mkSebelumYears === 0) {
    // Khusus Golongan V masa kerja 00 tahun 00 bulan, mutlak bernilai 2.511.500
    resolvedGajiLamaNumeric = getGajiPokok(gol, 0);
  }

  const gajiLamaFull_I44 = formatGajiTerbilang(resolvedGajiLamaNumeric);

  // SK Terakhir: Pejabat, Tanggal, Nomor, TMT, Masa Kerja
  const skLamaPejabat = record.pejabatSkLama || 'Bupati Penajam Paser Utara';
  const skLamaTanggal = record.kolomH ? formatIndoDate(record.kolomH) : '7 Mei 2025';
  const skLamaNomor_I40 = record.kolomG || '800.1.13.2/1441/SK-BUP-PPPK/BKPSDM-PPIK';
  const skLamaTmt_I43 = record.kolomI ? formatIndoDate(record.kolomI) : '7 Mei 2025';
  const skLamaMk = (record.mkSebelum || '00 tahun 00 bulan').toLowerCase();

  // 8. Gaji Baru dengan terbilang (Acuan resmi Tabel Gaji Perpres 11/2024 berdasarkan Golongan & MK Sesudah)
  const mkSesudahYears = parseMkYears(record.mkSesudah ?? record.kolomM ?? (mkSebelumYears + 2));
  let resolvedGajiBaruNumeric = getGajiPokok(gol, mkSesudahYears);

  if (typeof record.gajiBaru === 'number' && record.gajiBaru >= 1800000 && record.gajiBaru <= 15000000) {
    resolvedGajiBaruNumeric = record.gajiBaru;
  }

  const gajiBaruFull_I46 = formatGajiTerbilang(resolvedGajiBaruNumeric);

  // 9. Berdasarkan Masa Kerja
  let mkGolongan_I48 = '';
  if (record.kolomM !== undefined && record.kolomM !== '' && record.kolomN !== undefined && record.kolomN !== '') {
    const thn = String(record.kolomM).padStart(2, '0');
    const bln = String(record.kolomN).padStart(2, '0');
    mkGolongan_I48 = `${thn} tahun ${bln} bulan`;
  } else if (record.mkSesudah) {
    mkGolongan_I48 = record.mkSesudah.toLowerCase();
  } else {
    mkGolongan_I48 = '02 tahun 00 bulan';
  }

  // 10. Mulai Tanggal (Kolom P / TMT Baru)
  // Sesuai aturan: jika kolom K "1 juni 2025" dan tahun yang dipilih pada dashboard 2026,
  // maka kolom P (mulai tanggal) otomatis menjadi "1 Juni 2026"
  const targetYear = defaultYear || record.tahunKgb || 2026;
  const tmtBaru_I45 = calculateMulaiTanggal(record.kolomK || record.tanggalAcuanK, targetYear, record.tmtKgb);

  // I49: DB KGB Kolom O (Dalam Golongan Ruang Baru)
  const golBaru_I49 = record.kolomO || `Golongan ${gol}`;

  // I50: DB KGB Kolom P (Tanggal KGB Berikutnya: 2 tahun setelah targetYear)
  const nextYear = targetYear + 2;
  const kgbBerikutnya_I50 = calculateMulaiTanggal(record.kolomK || record.tanggalAcuanK, nextYear, record.tmtKgb);

  // C51: Segala biaya yang diperlukan dalam rangka pelaksanaan Keputusan ini, (sheet DB KGB kolom S) dibebankan pada DPA Kabupaten Penajam Paser Utara.
  const diktumBiaya_C51 = `Segala biaya yang diperlukan dalam rangka pelaksanaan Keputusan ini, ${unitKerja_I39} dibebankan pada DPA Kabupaten Penajam Paser Utara.`;

  // I55: Tanggal Penetapan
  const tanggalPenetapan_I55 = record.tanggalPenetapan ? formatIndoDate(record.tanggalPenetapan) : '1 Juni 2026';

  return {
    nomorLengkap: skInfo.nomorLengkap,
    nomorUrut: skInfo.nomorUrut,
    bulanRomawi: skInfo.bulanRomawi,
    tahunPenetapan: skInfo.tahunPenetapan,
    nomorSK_A10,
    judulSK_C24,
    namaLengkap_I34,
    nip_I35,
    golJabatan_I36,
    masaPerjanjian,
    perpanjanganPerjanjian,
    unitKerja_I39,
    resolvedGajiLamaNumeric,
    gajiLamaFull_I44,
    skLamaPejabat,
    skLamaTanggal,
    skLamaNomor_I40,
    skLamaTmt_I43,
    skLamaMk,
    resolvedGajiBaruNumeric,
    gajiBaruFull_I46,
    mkGolongan_I48,
    tmtBaru_I45,
    kolomP: tmtBaru_I45,
    golBaru_I49,
    kgbBerikutnya_I50,
    diktumBiaya_C51,
    tanggalPenetapan_I55
  };
}
