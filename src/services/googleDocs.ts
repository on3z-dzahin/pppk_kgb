/**
 * Google Docs API Integration for SK KGB Generation
 * Duplicates a Google Docs template, populates placeholders with DB KGB data,
 * and exports pixel-perfect PDF via Google Drive/Docs API.
 */

import { KGBRecord, getSKRenderData, formatIndoDate } from '../types/kgb';
import { formatRupiah } from './salaryTable';

/**
 * Extract Google Doc ID from URL or bare ID string
 * e.g. "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit" -> "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
 */
export function extractDocId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const match = trimmed.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  // Direct file ID format
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

/**
 * Build a complete dictionary of text replacements for Google Docs
 * Supporting both canonical placeholders and aliases/typos
 */
export function buildReplacementMap(record: KGBRecord, defaultYear: number = 2026): Record<string, string> {
  const skData = getSKRenderData(record, defaultYear);

  return {
    // 1. Nomor SK & Tanggal Romawi
    '{{nomor_sk_lengkap}}': skData.nomorLengkap || skData.nomorSK_A10.replace('NOMOR : ', ''),
    '{{nomo_sk_lengkap}}': skData.nomorLengkap || skData.nomorSK_A10.replace('NOMOR : ', ''), // typo alias from user template
    '{{nomor_sk}}': skData.nomorUrut,
    '{{bulan_romawi}}': skData.bulanRomawi,
    '{{tahun_penetapan}}': skData.tahunPenetapan,
    '{{bulan_tahun_romawi}}': `${skData.bulanRomawi}/${skData.tahunPenetapan}`,

    // 2. Data Pegawai
    '{{nama}}': skData.namaLengkap_I34,
    '{{nama_lengkap}}': skData.namaLengkap_I34,
    '{{kolom_b}}': skData.namaLengkap_I34,
    '{{nip}}': skData.nip_I35,
    '{{kolom_c}}': skData.nip_I35,
    '{{golongan}}': record.kolomF || record.pangkatGol || 'V',
    '{{kolom_f}}': record.kolomF || record.pangkatGol || 'V',
    '{{jabatan}}': record.kolomR || record.jabatan || 'OPERATOR LAYANAN OPERASIONAL',
    '{{kolom_r}}': record.kolomR || record.jabatan || 'OPERATOR LAYANAN OPERASIONAL',
    '{{golongan_jabatan}}': skData.golJabatan_I36,
    '{{gol_jabatan}}': skData.golJabatan_I36,

    // 3. Perjanjian Kerja
    '{{masa_perjanjian}}': skData.masaPerjanjian,
    '{{masa_perjanjian_kerja}}': skData.masaPerjanjian,
    '{{perpanjangan_perjanjian}}': skData.perpanjanganPerjanjian,
    '{{perpanjangan_perjanjian_kerja}}': skData.perpanjanganPerjanjian,

    // 4. Unit Kerja
    '{{unit_kerja}}': skData.unitKerja_I39,
    '{{kolom_s}}': skData.unitKerja_I39,

    // 5. Gaji Pokok Lama & Terbilang
    '{{gaji_lama_lengkap}}': skData.gajiLamaFull_I44,
    '{{gaji_lama_terbilang}}': skData.gajiLamaFull_I44,
    '{{gaji_lama}}': formatRupiah(skData.resolvedGajiLamaNumeric),
    '{{kolom_j}}': formatRupiah(skData.resolvedGajiLamaNumeric),

    // 6. Rincian SK Lama
    '{{sk_lama_pejabat}}': skData.skLamaPejabat,
    '{{sk_lama_tanggal}}': skData.skLamaTanggal,
    '{{kolom_h}}': skData.skLamaTanggal,
    '{{sk_lama_nomor}}': skData.skLamaNomor_I40,
    '{{kolom_g}}': skData.skLamaNomor_I40,
    '{{sk_lama_tmt}}': skData.skLamaTmt_I43,
    '{{kolom_i}}': skData.skLamaTmt_I43,
    '{{sk_lama_mk}}': skData.skLamaMk,
    '{{mk_sebelum}}': skData.skLamaMk,

    // 7. Gaji Pokok Baru & Terbilang
    '{{gaji_baru_lengkap}}': skData.gajiBaruFull_I46,
    '{{gaji_baru_terbilang}}': skData.gajiBaruFull_I46,
    '{{gaji_baru}}': formatRupiah(skData.resolvedGajiBaruNumeric),
    '{{kolom_l}}': formatRupiah(skData.resolvedGajiBaruNumeric),

    // 8. Masa Kerja Baru & Mulai Tanggal (Kolom P / TMT Baru)
    '{{mk_sesudah}}': skData.mkGolongan_I48,
    '{{mk_golongan}}': skData.mkGolongan_I48,
    '{{tmt_baru}}': skData.tmtBaru_I45,
    '{{mulai_tanggal}}': skData.tmtBaru_I45,
    '{{kolom_p}}': skData.tmtBaru_I45,
    '{{kolom p}}': skData.tmtBaru_I45,
    '{{kolom_P}}': skData.tmtBaru_I45,
    '{{kolom P}}': skData.tmtBaru_I45,
    '{{KOLOM_P}}': skData.tmtBaru_I45,
    '{{tanggal_kolom_p}}': skData.tmtBaru_I45,
    '{{kolom_k}}': formatIndoDate(record.kolomK || record.tanggalAcuanK || '1 Juni 2025'),
    '{{kolom k}}': formatIndoDate(record.kolomK || record.tanggalAcuanK || '1 Juni 2025'),
    '{{kolom_K}}': formatIndoDate(record.kolomK || record.tanggalAcuanK || '1 Juni 2025'),
    '{{kolom K}}': formatIndoDate(record.kolomK || record.tanggalAcuanK || '1 Juni 2025'),
    '{{KOLOM_K}}': formatIndoDate(record.kolomK || record.tanggalAcuanK || '1 Juni 2025'),
    '{{tanggal_kolom_k}}': formatIndoDate(record.kolomK || record.tanggalAcuanK || '1 Juni 2025'),
    '{{tanggal_k}}': formatIndoDate(record.kolomK || record.tanggalAcuanK || '1 Juni 2025'),
    '{{tmt_k}}': formatIndoDate(record.kolomK || record.tanggalAcuanK || '1 Juni 2025'),
    '{{tmt_kolom_k}}': formatIndoDate(record.kolomK || record.tanggalAcuanK || '1 Juni 2025'),
    '{{tmt_lama}}': formatIndoDate(record.kolomK || record.kolomI || record.tanggalAcuanK || '1 Juni 2025'),
    '{{kgb_berikutnya}}': skData.kgbBerikutnya_I50,

    // 9. Penetapan
    '{{tanggal_penetapan}}': skData.tanggalPenetapan_I55
  };
}

