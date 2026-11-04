import { saveAs } from 'file-saver';
import { KGBRecord, getSKRenderData } from '../types/kgb';
import { KGBRecord, getSKRenderData, formatIndoDate } from '../types/kgb';

// PASTIKAN URL INI ADALAH URL WEB APP ANDA YANG TERBARU
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzsWKwkB_nPxcLqPVgl0OJOt8eL_80d-zk7nRTFZc5nOhOMp8sIlDxNdYNpuUiLlrPCKw/exec'; 

// Fungsi Fetch dengan sistem Retry (Coba Ulang)
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error; // Jika percobaan terakhir, lempar error
      // Tunggu sebentar (delay) sebelum mencoba lagi
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Gagal terhubung ke Google Server');
}

export async function fetchPdfBase64FromGAS(record: KGBRecord, selectedYear: number) {
  const skData = getSKRenderData(record, selectedYear);
  const payload = {
    ...skData,
    kolom_k: formatIndoDate(record.kolomK || record.tanggalAcuanK),
    
    golongan: record.kolomF || record.pangkatGol || '-',
    jabatan: record.kolomR || record.jabatan || '-',
    nama_pengirim: 'SRIKANDI',
    nip_pengirim: '........................'
  };

  const response = await fetchWithRetry(GAS_WEB_APP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  let result;
  try {
    result = JSON.parse(text);
  } catch (e) {
    throw new Error('Google Apps Script error. Pastikan script sudah di-deploy versi terbaru.');
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
