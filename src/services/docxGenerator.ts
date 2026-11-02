import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import { KGBRecord, SKTemplateConfig, getSKRenderData } from '../types/kgb';

export async function generateDocxSK(
  record: KGBRecord,
  templateConfig: SKTemplateConfig,
  defaultYear: number = 2026
): Promise<void> {
  // 1. Ambil file template .docx dari folder public
  const response = await fetch('/template_kgb.docx');
  if (!response.ok) {
    throw new Error('Template .docx tidak ditemukan di folder public.');
  }
  const arrayBuffer = await response.arrayBuffer();

  // 2. Dapatkan data yang sudah diolah dari kgb.ts
  const skData = getSKRenderData(record, defaultYear);

  // 3. Siapkan data untuk dimasukkan ke dalam kurung kurawal {{...}}
  // Sesuaikan nama key di sini dengan yang ada di file Word Anda
  const dataToRender = {
    nomor_sk_lengkap: skData.nomorLengkap,
    nama: skData.namaLengkap_I34,
    nip: skData.nip_I35,
    golongan: record.kolomF || record.pangkatGol || '-',
    jabatan: record.kolomR || record.jabatan || '-',
    unit_kerja: skData.unitKerja_I39,
    gaji_lama_lengkap: skData.gajiLamaFull_I44,
    sk_lama_tanggal: skData.skLamaTanggal,
    sk_lama_nomor: skData.skLamaNomor_I40,
    kolom_k: skData.skLamaTmt_I43, // Tanggal berlaku gaji lama
    sk_lama_mk: skData.skLamaMk,
    gaji_baru_lengkap: skData.gajiBaruFull_I46,
    mk_golongan: skData.mkGolongan_I48,
    mulai_tanggal: skData.tmtBaru_I45,
    tanggal_penetapan: skData.tanggalPenetapan_I55,
    
    // Data untuk bagian tanda tangan
    ttd_pengirim: "", // Biarkan kosong jika tidak ada gambar ttd
    nama_pengirim: templateConfig.namaPenetap || 'SRIKANDI',
    nip_pengirim: templateConfig.nipPenetap || '........................'
  };

  // 4. Proses dokumen menggunakan Docxtemplater
  const zip = new PizZip(arrayBuffer);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    // PENTING: Karena template Anda menggunakan {{...}}, kita atur delimiternya
    delimiters: { start: '{{', end: '}}' } 
  });

  // 5. Render data ke dalam dokumen
  doc.render(dataToRender);

  // 6. Hasilkan file dan unduh
  const out = doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  
  const safeName = record.nama.replace(/[^a-zA-Z0-9]/g, '_');
  saveAs(out, `SK_KGB_${safeName}_${defaultYear}.docx`);
}