/**
 * Generate SK PDF from Google Docs Template
 * 1. Copies template to a new Google Doc
 * 2. Executes batchUpdate with replaceAllText for all placeholders
 * 3. Exports directly to PDF via Google Drive API
 */
export async function generateSKFromGoogleDocsTemplate(
  templateDocId: string,
  record: KGBRecord,
  accessToken: string,
  folderId?: string
): Promise<{
  pdfBlob: Blob;
  filename: string;
  docId: string;
  webViewLink?: string;
}> {
  const cleanDocId = extractDocId(templateDocId);
  if (!cleanDocId) {
    throw new Error('ID atau link template Google Docs belum valid.');
  }

  const cleanName = (record.nama || 'Pegawai').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').trim();
  const docTitle = `SK KGB - ${record.nama}`;
  const filename = `SK_KGB_${cleanName}.pdf`;

  // 1. Copy template file in Google Drive
  const copyBody: any = {
    name: docTitle
  };
  if (folderId) {
    copyBody.parents = [folderId];
  }

  const copyRes = await fetch(`https://www.googleapis.com/drive/v3/files/${cleanDocId}/copy`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(copyBody)
  });

  if (!copyRes.ok) {
    const errJson = await copyRes.json().catch(() => ({}));
    throw new Error(
      errJson.error?.message ||
        'Gagal menyalin template Google Docs. Pastikan file template dapat diakses oleh akun Google Anda.'
    );
  }

  const copyData = await copyRes.json();
  const newDocId = copyData.id;

  try {
    // 2. Perform Batch Update on the new Google Doc to replace all placeholders
    const replacementMap = buildReplacementMap(record, record.tahunKgb || 2026);
    const requests = Object.entries(replacementMap).map(([findText, replaceText]) => ({
      replaceAllText: {
        containsText: {
          text: findText,
          matchCase: false
        },
        replaceText: replaceText || ''
      }
    }));

    const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${newDocId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });

    if (!updateRes.ok) {
      const errJson = await updateRes.json().catch(() => ({}));
      console.warn('Batch update Google Docs warning:', errJson);
    }

    // 3. Export new document directly as PDF
    const exportRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${newDocId}/export?mimeType=application/pdf`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (!exportRes.ok) {
      const err = await exportRes.text().catch(() => '');
      throw new Error(`Gagal mengekspor dokumen ke PDF: ${err || exportRes.statusText}`);
    }

    const pdfBlob = await exportRes.blob();

    return {
      pdfBlob,
      filename,
      docId: newDocId,
      webViewLink: `https://docs.google.com/document/d/${newDocId}/edit`
    };
  } catch (err: any) {
    // If export fails, attempt cleanup of duplicate doc if needed
    console.error('Error generating SK from Google Docs:', err);
    throw err;
  }
}

