import { KGBRecord, SKTemplateConfig, calculateMulaiTanggal } from '../types/kgb';
import { formatMasaKerja, getGajiPokok, parseMkYears } from './salaryTable';
import { OFFICIAL_GOOGLE_DOCS_TEMPLATE_TEXT } from './googleDocsTemplateText';

export const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Rentang Acuan Tahun Kolom T sampai Kolom AD pada sheet DB KGB:
 * Kolom T  (index 19) = 2022
 * Kolom U  (index 20) = 2023
 * Kolom V  (index 21) = 2024
 * Kolom W  (index 22) = 2025
 * Kolom X  (index 23) = 2026
 * Kolom Y  (index 24) = 2027
 * Kolom Z  (index 25) = 2028
 * Kolom AA (index 26) = 2029
 * Kolom AB (index 27) = 2030
 * Kolom AC (index 28) = 2031
 * Kolom AD (index 29) = 2032
 */
export const ALL_KGB_YEARS: number[] = [
  2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032
];

export const COLUMN_T_AD_MAP: Record<number, number> = {
  19: 2022, // T
  20: 2023, // U
  21: 2024, // V
  22: 2025, // W
  23: 2026, // X
  24: 2027, // Y
  25: 2028, // Z
  26: 2029, // AA
  27: 2030, // AB
  28: 2031, // AC
  29: 2032  // AD
};

/**
 * Helper to check if a cell value in column T:AD is "C" (case-insensitive)
 */
export function isCellValC(cell: any): boolean {
  if (cell === null || cell === undefined) return false;
  const str = String(cell).trim().toUpperCase();
  if (str === 'C') return true;
  if (str.startsWith('C') && (str.length === 1 || str[1] === ' ' || str[1] === '/' || str[1] === '.' || str[1] === '-')) {
    return true;
  }
  return false;
}

/**
 * Check if a KGBRecord has value "C" in column T:AD for a specific year
 */
export function hasValueCForYear(record: KGBRecord, year: number): boolean {
  // 1. Direct check in yearDetails
  const cellVal = record.yearDetails?.[year]?.cellValue;
  if (cellVal !== undefined) {
    return isCellValC(cellVal);
  }
  // 2. Fallback to activeYears if yearDetails is not populated
  if (record.activeYears && record.activeYears.includes(year)) {
    return true;
  }
  return false;
}

/**
 * Parse Month from Kolom K (hanya bulannya saja: 1 - 12)
 * Handles:
 * - Indonesian & English month names ("Maret", "March", "Mar", etc.)
 * - Standard date strings ("01/03/2026", "2026-03-01", "1 Maret 2026")
 * - Plain month numbers ("3", "03")
 * - Excel/Sheets serial date numbers (~40000 to ~55000)
 */
export function extractMonthFromKolomK(val: any): number {
  if (val === null || val === undefined) return 1;
  const str = String(val).trim();
  if (!str) return 1;

  // Month names lookup in Indonesian & English
  const monthNamesLower = [
    ['januari', 'january', 'jan'],
    ['februari', 'february', 'feb'],
    ['maret', 'march', 'mar'],
    ['april', 'apr'],
    ['mei', 'may'],
    ['juni', 'june', 'jun'],
    ['juli', 'july', 'jul'],
    ['agustus', 'august', 'ags', 'agu', 'aug'],
    ['september', 'sep', 'sept'],
    ['oktober', 'october', 'okt', 'oct'],
    ['november', 'nov'],
    ['desember', 'december', 'des', 'dec']
  ];

  const lower = str.toLowerCase();
  for (let m = 0; m < monthNamesLower.length; m++) {
    for (const alias of monthNamesLower[m]) {
      // Use regex with boundary or word match to prevent false positives
      const regex = new RegExp(`\\b${alias}\\b`, 'i');
      if (regex.test(lower) || lower === alias) {
        return m + 1;
      }
    }
  }

  // ISO date format: YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = str.match(/^\d{4}[-/](\d{1,2})[-/]\d{1,2}/);
  if (isoMatch) {
    const month = parseInt(isoMatch[1], 10);
    if (month >= 1 && month <= 12) return month;
  }

  // Indonesian date format: DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^\d{1,2}[-/](\d{1,2})[-/]\d{2,4}/);
  if (dmyMatch) {
    const month = parseInt(dmyMatch[1], 10);
    if (month >= 1 && month <= 12) return month;
  }

  // Numeric check: plain number 1 - 12
  const num = parseInt(str, 10);
  if (!isNaN(num)) {
    if (num >= 1 && num <= 12) {
      return num;
    }
    // Excel / Google Sheets Serial Date Number (e.g. 46082 for 2026-03-01)
    if (num >= 35000 && num <= 60000) {
      const dateFromSerial = new Date((num - 25569) * 86400 * 1000);
      const m = dateFromSerial.getUTCMonth() + 1;
      if (m >= 1 && m <= 12) return m;
    }
  }

  return 1;
}

