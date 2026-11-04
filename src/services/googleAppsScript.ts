import { saveAs } from 'file-saver';
import { KGBRecord, getSKRenderData } from '../types/kgb';

const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycb.../exec'; // URL ANDA

export async function fetchPdfBase64FromGAS(record: KGBRecord, selectedYear: number) {
  const skData = getSKRenderData(record, selectedYear);
  const payload = {
    ...skData,
    golongan: record.kolomF || record.pangkatGol || '-',
    jabatan: record.kolomR || record.jabatan || '-',
    nama_pengirim: 'SRIKANDI',
    nip_pengirim: '........................'
  };

  const response = await fetch(GAS_WEB_APP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload)
  });

  // Tangkap jika respons bukan JSON (misal error server GAS)
  const text = await response.text();
  let result;
  try {
    result = JSON.parse(text);
  } catch (e) {
    console.error("Respons bukan JSON:", text.substring(0, 100));
    throw new Error('Gagal memproses PDF. Pastikan URL Web App Google Apps Script benar dan di-deploy untuk "Anyone".');
  }

  if (result.status === 'error') {
    throw new Error(result.message);
  }

  return { base64: result.pdf, filename: result.filename };
}

export async function generatePdfViaGoogleAppsScript(record: KGBRecord, selectedYear: number) {
  const { base64, filename } = await fetchPdfBase64FromGAS(record, selectedYear);
  
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'application/pdf' });

  saveAs(blob, filename);
  return true;
}