/**
 * Fetch raw text content from a connected Google Doc
 * Uses Google Docs API (if authenticated) or public text export.
 */
export async function fetchGoogleDocText(
  templateDocId: string,
  accessToken?: string | null
): Promise<string> {
  const cleanDocId = extractDocId(templateDocId);
  if (!cleanDocId) {
    throw new Error('ID atau link template Google Docs tidak valid.');
  }

  // 1. If accessToken is provided, call Google Docs API v1
  if (accessToken) {
    try {
      const res = await fetch(`https://docs.googleapis.com/v1/documents/${cleanDocId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        const textParts: string[] = [];

        const extractFromContent = (elements: any[]) => {
          for (const el of elements || []) {
            if (el.textRun?.content) {
              textParts.push(el.textRun.content);
            }
          }
        };

        const processBody = (contentList: any[]) => {
          for (const item of contentList || []) {
            if (item.paragraph?.elements) {
              extractFromContent(item.paragraph.elements);
            } else if (item.table?.tableRows) {
              for (const row of item.table.tableRows) {
                for (const cell of row.tableCells || []) {
                  processBody(cell.content);
                }
              }
            }
          }
        };

        processBody(data.body?.content);
        const joined = textParts.join('').trim();
        if (joined.length > 50) {
          return joined;
        }
      }
    } catch (e) {
      console.warn('Could not read via Docs API, trying txt export:', e);
    }
  }

  // 2. Try export endpoint (works if document is public / viewable with link)
  try {
    const res = await fetch(`https://docs.google.com/document/d/${cleanDocId}/export?format=txt`);
    if (res.ok) {
      const txt = await res.text();
      if (txt && txt.length > 50 && !txt.includes('<!DOCTYPE html>') && !txt.includes('<html')) {
        return txt.trim();
      }
    }
  } catch (e) {
    console.warn('Export txt fetch failed:', e);
  }

  // Fallback to official template text
  const { OFFICIAL_GOOGLE_DOCS_TEMPLATE_TEXT } = await import('./googleDocsTemplateText');
  return OFFICIAL_GOOGLE_DOCS_TEMPLATE_TEXT;
}

/**
 * Create a new official Google Docs Template file directly in user's Google Drive
 * populated with OFFICIAL_GOOGLE_DOCS_TEMPLATE_TEXT
 */
export async function createTemplateInUserGoogleDrive(
  accessToken: string,
  title: string = 'Template SK KGB PPPK - Penajam Paser Utara'
): Promise<{ docId: string; url: string }> {
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal membuat file Google Docs baru di Google Drive Anda.');
  }

  const docData = await createRes.json();
  const docId = docData.documentId;

  // Insert the official template text into the new Google Doc
  const { OFFICIAL_GOOGLE_DOCS_TEMPLATE_TEXT } = await import('./googleDocsTemplateText');
  const insertRes = await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: OFFICIAL_GOOGLE_DOCS_TEMPLATE_TEXT
          }
        }
      ]
    })
  });

  if (!insertRes.ok) {
    console.warn('Could not insert initial text into template doc:', await insertRes.text().catch(() => ''));
  }

  return {
    docId,
    url: `https://docs.google.com/document/d/${docId}/edit`
  };
}