/**
 * Extract Year from Kolom K if present
 */
export function extractYearFromKolomK(val: any): number | null {
  if (!val) return null;
  const str = String(val).trim();
  const match = str.match(/\b(20\d{2})\b/);
  if (match) return parseInt(match[1], 10);

  // Check Excel serial number
  const num = parseInt(str, 10);
  if (!isNaN(num) && num >= 35000 && num <= 60000) {
    const dateFromSerial = new Date((num - 25569) * 86400 * 1000);
    return dateFromSerial.getUTCFullYear();
  }

  return null;
}

/**
 * Default SK Template configuration based on Indonesian government civil service format
 */
export const DEFAULT_TEMPLATE: SKTemplateConfig = {
  kopInstansi1: 'PEMERINTAH KABUPATEN PENAJAM PASER UTARA',
  kopInstansi2: 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
  kopAlamat: 'Jalan Propinsi Km. 09 Nipah-Nipah, Kec.Penajam, Penajam Paser Utara, Kalimantan Timur 76141',
  kopTelpEmail: 'Telp. (0542) 7201282, laman : bkd.penajamkab.go.id, Pos-el : info@bkd.penajamkab.go.id',
  kotaPenetapan: 'Penajam',
  jabatanPenetap: 'KEPALA BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA PENAJAM PASER UTARA',
  namaPenetap: '${nama_pengirim}',
  pangkatPenetap: '',
  nipPenetap: '${nip_pengirim}',
  nomorSuratFormat: '800.1.11.13/{nomor}/BKPSDM-PPPK/{bulanRomawi}/{tahun}',
  tujuanSurat: 'Kepala Badan Keuangan dan Aset Daerah Kabupaten Penajam Paser Utara',
  dasarHukum: '1. Undang – Undang Nomor 20 Tahun 2023 tentang Aparatur Sipil Negara (Lembaran Negara Republik Indonesia Tahun 2014 Nomor 6, tambahan lembaran Negara Republik Indonesia Nomor 5494);\n2. Peraturan Pemerintah Nomor 49 Tahun 2018 tentang Manajemen Pegawai Pemerintah dengan perjanjian Kerja (Lembaran Negara Republik Indonesia Tahun 2018 Nomor 224);\n3. Peraturan Presiden Nomor 47 Tahun 2021 tentang Kementerian Pendayagunaan Aparatur Negara dan Reformasi Birokrasi (Lembaran Negara Republik Indonesia Tahun 2021 Nomor 126);\n4. Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 60 Tahun 2021 tentang Organisasi dan Tata Kerja Kementerian PAN-RB sebagaimana telah diubah dengan PermenPAN-RB Nomor 39 Tahun 2022;\n5. Peraturan Menteri Pendayagunaan Aparatur Negara Nomor 7 Tahun 2023 tentang Kenaikan Gaji Berkala dan Kenaikan Gaji Istimewa bagi Pegawai Pemerintah dengan Perjanjian Kerja.',
  catatanKaki: 'Surat Keputusan ini disampaikan kepada yang bersangkutan untuk dipergunakan sebagaimana mestinya.',
  googleDocsTemplateId: '1HE3b6txpsid3vAqwxbmZu3p6sojQt4wmqN9jlml7L_Q',
  templateMode: 'google_docs',
  templateText: OFFICIAL_GOOGLE_DOCS_TEMPLATE_TEXT
};

/**
 * Default DB KGB dataset matching columns B, C, K, R, S, T:AD with value "C"
 * Sesuai contoh pengguna: untuk tahun 2026, pegawai memiliki value "C" pada kolom 2026 dengan bulan di Kolom K:
 * Januari (1), Februari (2), Maret (3), April (4), Juni (6), Juli (7), Oktober (10), November (11).
 * Pegawai dengan bulan Mei, Agustus, September, Desember TIDAK memiliki nilai "C" di 2026.
 */
