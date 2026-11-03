import { saveAs } from 'file-saver';
import { KGBRecord, getSKRenderData } from '../types/kgb';

// Ganti dengan URL Web App yang Anda dapatkan dari Google Apps Script
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzsWKwkB_nPxcLqPVgl0OJOt8eL_80d-zk7nRTFZc5nOhOMp8sIlDxNdYNpuUiLlrPCKw/exec';

export async function generatePdfViaGoogleAppsScript(record: KGBRecord, selectedYear: number) {
  // Siapkan data yang akan dikirim (gunakan getSKRenderData yang sudah ada)
  const skData = getSKRenderData(record, selectedYear);
  
  // Gabungkan data dengan info tambahan untuk pengirim
  const payload = {
    ...skData,
    golongan: record.kolomF || record.pangkatGol,
    jabatan: record.kolomR || record.jabatan,
    nama_pengirim: 'SRIKANDI', // Sesuaikan dengan template Anda
    nip_pengirim: '........................' // Sesuaikan dengan template Anda
  };

  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // Wajib text/plain untuk menghindari CORS
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.status === 'error') {
      throw new Error(result.message);
    }

    // Konversi Base64 menjadi Blob dan unduh
    const byteCharacters = atob(result.pdf);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    saveAs(blob, result.filename);
    return true;

  } catch (error) {
    console.error('Gagal membuat PDF via GAS:', error);
    throw error;
  }
}
