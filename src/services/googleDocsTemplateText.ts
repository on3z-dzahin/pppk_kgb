/**
 * Official Google Docs Template Text & Renderer
 * Grounded directly in /public/assets/aistudio/KGB__d87745b3
 */

import { KGBRecord } from '../types/kgb';
import { buildReplacementMap } from './googleDocs';

export const OFFICIAL_GOOGLE_DOCS_TEMPLATE_TEXT = `PEMERINTAH KABUPATEN PENAJAM PASER UTARA    
BADAN KEPEGAWAIAN DAN PENGEMBANGAN 
SUMBER DAYA MANUSIA
Jalan Propinsi Km. 09 Nipah-Nipah, Kec.Penajam, Penajam Paser Utara, Kalimantan Timur 76141  
Telp. (0542) 7201282, laman : bkd.penajamkab.go.id, Pos-el : info@bkd.penajamkab.go.id   

SURAT KEPUTUSAN KEPALA BADAN KEPEGAWAIAN DAN PENGEMBANGAN
SUMBER DAYA MANUSIA PENAJAM PASER UTARA
NOMOR : {{nomor_sk_lengkap}}

TENTANG
KENAIKAN GAJI BERKALA

DENGAN RAHMAT TUHAN YANG MAHA ESA

KEPALA BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA
PENAJAM PASER UTARA

Menimbang\t:\tBahwa untuk melaksanakan ketentuan Pasal 4 Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 7 Tahun 2023 tentang Kenaikan Gaji Berkala dan Kenaikan Gaji Istimewa Pegawai Pemerintah dengan Perjanjian Kerja, perlu menetapkan Keputusan Kepala Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten Penajam Paser Utara tentang Kenaikan Gaji Berkala;

Mengingat\t:\t1. Undang – Undang Nomor 20 Tahun 2023 tentang Aparatur Sipil Negara (Lembaran Negara Republik Indonesia Tahun 2014 Nomor 6, tambahan lembaran Negara Republik Indonesia Nomor 5494);
2. Peraturan Pemerintah Nomor 49 Tahun 2018 tentang Manajemen Pegawai Pemerintah dengan perjanjian Kerja (Lembaran Negara Republik Indonesia Tahun 2018 Nomor 224);
3. Peraturan Presiden Nomor 47 Tahun 2021 tentang Kementerian Pendayagunaan Aparatur Negara dan Reformasi Birokrasi (Lembaran Negara Republik Indonesia Tahun 2021 Nomor 126);
4. Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 60 Tahun 2021 tentang Organisasi dan Tata Kerja Kementerian Pendayagunaan Aparatur Negara dan Reformasi Birokrasi (Berita Negara Republik Indonesia Tahun 2021 Nomor 1249) sebagaimana telah diubah dengan Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 39 Tahun 2022 tentang Perubahan atas Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 60 Tahun 2021 tentang Organisasi dan Tata Kerja Kementerian Pendayagunaan Aparatur Negara dan Reformasi Birokrasi (Berita Negara Republik Indonesia Tahun 2022 Nomor 753);
5. Peraturan Menteri Pendayagunaan Aparatur Negara Nomor 7 Tahun 2023 tentang Kenaikan Gaji Berkala dan Kenaikan Gaji Istimewa bagi Pegawai Pemerintah dengan Perjanjian Kerja (Berita Negara Republik Indonesia Tahun 2023 Nomor 549);

M E M U T U S K A N

Menetapkan\t:\tKEPUTUSAN KEPALA BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA NOMOR {{nomor_sk_lengkap}} TENTANG KENAIKAN GAJI BERKALA.

KESATU\t:\tMemberikan Kenaikan Gaji Berkala kepada Pegawai Pemerintah dengan Perjanjian Kerja di bawah ini:
1.\tNama\t:\t{{nama}}
2.\tNIP\t:\t{{nip}}
3.\tGolongan/Jabatan\t:\t{{golongan}} / {{jabatan}}
4.\tMasa Perjanjian Kerja\t:\t5 Tahun
5.\tPerpanjangan Perjanjian Kerja\t:\t5 Tahun
6.\tKantor/ Unit Kerja\t:\t{{unit_kerja}}
7.\tGaji Lama\t:\t{{gaji_lama_lengkap}}

atas dasar surat keputusan terakhir tentang pangkat/ gaji yang ditetapkan:
1. Oleh pejabat\t:\tBupati Penajam Paser Utara
2. Tanggal\t:\t{{sk_lama_tanggal}}
3. Nomor\t:\t{{sk_lama_nomor}}
4. Tanggal Berlaku Gaji Tersebut\t:\t{{sk_lama_tmt}}
5. Masa Kerja Golongan\t:\t{{sk_lama_mk}}
Pada tanggal tersebut

diberikan kenaikan gaji berkala hingga memperoleh:
8.\tGaji baru\t:\t{{gaji_baru_lengkap}}
9.\tBerdasarkan masa kerja\t:\t{{mk_sesudah}}
10.\tMulai tanggal\t:\t{{tmt_baru}}

KEDUA\t:\tSegala biaya yang diperlukan dalam rangka pelaksanaan Keputusan ini, {{unit_kerja}} dibebankan pada DPA  Kabupaten Penajam Paser Utara
KETIGA\t:\tKeputusan ini mulai berlaku sejak tanggal ditetapkan.

Ditetapkan di        :        Penajam
Pada tanggal         :        {{tanggal_penetapan}}

        KEPALA BKPSDM,


        \${ttd_pengirim}






\${nama_pengirim}
NIP. \${nip_pengirim}

Tembusan Keputusan ini disampaikan kepada Yth:
1. Kepala Badan Keuangan dan Aset Daerah Kabupaten Penajam Paser Utara
2. Yang bersangkutan untuk di ketahui sebagaiamana mestinya.`;

/**
 * Render template text with record values
 */
export function renderGoogleDocsTemplateText(record: KGBRecord, defaultYear: number = 2026, rawTemplate?: string): string {
  let content = rawTemplate || OFFICIAL_GOOGLE_DOCS_TEMPLATE_TEXT;
  const replacements = buildReplacementMap(record, defaultYear);

  for (const [placeholder, value] of Object.entries(replacements)) {
    content = content.split(placeholder).join(value);
  }

  return content;
}