export const DEFAULT_KGB_DATA: KGBRecord[] = [
  // 1. Contoh resmi sesuai file PDF lampiran: REGA BELL SAPUTRA MOLBET
  {
    id: 'kgb-rega-1',
    nama: 'REGA BELL SAPUTRA MOLBET',
    nip: '199012172025211005',
    pangkatGol: 'V',
    jabatan: 'OPERATOR LAYANAN OPERASIONAL',
    unitKerja: 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
    tmtKgb: '2025-06-01',
    bulanKgb: 6, // Juni
    tahunKgb: 2026,
    activeYears: [2024, 2026],
    yearDetails: {
      2024: { cellValue: 'C' },
      2026: { cellValue: 'C' }
    },
    kolomK: '1 Juni 2025',
    kolomP: '1 Juni 2026',
    tanggalAcuanK: '1 Juni 2025',
    nomorSk: '001',
    tanggalPenetapan: '2026-06-01',
    mkSebelum: '00 tahun 00 bulan',
    mkSesudah: '02 tahun 00 bulan',
    kolomM: '02',
    kolomN: '00',
    gajiLama: 2511500,
    gajiBaru: 2551100,
    kolomG: '800.1.13.2/1441/SK-BUP-PPPK/BKPSDM-PPIK',
    kolomH: '2025-05-07',
    kolomI: '2025-05-07',
    pejabatSkLama: 'Bupati Penajam Paser Utara',
    masaPerjanjianKerja: '5 Tahun',
    perpanjanganPerjanjianKerja: '5 Tahun',
    pejabatPenetap: 'KEPALA BKPSDM',
    isSaved: true
  },
  // 2. Februari (Bulan 2) - Kolom 2026 = "C"
  {
    id: 'kgb-feb-1',
    nama: 'AGUS SUPRIYADI, S.Pd.',
    nip: '19860618 201202 1 004',
    pangkatGol: 'IX',
    jabatan: 'Guru Ahli Muda',
    unitKerja: 'SMP Negeri 1 Satap',
    tmtKgb: '2026-02-01',
    bulanKgb: 2, // Februari
    tahunKgb: 2026,
    activeYears: [2022, 2024, 2026],
    yearDetails: {
      2022: { cellValue: 'C' },
      2024: { cellValue: 'C' },
      2026: { cellValue: 'C' }
    },
    tanggalAcuanK: '01/02/2026',
    nomorSk: '800.1.11.1/025/2026',
    tanggalPenetapan: '2026-01-20',
    mkSebelum: '06 tahun 00 bulan',
    mkSesudah: '08 tahun 00 bulan',
    gajiLama: 3515900,
    gajiBaru: 3626600,
    pejabatPenetap: 'Kepala BKPSDM',
    isSaved: true
  },
  // 3. Maret (Bulan 3) - Kolom 2026 = "C"
  {
    id: 'kgb-mar-1',
    nama: 'AHMAD FAUZI, S.Pd.',
    nip: '19880512 201402 1 003',
    pangkatGol: 'IX',
    jabatan: 'Guru Ahli Pertama',
    unitKerja: 'SMP Negeri 1 Satap',
    tmtKgb: '2026-03-01',
    bulanKgb: 3, // Maret
    tahunKgb: 2026,
    activeYears: [2022, 2024, 2026],
    yearDetails: {
      2022: { cellValue: 'C' },
      2024: { cellValue: 'C' },
      2026: { cellValue: 'C' }
    },
    tanggalAcuanK: '01/03/2026',
    nomorSk: '800.1.11.1/042/2026',
    tanggalPenetapan: '2026-02-20',
    mkSebelum: '03 tahun 00 bulan',
    mkSesudah: '05 tahun 00 bulan',
    gajiLama: 3203600,
    gajiBaru: 3408500,
    pejabatPenetap: 'Kepala BKPSDM',
    isSaved: true
  },
  {
    id: 'kgb-mar-2',
    nama: 'NURHAYATI, S.Kep., Ns.',
    nip: '19920315 201903 2 007',
    pangkatGol: 'X',
    jabatan: 'Perawat Ahli Pertama',
    unitKerja: 'RSUD dr. Soetomo',
    tmtKgb: '2026-03-01',
    bulanKgb: 3, // Maret
    tahunKgb: 2026,
    activeYears: [2022, 2024, 2026],
    yearDetails: {
      2022: { cellValue: 'C' },
      2024: { cellValue: 'C' },
      2026: { cellValue: 'C' }
    },
    tanggalAcuanK: '01/03/2026',
    nomorSk: '800.1.11.1/043/2026',
    tanggalPenetapan: '2026-02-20',
    mkSebelum: '04 tahun 00 bulan',
    mkSesudah: '06 tahun 00 bulan',
    gajiLama: 3552700,
    gajiBaru: 3664600,
    pejabatPenetap: 'Kepala BKPSDM',
    isSaved: true
  },
  {
    id: 'kgb-mar-3',
    nama: 'DEWI LESTARI, S.Sos.',
    nip: '19900104 201503 2 004',
    pangkatGol: 'IX',
    jabatan: 'Analis Kepegawaian',
    unitKerja: 'Badan Kepegawaian dan Pengembangan SDM',
    tmtKgb: '2026-03-01',
    bulanKgb: 3, // Maret
    tahunKgb: 2026,
    activeYears: [2022, 2024, 2026],
    yearDetails: {
      2022: { cellValue: 'C' },
      2024: { cellValue: 'C' },
      2026: { cellValue: 'C' }
    },
    tanggalAcuanK: '01/03/2026',
    nomorSk: '800.1.11.1/044/2026',
    tanggalPenetapan: '2026-02-22',
    mkSebelum: '04 tahun 00 bulan',
    mkSesudah: '06 tahun 00 bulan',
    gajiLama: 3408500,
    gajiBaru: 3515900,
    pejabatPenetap: 'Kepala BKPSDM',
    isSaved: true
  },
  // 4. April (Bulan 4) - Kolom 2026 = "C"
  {
    id: 'kgb-apr-1',
    nama: 'BUDI SANTOSO, S.T.',
    nip: '19850920 201101 1 005',
    pangkatGol: 'IX',
    jabatan: 'Pengawas Tata Bangunan',
    unitKerja: 'Dinas Pekerjaan Umum dan Penataan Ruang',
    tmtKgb: '2026-04-01',
    bulanKgb: 4, // April
    tahunKgb: 2026,
    activeYears: [2022, 2024, 2026],
    yearDetails: {
      2022: { cellValue: 'C' },
      2024: { cellValue: 'C' },
      2026: { cellValue: 'C' }
    },
    tanggalAcuanK: '01/04/2026',
    nomorSk: '800.1.11.1/065/2026',
    tanggalPenetapan: '2026-03-15',
    mkSebelum: '06 tahun 00 bulan',
    mkSesudah: '08 tahun 00 bulan',
    gajiLama: 3515900,
    gajiBaru: 3626600,
    pejabatPenetap: 'Kepala BKPSDM',
    isSaved: true
  },
  // 5. Juni (Bulan 6) - Kolom 2026 = "C"
  {
    id: 'kgb-jun-1',
    nama: 'RINA WULANDARI, A.Md.Keb.',
    nip: '19950410 202012 2 005',
    pangkatGol: 'VII',
    jabatan: 'Bidan Mahir',
    unitKerja: 'Puskesmas Cempaka Mulya',
    tmtKgb: '2026-06-01',
    bulanKgb: 6, // Juni
    tahunKgb: 2026,
    activeYears: [2022, 2024, 2026],
    yearDetails: {
      2022: { cellValue: 'C' },
      2024: { cellValue: 'C' },
      2026: { cellValue: 'C' }
    },
    tanggalAcuanK: '01/06/2026',
    nomorSk: '800.1.11.1/105/2026',
    tanggalPenetapan: '2026-05-15',
    mkSebelum: '03 tahun 00 bulan',
    mkSesudah: '05 tahun 00 bulan',
    gajiLama: 2858800,
    gajiBaru: 2948800,
    pejabatPenetap: 'Kepala BKPSDM',
    isSaved: true
  },
  // 6. Juli (Bulan 7) - Kolom 2026 = "C"
  {
    id: 'kgb-jul-1',
    nama: 'EKO PRASETYO, S.Kom.',
    nip: '19910909 201701 1 003',
    pangkatGol: 'IX',
    jabatan: 'Pranata Komputer Ahli Pertama',
    unitKerja: 'Dinas Komunikasi dan Informatika',
    tmtKgb: '2026-07-01',
    bulanKgb: 7, // Juli
    tahunKgb: 2026,
    activeYears: [2022, 2024, 2026],
    yearDetails: {
      2022: { cellValue: 'C' },
      2024: { cellValue: 'C' },
      2026: { cellValue: 'C' }
    },
    tanggalAcuanK: '01/07/2026',
    nomorSk: '800.1.11.1/120/2026',
    tanggalPenetapan: '2026-06-18',
    mkSebelum: '04 tahun 00 bulan',
    mkSesudah: '06 tahun 00 bulan',
    gajiLama: 3408500,
    gajiBaru: 3515900,
    pejabatPenetap: 'Kepala BKPSDM',
    isSaved: true
  },
  // 7. Oktober (Bulan 10) - Kolom 2026 = "C"
  {
    id: 'kgb-okt-1',
    nama: 'FITRIANI, S.Si.',
    nip: '19930811 201902 2 008',
    pangkatGol: 'IX',
    jabatan: 'Pranata Laboratorium Kesehatan',
    unitKerja: 'RSUD dr. Soetomo',
    tmtKgb: '2026-10-01',
    bulanKgb: 10, // Oktober
    tahunKgb: 2026,
    activeYears: [2022, 2024, 2026],
    yearDetails: {
      2022: { cellValue: 'C' },
      2024: { cellValue: 'C' },
      2026: { cellValue: 'C' }
    },
    tanggalAcuanK: '01/10/2026',
    nomorSk: '800.1.11.1/185/2026',
    tanggalPenetapan: '2026-09-20',
    mkSebelum: '04 tahun 00 bulan',
    mkSesudah: '06 tahun 00 bulan',
    gajiLama: 3408500,
    gajiBaru: 3515900,
    pejabatPenetap: 'Kepala BKPSDM',
    isSaved: true
  },
  // 8. November (Bulan 11) - Kolom 2026 = "C"
  {
    id: 'kgb-nov-1',
    nama: 'HENDRA KURNIAWAN, S.E.',
    nip: '19891115 201503 1 002',
    pangkatGol: 'X',
    jabatan: 'Pengelola Pengadaan Barang/Jasa',
    unitKerja: 'Bagian Pengadaan Barang dan Jasa',
    tmtKgb: '2026-11-01',
    bulanKgb: 11, // November
    tahunKgb: 2026,
    activeYears: [2022, 2024, 2026],
    yearDetails: {
      2022: { cellValue: 'C' },
      2024: { cellValue: 'C' },
      2026: { cellValue: 'C' }
    },
    tanggalAcuanK: '01/11/2026',
    nomorSk: '800.1.11.1/204/2026',
    tanggalPenetapan: '2026-10-22',
    mkSebelum: '06 tahun 00 bulan',
    mkSesudah: '08 tahun 00 bulan',
    gajiLama: 3664600,
    gajiBaru: 3780000,
    pejabatPenetap: 'Kepala BKPSDM',
    isSaved: true
  },
  // Pegawai Tanpa "C" di 2026 (Kolom 2025/2027 bernilai "C", 2026 TIDAK memiliki "C")
  {
    id: 'kgb-non-mei',
    nama: 'dr. HENDRA WIJAYA, Sp.A.',
    nip: '19830712 201001 1 012',
    pangkatGol: 'XI',
    jabatan: 'Dokter Spesialis Ahli Muda',
    unitKerja: 'RSUD dr. Soetomo',
    tmtKgb: '2025-05-01',
    bulanKgb: 5, // Mei (Hanya di 2025 & 2027)
    tahunKgb: 2025,
    activeYears: [2023, 2025, 2027],
    yearDetails: {
      2025: { cellValue: 'C' },
      2027: { cellValue: 'C' }
    },
    tanggalAcuanK: '01/05/2025',
    nomorSk: '800.1.11.1/088/2025',
    tanggalPenetapan: '2025-04-18',
    mkSebelum: '08 tahun 00 bulan',
    mkSesudah: '10 tahun 00 bulan',
    gajiLama: 3939900,
    gajiBaru: 4064000,
    pejabatPenetap: 'Kepala BKPSDM',
    isSaved: true
  },
  {
    id: 'kgb-non-ags',
    nama: 'TRI WAHYUNI, S.E.',
    nip: '19890214 201403 2 006',
    pangkatGol: 'IX',
    jabatan: 'Analis Keuangan Pusat dan Daerah',
    unitKerja: 'Badan Pengelola Keuangan dan Aset Daerah',
    tmtKgb: '2025-08-01',
    bulanKgb: 8, // Agustus (Hanya di 2025 & 2027)
    tahunKgb: 2025,
    activeYears: [2023, 2025, 2027],
    yearDetails: {
      2025: { cellValue: 'C' },
      2027: { cellValue: 'C' }
    },
    tanggalAcuanK: '01/08/2025',
    nomorSk: '800.1.11.1/312/2025',
    tanggalPenetapan: '2025-07-20',
    mkSebelum: '04 tahun 00 bulan',
    mkSesudah: '06 tahun 00 bulan',
    gajiLama: 3408500,
    gajiBaru: 3515900,
    pejabatPenetap: 'Kepala BKPSDM',
    isSaved: true
  },
  {
    id: 'kgb-non-sep',
    nama: 'DENNY SETIAWAN, S.T.',
    nip: '19910319 201802 1 003',
    pangkatGol: 'IX',
    jabatan: 'Pranata Komputer Mahir',
    unitKerja: 'Dinas Komunikasi dan Informatika',
    tmtKgb: '2025-09-01',
    bulanKgb: 9, // September (Hanya di 2025 & 2027)
    tahunKgb: 2025,
    activeYears: [2023, 2025, 2027],
    yearDetails: {
      2025: { cellValue: 'C' },
      2027: { cellValue: 'C' }
    },
    tanggalAcuanK: '01/09/2025',
    nomorSk: '800.1.11.1/345/2025',
    tanggalPenetapan: '2025-08-20',
    mkSebelum: '02 tahun 00 bulan',
    mkSesudah: '04 tahun 00 bulan',
    gajiLama: 3304400,
    gajiBaru: 3408500,
    pejabatPenetap: 'Kepala BKPSDM',
    isSaved: true
  },
  {
    id: 'kgb-non-des',
    nama: 'RATNA MUTIA, S.Pd.',
    nip: '19941210 202012 2 008',
    pangkatGol: 'IX',
    jabatan: 'Guru Bimbingan Konseling',
    unitKerja: 'SMP Negeri 1 Satap',
    tmtKgb: '2025-12-01',
    bulanKgb: 12, // Desember (Hanya di 2025 & 2027)
    tahunKgb: 2025,
    activeYears: [2023, 2025, 2027],
    yearDetails: {
      2025: { cellValue: 'C' },
      2027: { cellValue: 'C' }
    },
    tanggalAcuanK: '01/12/2025',
    nomorSk: '800.1.11.1/412/2025',
    tanggalPenetapan: '2025-11-20',
    mkSebelum: '02 tahun 00 bulan',
    mkSesudah: '04 tahun 00 bulan',
    gajiLama: 3304400,
    gajiBaru: 3408500,
    pejabatPenetap: 'Kepala BKPSDM',
    isSaved: true
  }
];

