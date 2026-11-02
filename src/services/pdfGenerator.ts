import { jsPDF } from 'jspdf';
import { KGBRecord, SKTemplateConfig, getSKRenderData } from '../types/kgb';
import { DEFAULT_TEMPLATE, INDONESIAN_MONTHS } from './googleSheets';
import { LOGO_PENAJAM_BASE64 } from './logoPenajam';

/**
 * Format date string into Indonesian formal format (e.g. "2026-06-01" -> "1 Juni 2026")
 */
export function formatIndonesianDate(dateStr?: string): string {
  if (!dateStr) return '1 Juni 2026';
  const match = dateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (match) {
    const year = match[1];
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    const monthName = INDONESIAN_MONTHS[month - 1] || 'Januari';
    return `${day} ${monthName} ${year}`;
  }
  const dmyMatch = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const year = dmyMatch[3];
    const monthName = INDONESIAN_MONTHS[month - 1] || 'Januari';
    return `${day} ${monthName} ${year}`;
  }
  return dateStr;
}

/**
 * Calculate Next KGB date (typically 2 years after TMT)
 */
export function calculateNextKgb(tmtStr?: string, tahun?: number, bulan?: number): string {
  const targetYear = (tahun || 2026) + 2;
  const targetMonth = bulan || 1;
  const monthName = INDONESIAN_MONTHS[targetMonth - 1] || 'Januari';
  return `1 ${monthName} ${targetYear}`;
}

/**
 * Render Page 1 of SK Decree (Surat Keputusan Hal 1: Kop, Judul, Menimbang, Mengingat, Memutuskan, Menetapkan)
 * Matched 1:1 with official Google Docs export: /public/assets/aistudio/SK_KGB_REGA_BELL_SAPUTRA_MOLBET__1__989ebd20.pdf
 */