/**
 * Parse standard CSV with quoted strings and multiline cells
 */
export function parseCsvRows(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [''];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (c === '"' && inQuotes && next === '"') {
      row[row.length - 1] += '"';
      i++;
    } else if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      row.push('');
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') i++;
      result.push(row);
      row = [''];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
    result.push(row);
  }
  return result;
}

/**
 * Fetch Spreadsheet Data via Google Sheets API (jika login) atau Public CSV (jika tanpa login)
 */
export async function fetchSpreadsheetData(
  spreadsheetId: string,
  accessToken?: string | null,
  kgbSheetName: string = 'DB KGB',
  templateSheetName: string = 'TEMPLATE'
): Promise<{ records: KGBRecord[]; template?: SKTemplateConfig; error?: string }> {
  try {
    let rawRows: any[][] = [];
    let matchedTemplateSheet: string | null = templateSheetName;

    // 1. Jika pengguna memiliki accessToken (sudah login Google)
    if (accessToken) {
      try {
        const metaRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (metaRes.ok) {
          const metaData = await metaRes.json();
          const sheetTitles: string[] = metaData.sheets?.map((s: any) => s.properties?.title) || [];

          const matchedKgbSheet =
            sheetTitles.find(t => t.toLowerCase() === kgbSheetName.toLowerCase()) ||
            sheetTitles.find(t => t.toLowerCase().includes('db') || t.toLowerCase().includes('kgb')) ||
            sheetTitles[0] ||
            'DB KGB';

          matchedTemplateSheet =
            sheetTitles.find(t => t.toLowerCase() === templateSheetName.toLowerCase()) ||
            sheetTitles.find(t => t.toLowerCase().includes('template') || t.toLowerCase().includes('sk')) ||
            null;

          const kgbRes = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
              matchedKgbSheet
            )}?valueRenderOption=FORMATTED_VALUE`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (kgbRes.ok) {
            const kgbJson = await kgbRes.json();
            rawRows = kgbJson.values || [];
          }
        }
      } catch (authErr) {
        console.warn('Gagal memuat via Google API terautentikasi, mencoba jalur publik:', authErr);
      }
    }

    // 2. Fallback atau Akses Tanpa Login (Public Sheet CSV / GViz API)
    if (rawRows.length === 0) {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
        kgbSheetName
      )}`;

      const csvRes = await fetch(gvizUrl);
      if (!csvRes.ok) {
        throw new Error(
          'Tidak dapat mengakses Google Sheets. Jika tanpa login Google, pastikan akses berbagi spreadsheet diatur ke "Siapa saja yang memiliki link dapat melihat" (Viewer).'
        );
      }

      const csvText = await csvRes.text();
      // Verifikasi bukan halaman redirect login Google HTML
      if (csvText.includes('<!DOCTYPE html>') || csvText.includes('accounts.google.com')) {
        throw new Error(
          'Spreadsheet ini bersifat privat. Agar dapat diakses tanpa login, ubah izin berbagi Google Sheets ke "Siapa saja yang memiliki link dapat melihat". Atau klik Login Google.'
        );
      }

      rawRows = parseCsvRows(csvText);
    }

    if (rawRows.length < 2) {
      return { records: [], error: `Sheet '${kgbSheetName}' kosong atau tidak memiliki data` };
    }

    // Dynamic header row detection: scan first 10 rows
    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(10, rawRows.length); i++) {
      const rowLine = (rawRows[i] || []).map((c: any) => String(c).trim().toUpperCase()).join(' ');
      if (
        rowLine.includes('NAMA') ||
        rowLine.includes('NIP') ||
        rowLine.includes('JABATAN') ||
        rowLine.includes('2026') ||
        rowLine.includes('2022')
      ) {
        headerRowIndex = i;
        break;
      }
    }

    const headerRow = rawRows[headerRowIndex] || [];
    
    // Map column T (index 19) to AD (index 29) to years 2022 - 2032
    const colYearMap: Record<number, number> = {};
    for (let c = 19; c <= 29; c++) {
      const headerVal = String(headerRow[c] || '').trim();
      const yrMatch = headerVal.match(/\b(20\d{2})\b/);
      if (yrMatch) {
        colYearMap[c] = parseInt(yrMatch[1], 10);
      } else {
        colYearMap[c] = COLUMN_T_AD_MAP[c] || (2022 + (c - 19));
      }
    }

    const records: KGBRecord[] = [];

    // Process all data rows below header
    for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
      const row = rawRows[r];
      if (!row || row.length === 0) continue;

      // Kolom B: index 1 -> Nama
      const nama = String(row[1] || '').trim();
      if (!nama) continue;
      // Skip repeated header rows
      if (nama.toUpperCase() === 'NAMA' || nama.toUpperCase() === 'NAMA PEGAWAI') continue;

      // Kolom C: index 2 -> NIP
      const nip = String(row[2] || '').trim();

      // Kolom K: index 10 -> Bulan / Tanggal Acuan
      const colKVal = row[10] || '';
      const bulanKgb = extractMonthFromKolomK(colKVal);
      const yearFromK = extractYearFromKolomK(colKVal);

      // Kolom R: index 17 -> Jabatan
      const jabatan = String(row[17] || 'Pegawai').trim();

      // Kolom S: index 18 -> Unit Kerja
      const unitKerja = String(row[18] || 'Pemerintah Daerah').trim();

      // Kolom T:AD (indexes 19 to 29): Acuan Filter Tahun 2022 - 2032
      // Syarat mutlak dari user: Value di kolom T:AD adalah "C" (case-insensitive)
      const yearsWithC: number[] = [];
      const yearDetails: Record<number, { nomorSk?: string; tanggalPenetapan?: string; cellValue?: string }> = {};

      for (let c = 19; c <= 29; c++) {
        const yr = colYearMap[c] || (2022 + (c - 19));
        const cellRaw = String(row[c] || '').trim();

        if (cellRaw) {
          yearDetails[yr] = { cellValue: cellRaw };
        }

        if (isCellValC(cellRaw)) {
          yearsWithC.push(yr);
        }
      }

      // Record activeYears are STRICTLY years where column T:AD has value "C"
      const activeYears = [...yearsWithC];

      // Primary detected year
      const detectedYear = activeYears[0] || yearFromK || 2026;

      // Check existing MK / Golongan columns or fallbacks
      const pangkatGol = String(row[5] || row[3] || 'V').trim();
      const mkSebelum = formatMasaKerja(row[12] ? Math.max(0, parseInt(String(row[12]), 10) - 2) : '00');
      const mkSesudah = formatMasaKerja(row[12] || '02');
      const mkSebelumYears = parseMkYears(mkSebelum);
      const mkSesudahYears = parseMkYears(mkSesudah);
      const gajiLama = getGajiPokok(pangkatGol, mkSebelumYears);
      const gajiBaru = getGajiPokok(pangkatGol, mkSesudahYears);

      records.push({
        id: `row-${r}`,
        rowNumber: r + 1,
        kolomA: String(row[0] || '').trim(),
        kolomB: nama,
        kolomC: nip,
        kolomD: String(row[3] || '').trim(),
        kolomE: String(row[4] || '').trim(),
        kolomF: String(row[5] || pangkatGol).trim(),
        kolomG: String(row[6] || '').trim(),
        kolomH: String(row[7] || '').trim(),
        kolomI: String(row[8] || '').trim(),
        kolomJ: String(row[9] || '').trim(),
        kolomK: String(colKVal || '').trim(),
        kolomL: String(row[11] || '').trim(),
        kolomM: String(row[12] || '').trim(),
        kolomN: String(row[13] || '').trim(),
        kolomO: String(row[14] || '').trim(),
        kolomP: String(row[15] || '').trim() || calculateMulaiTanggal(String(colKVal || ''), detectedYear),
        kolomR: jabatan,
        kolomS: unitKerja,
        nama,
        nip,
        pangkatGol,
        jabatan,
        unitKerja,
        tmtKgb: `${detectedYear}-${String(bulanKgb).padStart(2, '0')}-01`,
        bulanKgb,
        tahunKgb: detectedYear,
        activeYears,
        yearDetails,
        tanggalAcuanK: String(colKVal),
        nomorSk: String(row[0] || ''),
        tanggalPenetapan: '',
        mkSebelum,
        mkSesudah,
        gajiLama,
        gajiBaru,
        pejabatPenetap: 'Kepala BKPSDM',
        isSaved: false
      });
    }

    // 3. Fetch TEMPLATE sheet if present
    let templateConfig: SKTemplateConfig | undefined = undefined;
    if (matchedTemplateSheet) {
      try {
        const tplRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
            matchedTemplateSheet
          )}!A1:B30?valueRenderOption=FORMATTED_VALUE`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (tplRes.ok) {
          const tplJson = await tplRes.json();
          const tplRows: any[][] = tplJson.values || [];
          const tplMap: Record<string, string> = {};
          tplRows.forEach(r => {
            if (r[0]) {
              tplMap[String(r[0]).trim().toLowerCase()] = String(r[1] || '').trim();
            }
          });

          templateConfig = {
            kopInstansi1: tplMap['kop1'] || tplMap['kop instansi 1'] || DEFAULT_TEMPLATE.kopInstansi1,
            kopInstansi2: tplMap['kop2'] || tplMap['kop instansi 2'] || DEFAULT_TEMPLATE.kopInstansi2,
            kopAlamat: tplMap['alamat'] || tplMap['kop alamat'] || DEFAULT_TEMPLATE.kopAlamat,
            kopTelpEmail: tplMap['kontak'] || tplMap['kop kontak'] || DEFAULT_TEMPLATE.kopTelpEmail,
            kotaPenetapan: tplMap['kota'] || tplMap['kota penetapan'] || DEFAULT_TEMPLATE.kotaPenetapan,
            jabatanPenetap: tplMap['jabatan penetap'] || DEFAULT_TEMPLATE.jabatanPenetap,
            namaPenetap: tplMap['nama penetap'] || DEFAULT_TEMPLATE.namaPenetap,
            pangkatPenetap: tplMap['pangkat penetap'] || DEFAULT_TEMPLATE.pangkatPenetap,
            nipPenetap: tplMap['nip penetap'] || DEFAULT_TEMPLATE.nipPenetap,
            nomorSuratFormat: tplMap['format nomor'] || DEFAULT_TEMPLATE.nomorSuratFormat,
            tujuanSurat: tplMap['tujuan surat'] || DEFAULT_TEMPLATE.tujuanSurat,
            dasarHukum: tplMap['dasar hukum'] || DEFAULT_TEMPLATE.dasarHukum,
            catatanKaki: tplMap['catatan kaki'] || DEFAULT_TEMPLATE.catatanKaki
          };
        }
      } catch (e) {
        console.warn('Could not read TEMPLATE sheet, using default template:', e);
      }
    }

    return { records, template: templateConfig };
  } catch (err: any) {
    return { records: [], error: err.message || 'Terjadi kesalahan saat memuat Google Sheets' };
  }
}

  const handleSaveRecord = async (id: string) => {
    // ... (kode sebelumnya)
    let savedToSheet = false;
    let sheetError = '';

    if (accessToken && spreadsheetInput) {
      showToast('Menyimpan ke Google Sheets...', 'info');
      
      // TANGKAP HASIL ERROR
      const result = await saveToRecordSheet(spreadsheetInput, accessToken, recordToSave, selectedYear);
      savedToSheet = result.success;
      if (!result.success) sheetError = result.error || 'Unknown error';
      
    } else {
      showToast('Peringatan: Anda belum Login Google. Data hanya disimpan lokal.', 'info');
    }

    // ... (simpan ke lokal)

    if (savedToSheet) {
      showToast('Data berhasil disimpan ke Sheets & Lokal!');
    } else if (sheetError) {
      showToast(`Gagal simpan ke Sheets: ${sheetError}`, 'error');
    } else {
      showToast('Data berhasil disimpan secara lokal!');
    }
  };
// Tambahkan fungsi ini di bagian paling bawah file googleSheets.ts
export async function saveToRecordSheet(
  record: KGBRecord,
  selectedYear: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // PASTIKAN URL INI ADALAH URL WEB APP GAS ANDA
    const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycb.../exec'; 

    const tanggalPenetapan = record.yearDetails?.[selectedYear]?.tanggalPenetapan || record.tanggalPenetapan || '';
    const nomorSk = record.yearDetails?.[selectedYear]?.nomorSk || record.nomorSk || '';
    const mulaiTanggal = record.kolomK ? `${record.kolomK}` : ''; 

    const payload = {
      nip: record.nip, nama: record.nama, unitKerja: record.unitKerja,
      nomorSk: nomorSk, mkSebelum: record.mkSebelum || '', mkSesudah: record.mkSesudah || '',
      tanggalPenetapan: tanggalPenetapan, mulaiTanggal: mulaiTanggal, tahun: selectedYear.toString()
    };

    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // WAJIB text/plain
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error saving to Sheets via GAS:', error);
    return { success: false, error: error.message };
  }
}