function renderSKPage1(doc: jsPDF, record: KGBRecord, _template: SKTemplateConfig = DEFAULT_TEMPLATE, selectedYear?: number) {
  const skData = getSKRenderData(record, selectedYear || record.tahunKgb || 2026);
  const leftMargin = 25;
  const rightMargin = 190;
  const contentWidth = rightMargin - leftMargin; // 165mm

  let y = 16;

  // 1. KOP SURAT
  // Logo Kabupaten Penajam Paser Utara (Left aligned)
  try {
    doc.addImage(LOGO_PENAJAM_BASE64, 'JPEG', leftMargin + 2, y, 21, 26);
  } catch (err) {
    console.warn('Failed to render logo:', err);
  }

  // Kop Text (Centered between logo and right margin)
  const kopCenterX = 114;
  doc.setFont('times', 'bold');
  doc.setFontSize(12.5);
  doc.text('PEMERINTAH KABUPATEN PENAJAM PASER UTARA', kopCenterX, y + 3.5, { align: 'center' });
  doc.setFontSize(12.5);
  doc.text('BADAN KEPEGAWAIAN DAN PENGEMBANGAN', kopCenterX, y + 8.5, { align: 'center' });
  doc.setFontSize(14);
  doc.text('SUMBER DAYA MANUSIA', kopCenterX, y + 14, { align: 'center' });

  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.text('Jalan Propinsi Km. 09 Nipah-Nipah, Kec.Penajam, Penajam Paser Utara, Kalimantan Timur 76141', kopCenterX, y + 19, { align: 'center' });
  doc.text('Telp. (0542) 7201282, laman : bkd.penajamkab.go.id, Pos-el : info@bkd.penajamkab.go.id', kopCenterX, y + 23, { align: 'center' });

  // Single Solid Divider Line (Official Google Docs Format)
  y += 27;
  doc.setLineWidth(0.4);
  doc.line(leftMargin, y, rightMargin, y);

  // 2. JUDUL SURAT KEPUTUSAN
  const pageCenterX = 107.5; // (25 + 190) / 2
  y += 7;
  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.text('SURAT KEPUTUSAN KEPALA BADAN KEPEGAWAIAN DAN PENGEMBANGAN', pageCenterX, y, { align: 'center' });
  y += 4.5;
  doc.text('SUMBER DAYA MANUSIA PENAJAM PASER UTARA', pageCenterX, y, { align: 'center' });
  y += 4.5;
  const nomorFormatted = skData.nomorLengkap || `800.1.11.13/${skData.nomorUrut}/BKPSDM-PPPK/${skData.bulanRomawi}/${skData.tahunPenetapan}`;
  doc.text(`NOMOR : ${nomorFormatted}`, pageCenterX, y, { align: 'center' });

  y += 6.5;
  doc.text('TENTANG', pageCenterX, y, { align: 'center' });
  y += 4.5;
  doc.text('KENAIKAN GAJI BERKALA', pageCenterX, y, { align: 'center' });

  y += 6;
  doc.text('DENGAN RAHMAT TUHAN YANG MAHA ESA', pageCenterX, y, { align: 'center' });
  y += 4.5;
  doc.text('KEPALA BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA', pageCenterX, y, { align: 'center' });
  y += 4.5;
  doc.text('PENAJAM PASER UTARA', pageCenterX, y, { align: 'center' });

  // Tab offsets for Konsiderans
  const colLabelX = leftMargin; // 25
  const colColonX = leftMargin + 23; // 48
  const colTextX = leftMargin + 27; // 52
  const textMaxWidth = rightMargin - colTextX; // 138

  // 3. MENIMBANG
  y += 7.5;
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.text('Menimbang', colLabelX, y);
  doc.text(':', colColonX, y);
  const menimbang = 'Bahwa untuk melaksanakan ketentuan Pasal 4 Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 7 Tahun 2023 tentang Kenaikan Gaji Berkala dan Kenaikan Gaji Istimewa Pegawai Pemerintah dengan Perjanjian Kerja, perlu menetapkan Keputusan Kepala Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten Penajam Paser Utara tentang Kenaikan Gaji Berkala;';
  doc.text(menimbang, colTextX, y, { maxWidth: textMaxWidth, align: 'justify' });
  const menimbangLines = doc.splitTextToSize(menimbang, textMaxWidth);
  y += (menimbangLines.length * 4.4) + 2.5;

  // 4. MENGINGAT
  doc.text('Mengingat', colLabelX, y);
  doc.text(':', colColonX, y);

  const points = [
    'Undang – Undang Nomor 20 Tahun 2023 tentang Aparatur Sipil Negara (Lembaran Negara Republik Indonesia Tahun 2014 Nomor 6, tambahan lembaran Negara Republik Indonesia Nomor 5494);',
    'Peraturan Pemerintah Nomor 49 Tahun 2018 tentang Manajemen Pegawai Pemerintah dengan perjanjian Kerja (Lembaran Negara Republik Indonesia Tahun 2018 Nomor 224);',
    'Peraturan Presiden Nomor 47 Tahun 2021 tentang Kementerian Pendayagunaan Aparatur Negara dan Reformasi Birokrasi (Lembaran Negara Republik Indonesia Tahun 2021 Nomor 126);',
    'Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 60 Tahun 2021 tentang Organisasi dan Tata Kerja Kementerian Pendayagunaan Aparatur Negara dan Reformasi Birokrasi (Berita Negara Republik Indonesia Tahun 2021 Nomor 1249) sebagaimana telah diubah dengan Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 39 Tahun 2022 tentang Perubahan atas Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 60 Tahun 2021 tentang Organisasi dan Tata Kerja Kementerian Pendayagunaan Aparatur Negara dan Reformasi Birokrasi (Berita Negara Republik Indonesia Tahun 2022 Nomor 753);',
    'Peraturan Menteri Pendayagunaan Aparatur Negara Nomor 7 Tahun 2023 tentang Kenaikan Gaji Berkala dan Kenaikan Gaji Istimewa bagi Pegawai Pemerintah dengan Perjanjian Kerja (Berita Negara Republik Indonesia Tahun 2023 Nomor 549);'
  ];

  const itemNumX = colTextX; // 52
  const itemBodyX = colTextX + 5; // 57
  const itemBodyWidth = rightMargin - itemBodyX; // 133

  points.forEach((pt, idx) => {
    doc.text(`${idx + 1}.`, itemNumX, y);
    doc.text(pt, itemBodyX, y, { maxWidth: itemBodyWidth, align: 'justify' });
    const lines = doc.splitTextToSize(pt, itemBodyWidth);
    y += (lines.length * 4.4) + 2.2;
  });

  // 5. MEMUTUSKAN & MENETAPKAN
  y += 2;
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text('M E M U T U S K A N', pageCenterX, y, { align: 'center' });

  y += 5.5;
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.text('Menetapkan', colLabelX, y);
  doc.text(':', colColonX, y);
  doc.setFont('times', 'bold');
  const menetapkanText = `KEPUTUSAN KEPALA BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA NOMOR ${nomorFormatted} TENTANG KENAIKAN GAJI BERKALA.`;
  doc.text(menetapkanText, colTextX, y, { maxWidth: textMaxWidth, align: 'justify' });
}

/**
 * Render Page 2 of SK Decree (Surat Keputusan Hal 2: Diktum KESATU, KEDUA, KETIGA, TTD SRIKANDI, Tembusan)
 * Matched 1:1 with official Google Docs export: /public/assets/aistudio/SK_KGB_REGA_BELL_SAPUTRA_MOLBET__1__989ebd20.pdf
 */
function renderSKPage2(doc: jsPDF, record: KGBRecord, _template: SKTemplateConfig = DEFAULT_TEMPLATE, selectedYear?: number) {
  const skData = getSKRenderData(record, selectedYear || record.tahunKgb || 2026);
  const leftMargin = 25;
  const rightMargin = 190;
  const contentWidth = rightMargin - leftMargin;

  let y = 22;

  // DIKTUM KESATU
  const colColonKGBX = leftMargin + 23; // 48
  const colTextKGBX = leftMargin + 27;  // 52
  const textKGBWidth = rightMargin - colTextKGBX;

  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.text('KESATU', leftMargin, y);
  doc.text(':', colColonKGBX, y);
  doc.setFont('times', 'normal');
  doc.text('Memberikan Kenaikan Gaji Berkala kepada Pegawai Pemerintah dengan Perjanjian Kerja di bawah ini:', colTextKGBX, y, { maxWidth: textKGBWidth });

  y += 6.5;
  // Precise columns for employee details (all colons aligned at X=94mm)
  const colNumX = leftMargin + 8;    // 33mm
  const colLabelX = leftMargin + 14; // 39mm
  const colColonX = leftMargin + 69; // 94mm
  const colValX = leftMargin + 73;   // 98mm
  const valMaxWidth = rightMargin - colValX; // 92mm

  // 1. Nama (Bold)
  doc.text('1.', colNumX, y);
  doc.text('Nama', colLabelX, y);
  doc.text(':', colColonX, y);
  doc.setFont('times', 'bold');
  doc.text(skData.namaLengkap_I34, colValX, y);
  doc.setFont('times', 'normal');

  // 2. NIP
  y += 4.8;
  doc.text('2.', colNumX, y);
  doc.text('NIP', colLabelX, y);
  doc.text(':', colColonX, y);
  doc.text(skData.nip_I35, colValX, y);

  // 3. Golongan/ Jabatan
  y += 4.8;
  doc.text('3.', colNumX, y);
  doc.text('Golongan/ Jabatan', colLabelX, y);
  doc.text(':', colColonX, y);
  doc.text(skData.golJabatan_I36, colValX, y);

  // 4. Masa Perjanjian Kerja
  y += 4.8;
  doc.text('4.', colNumX, y);
  doc.text('Masa Perjanjian Kerja', colLabelX, y);
  doc.text(':', colColonX, y);
  doc.text(skData.masaPerjanjian, colValX, y);

  // 5. Perpanjangan Perjanjian Kerja
  y += 4.8;
  doc.text('5.', colNumX, y);
  doc.text('Perpanjangan Perjanjian Kerja', colLabelX, y);
  doc.text(':', colColonX, y);
  doc.text(skData.perpanjanganPerjanjian, colValX, y);

  // 6. Kantor/ Unit Kerja
  y += 4.8;
  doc.text('6.', colNumX, y);
  doc.text('Kantor/ Unit Kerja', colLabelX, y);
  doc.text(':', colColonX, y);
  doc.text(skData.unitKerja_I39, colValX, y, { maxWidth: valMaxWidth });
  const unitLines = doc.splitTextToSize(skData.unitKerja_I39, valMaxWidth);
  y += (unitLines.length > 1 ? (unitLines.length - 1) * 4.4 : 0);

  // 7. Gaji Lama
  y += 4.8;
  doc.text('7.', colNumX, y);
  doc.text('Gaji Lama', colLabelX, y);
  doc.text(':', colColonX, y);
  doc.text(skData.gajiLamaFull_I44, colValX, y, { maxWidth: valMaxWidth });
  const gajiLamaLines = doc.splitTextToSize(skData.gajiLamaFull_I44, valMaxWidth);
  y += (gajiLamaLines.length > 1 ? (gajiLamaLines.length - 1) * 4.4 : 0);

  // Sub-items 1 - 5 sesuai format Google Docs resmi
  y += 5.5;
  doc.text('atas dasar surat keputusan terakhir tentang pangkat/ gaji yang ditetapkan:', colLabelX, y);

  y += 4.6;
  const subNumX = colLabelX + 2; // 41mm
  const subLabelX = colLabelX + 8; // 47mm

  // 1. Oleh Pejabat
  doc.text('1.', subNumX, y);
  doc.text('Oleh Pejabat', subLabelX, y);
  doc.text(':', colColonX, y);
  doc.text(skData.skLamaPejabat, colValX, y);

  // 2. Tanggal
  y += 4.5;
  doc.text('2.', subNumX, y);
  doc.text('Tanggal', subLabelX, y);
  doc.text(':', colColonX, y);
  doc.text(skData.skLamaTanggal, colValX, y);

  // 3. Nomor
  y += 4.5;
  doc.text('3.', subNumX, y);
  doc.text('Nomor', subLabelX, y);
  doc.text(':', colColonX, y);
  doc.text(skData.skLamaNomor_I40, colValX, y);

  // 4. Tanggal Berlaku Gaji Tersebut
  y += 4.5;
  doc.text('4.', subNumX, y);
  doc.text('Tanggal Berlaku Gaji Tersebut', subLabelX, y);
  doc.text(':', colColonX, y);
  doc.text(skData.skLamaTmt_I43, colValX, y);

  // 5. Masa Kerja Golongan
  y += 4.5;
  doc.text('5.', subNumX, y);
  doc.text('Masa Kerja Golongan', subLabelX, y);
  doc.text(':', colColonX, y);
  doc.text(skData.skLamaMk, colValX, y);

  y += 4.2;
  doc.text('Pada Tanggal Tersebut', subLabelX, y);

  y += 4.6;
  doc.text('diberikan kenaikan gaji berkala hingga memperoleh:', colLabelX, y);

  // 8. Gaji Baru (Bold)
  y += 5.2;
  doc.text('8.', colNumX, y);
  doc.text('Gaji Baru', colLabelX, y);
  doc.text(':', colColonX, y);
  doc.setFont('times', 'bold');
  doc.text(skData.gajiBaruFull_I46, colValX, y, { maxWidth: valMaxWidth });
  doc.setFont('times', 'normal');
  const gajiBaruLines = doc.splitTextToSize(skData.gajiBaruFull_I46, valMaxWidth);
  y += (gajiBaruLines.length > 1 ? (gajiBaruLines.length - 1) * 4.4 : 0);

  // 9. Berdasarkan Masa Kerja
  y += 4.8;
  doc.text('9.', colNumX, y);
  doc.text('Berdasarkan Masa Kerja', colLabelX, y);
  doc.text(':', colColonX, y);
  doc.text(skData.mkGolongan_I48, colValX, y);

  // 10. Mulai Tanggal
  y += 4.8;
  doc.text('10.', colNumX, y);
  doc.text('Mulai Tanggal', colLabelX, y);
  doc.text(':', colColonX, y);
  doc.text(skData.tmtBaru_I45, colValX, y);

  // DIKTUM KEDUA
  y += 6.5;
  doc.setFont('times', 'bold');
  doc.text('KEDUA', leftMargin, y);
  doc.text(':', colColonKGBX, y);
  doc.setFont('times', 'normal');
  doc.text(skData.diktumBiaya_C51, colTextKGBX, y, { maxWidth: textKGBWidth, align: 'justify' });
  const biayaLines = doc.splitTextToSize(skData.diktumBiaya_C51, textKGBWidth);
  y += (biayaLines.length * 4.4) + 2.5;

  // DIKTUM KETIGA
  doc.setFont('times', 'bold');
  doc.text('KETIGA', leftMargin, y);
  doc.text(':', colColonKGBX, y);
  doc.setFont('times', 'normal');
  doc.text('Keputusan ini mulai berlaku sejak tanggal ditetapkan.', colTextKGBX, y);

  // TANGGAL PENETAPAN & TANDA TANGAN SRIKANDI
  y += 6.5;
  const ttdX = 122;
  doc.text('Ditetapkan di  :  Penajam', ttdX, y);
  y += 4.5;
  doc.text(`Pada Tanggal   :  ${skData.tanggalPenetapan_I55}`, ttdX, y);

  y += 5.5;
  doc.setFont('times', 'bold');
  doc.text('KEPALA BKPSDM,', ttdX, y);

  // Placeholder SRIKANDI (${ttd_pengirim})
  y += 12;
  doc.setFont('times', 'normal');
  doc.text('${ttd_pengirim}', ttdX, y);

  y += 12;
  doc.setFont('times', 'bold');
  doc.text('${nama_pengirim}', ttdX, y);
  y += 4.5;
  doc.setFont('times', 'normal');
  doc.text('NIP. ${nip_pengirim}', ttdX, y);

  // TEMBUSAN (Bottom Left)
  y = 265;
  doc.setFontSize(8);
  doc.setFont('times', 'bold');
  doc.text('Tembusan Keputusan ini disampaikan kepada Yth:', leftMargin, y);
  y += 4;
  doc.setFont('times', 'normal');
  doc.text('1. Kepala Badan Keuangan dan Aset Daerah Kabupaten Penajam Paser Utara', leftMargin, y);
  y += 3.5;
  doc.text('2. Yang bersangkutan untuk di ketahui sebagaiamana mestinya.', leftMargin, y);
}

/**
 * Render complete 2-page SK Document for an employee
 */
export function renderSKPage(
  doc: jsPDF,
  record: KGBRecord,
  template: SKTemplateConfig = DEFAULT_TEMPLATE,
  selectedYear?: number
) {
  renderSKPage1(doc, record, template, selectedYear);
  doc.addPage();
  renderSKPage2(doc, record, template, selectedYear);
}

/**
 * Generate PDF for a Single Employee (2 pages)
 * File name: automatically based on employee name
 */
export function generateSingleEmployeePdf(
  record: KGBRecord,
  template: SKTemplateConfig = DEFAULT_TEMPLATE,
  selectedYear?: number
): { doc: jsPDF; filename: string; blob: Blob } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  renderSKPage(doc, record, template, selectedYear);

  const cleanName = (record.nama || 'Pegawai').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').trim();
  const filename = `SK_KGB_${cleanName}.pdf`;
  const blob = doc.output('blob');

  return { doc, filename, blob };
}

/**
 * Generate Multi-Page PDF for a Unit Kerja
 * File name: automatically based on unit kerja name
 * Contains all employees in this unit kerja in one PDF document (2 pages per employee).
 */
export function generateUnitKerjaPdf(
  unitKerja: string,
  records: KGBRecord[],
  template: SKTemplateConfig = DEFAULT_TEMPLATE,
  selectedYear?: number
): { doc: jsPDF; filename: string; blob: Blob; count: number } {
  const matchingRecords = records.filter(
    r => (r.kolomS || r.unitKerja || '').toLowerCase().trim() === unitKerja.toLowerCase().trim()
  );

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  matchingRecords.forEach((record, index) => {
    if (index > 0) {
      doc.addPage();
    }
    renderSKPage(doc, record, template, selectedYear);
  });

  const cleanUnit = (unitKerja || 'Unit_Kerja').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').trim();
  const filename = `SK_KGB_${cleanUnit}.pdf`;
  const blob = doc.output('blob');

  return { doc, filename, blob, count: matchingRecords.length };
}

/**
 * Download Blob to User Browser
 */
export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
