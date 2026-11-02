import React, { useState } from 'react';
import { KGBRecord, SKTemplateConfig, getSKRenderData } from '../types/kgb';
import { generateSingleEmployeePdf, triggerDownload } from '../services/pdfGenerator';
import { LOGO_PENAJAM_BASE64 } from '../services/logoPenajam';
import { X, Download, HardDrive, FileText, ShieldCheck, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface SKPreviewModalProps {
  record: KGBRecord | null;
  template: SKTemplateConfig;
  onClose: () => void;
  onUploadToDrive: (record: KGBRecord) => void;
  isDriveReady: boolean;
  accessToken?: string | null;
  onUpdateTemplate?: (newTemplate: SKTemplateConfig) => void;
  selectedYear?: number;
}

export const SKPreviewModal: React.FC<SKPreviewModalProps> = ({
  record,
  template,
  onClose,
  onUploadToDrive,
  isDriveReady,
  selectedYear
}) => {
  if (!record) return null;

  const [pageView, setPageView] = useState<'both' | '1' | '2'>('both');
  const [isGeneratingDocs, setIsGeneratingDocs] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const targetYear = selectedYear || record.tahunKgb || 2026;
  const skData = getSKRenderData(record, targetYear);
  const nomorFormatted = skData.nomorLengkap || `800.1.11.13/${skData.nomorUrut}/BKPSDM-PPPK/${skData.bulanRomawi}/${skData.tahunPenetapan}`;

  const handleDownloadPdf = () => {
    setIsGeneratingDocs(true);
    setStatusNotice('Sedang mengunduh PDF SK sesuai template resmi Google Docs...');
    try {
      const { blob, filename } = generateSingleEmployeePdf(record, template, targetYear);
      triggerDownload(blob, filename);
      setStatusNotice(`Berhasil mengunduh dokumen resmi ${filename}!`);
    } catch (err: any) {
      setStatusNotice(`Gagal mengunduh: ${err.message || 'Kesalahan sistem'}`);
    } finally {
      setIsGeneratingDocs(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] w-full max-w-5xl max-h-[96vh] flex flex-col border border-white/15 overflow-hidden text-slate-100">
        
        {/* Modal Topbar */}
        <div className="px-6 py-4 bg-slate-950/90 text-white flex items-center justify-between border-b border-white/10 shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-cyan-500/15 text-cyan-400 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-white leading-tight tracking-tight">
                  Pratinjau Surat Keputusan (SK) KGB
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  Template Resmi Google Docs (KGB PPPK PPU)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {skData.namaLengkap_I34} &bull; NIP. {skData.nip_I35} &bull; Golongan {record.kolomF || record.pangkatGol}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Download PDF Pegawai */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingDocs}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white transition shadow-[0_0_20px_rgba(59,130,246,0.35)] active:scale-95 cursor-pointer disabled:opacity-50 border border-cyan-400/40"
              title="Unduh PDF SK KGB resmi sesuai template Google Docs"
            >
              <Download className="w-4 h-4 text-cyan-200" />
              <span>{isGeneratingDocs ? 'Memproses PDF...' : 'Unduh PDF SK'}</span>
            </button>

            {/* Simpan ke Drive */}
            <button
              onClick={() => onUploadToDrive(record)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition shadow-[0_0_15px_rgba(16,185,129,0.2)] active:scale-95 cursor-pointer"
              title="Simpan otomatis ke Google Drive"
            >
              <HardDrive className="w-4 h-4 text-emerald-300" />
              <span>Simpan ke Drive</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition ml-1 cursor-pointer border border-transparent hover:border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-header: Page View Selector & SRIKANDI Notice */}
        <div className="bg-slate-950/60 border-b border-white/10 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 backdrop-blur-md">
          
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/10 shadow-inner">
            <button
              onClick={() => setPageView('both')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                pageView === 'both'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              2 Halaman Lengkap
            </button>
            <button
              onClick={() => setPageView('1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                pageView === '1'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Halaman 1
            </button>
            <button
              onClick={() => setPageView('2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                pageView === '2'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Halaman 2
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 px-3.5 py-1.5 rounded-xl border border-amber-500/30 font-medium">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>SRIKANDI Valid:</strong> Tag TTE <code className="font-mono font-bold text-amber-300">${'{'}ttd_pengirim{'}'}</code> dipertahankan resmi.
            </span>
          </div>

        </div>

        {statusNotice && (
          <div className="px-6 py-2.5 bg-cyan-950/40 border-b border-cyan-500/30 text-xs text-cyan-200 flex items-center justify-between backdrop-blur-md">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              {statusNotice}
            </span>
            <button onClick={() => setStatusNotice(null)} className="text-cyan-400 hover:text-white font-bold ml-2">×</button>
          </div>
        )}

        {/* Document Sheet Viewer (A4 Paper emulation matching Google Docs export) */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto bg-slate-300/70 flex flex-col items-center gap-8 flex-1">
          
          {/* ===================== HALAMAN 1 ===================== */}
          {(pageView === 'both' || pageView === '1') && (
            <div className="bg-white w-full max-w-[210mm] shadow-2xl border border-slate-300 p-8 sm:p-14 text-slate-900 font-serif text-[11.5px] leading-relaxed relative rounded-xs min-h-[297mm] flex flex-col justify-between">
              <div>
                
                {/* Kop Surat Resmi */}
                <div className="flex items-center gap-4 pb-2 relative">
                  <img
                    src={LOGO_PENAJAM_BASE64}
                    alt="Logo Kabupaten Penajam Paser Utara"
                    className="w-16 h-20 object-contain shrink-0"
                  />
                  <div className="flex-1 text-center pr-12">
                    <h2 className="text-[13px] font-bold tracking-normal uppercase text-black font-serif leading-tight">
                      PEMERINTAH KABUPATEN PENAJAM PASER UTARA
                    </h2>
                    <h2 className="text-[13px] font-bold tracking-normal uppercase text-black font-serif leading-tight mt-0.5">
                      BADAN KEPEGAWAIAN DAN PENGEMBANGAN
                    </h2>
                    <h1 className="text-[14.5px] font-bold tracking-normal uppercase text-black font-serif leading-tight mt-0.5">
                      SUMBER DAYA MANUSIA
                    </h1>
                    <p className="text-[9px] text-black mt-1">
                      Jalan Propinsi Km. 09 Nipah-Nipah, Kec.Penajam, Penajam Paser Utara, Kalimantan Timur 76141
                    </p>
                    <p className="text-[8.5px] text-black">
                      Telp. (0542) 7201282, laman : bkd.penajamkab.go.id, Pos-el : info@bkd.penajamkab.go.id
                    </p>
                  </div>
                </div>

                {/* Single Solid Divider Line */}
                <div className="border-b-[1.5px] border-black mb-5" />

                {/* Judul Dokumen SK */}
                <div className="text-center mb-5 space-y-0.5 text-black">
                  <h3 className="font-bold text-[11px] uppercase tracking-normal">
                    SURAT KEPUTUSAN KEPALA BADAN KEPEGAWAIAN DAN PENGEMBANGAN
                  </h3>
                  <h3 className="font-bold text-[11px] uppercase tracking-normal">
                    SUMBER DAYA MANUSIA PENAJAM PASER UTARA
                  </h3>
                  <p className="font-bold text-[11px] uppercase tracking-normal">
                    NOMOR : {nomorFormatted}
                  </p>

                  <div className="pt-2">
                    <p className="font-bold text-[11px] uppercase">
                      TENTANG
                    </p>
                    <p className="font-bold text-[11px] uppercase">
                      KENAIKAN GAJI BERKALA
                    </p>
                  </div>

                  <div className="pt-2">
                    <p className="font-bold text-[11px] uppercase">
                      DENGAN RAHMAT TUHAN YANG MAHA ESA
                    </p>
                    <p className="font-bold text-[11px] uppercase">
                      KEPALA BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA
                    </p>
                    <p className="font-bold text-[11px] uppercase">
                      PENAJAM PASER UTARA
                    </p>
                  </div>
                </div>

                {/* Menimbang & Mengingat */}
                <div className="space-y-3 mb-4 text-[10.5px]">
                  
                  {/* Menimbang */}
                  <div className="flex items-start">
                    <span className="w-24 shrink-0 font-normal">Menimbang</span>
                    <span className="w-5 shrink-0 text-center">:</span>
                    <p className="text-justify text-black leading-relaxed flex-1">
                      Bahwa untuk melaksanakan ketentuan Pasal 4 Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 7 Tahun 2023 tentang Kenaikan Gaji Berkala dan Kenaikan Gaji Istimewa Pegawai Pemerintah dengan Perjanjian Kerja, perlu menetapkan Keputusan Kepala Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten Penajam Paser Utara tentang Kenaikan Gaji Berkala;
                    </p>
                  </div>

                  {/* Mengingat */}
                  <div className="flex items-start">
                    <span className="w-24 shrink-0 font-normal">Mengingat</span>
                    <span className="w-5 shrink-0 text-center">:</span>
                    <div className="text-justify text-black space-y-2 leading-relaxed flex-1">
                      <div className="flex items-start">
                        <span className="w-5 shrink-0">1.</span>
                        <p className="flex-1">Undang – Undang Nomor 20 Tahun 2023 tentang Aparatur Sipil Negara (Lembaran Negara Republik Indonesia Tahun 2014 Nomor 6, tambahan lembaran Negara Republik Indonesia Nomor 5494);</p>
                      </div>
                      <div className="flex items-start">
                        <span className="w-5 shrink-0">2.</span>
                        <p className="flex-1">Peraturan Pemerintah Nomor 49 Tahun 2018 tentang Manajemen Pegawai Pemerintah dengan perjanjian Kerja (Lembaran Negara Republik Indonesia Tahun 2018 Nomor 224);</p>
                      </div>
                      <div className="flex items-start">
                        <span className="w-5 shrink-0">3.</span>
                        <p className="flex-1">Peraturan Presiden Nomor 47 Tahun 2021 tentang Kementerian Pendayagunaan Aparatur Negara dan Reformasi Birokrasi (Lembaran Negara Republik Indonesia Tahun 2021 Nomor 126);</p>
                      </div>
                      <div className="flex items-start">
                        <span className="w-5 shrink-0">4.</span>
                        <p className="flex-1">Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 60 Tahun 2021 tentang Organisasi dan Tata Kerja Kementerian Pendayagunaan Aparatur Negara dan Reformasi Birokrasi (Berita Negara Republik Indonesia Tahun 2021 Nomor 1249) sebagaimana telah diubah dengan Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 39 Tahun 2022 tentang Perubahan atas Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 60 Tahun 2021 tentang Organisasi dan Tata Kerja Kementerian Pendayagunaan Aparatur Negara dan Reformasi Birokrasi (Berita Negara Republik Indonesia Tahun 2022 Nomor 753);</p>
                      </div>
                      <div className="flex items-start">
                        <span className="w-5 shrink-0">5.</span>
                        <p className="flex-1">Peraturan Menteri Pendayagunaan Aparatur Negara Nomor 7 Tahun 2023 tentang Kenaikan Gaji Berkala dan Kenaikan Gaji Istimewa bagi Pegawai Pemerintah dengan Perjanjian Kerja (Berita Negara Republik Indonesia Tahun 2023 Nomor 549);</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* MEMUTUSKAN */}
                <div className="text-center font-bold text-[11px] tracking-widest my-4">
                  M E M U T U S K A N
                </div>

                {/* Menetapkan */}
                <div className="flex items-start text-[10.5px]">
                  <span className="w-24 shrink-0 font-normal">Menetapkan</span>
                  <span className="w-5 shrink-0 text-center">:</span>
                  <p className="font-bold text-black leading-relaxed text-justify flex-1">
                    KEPUTUSAN KEPALA BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA NOMOR {nomorFormatted} TENTANG KENAIKAN GAJI BERKALA.
                  </p>
                </div>

              </div>

              {/* Page 1 Footer indicator */}
              <div className="pt-6 text-center text-[10px] text-slate-400 font-sans border-t border-slate-100">
                - Halaman 1 dari 2 -
              </div>
            </div>
          )}

          {/* ===================== HALAMAN 2 ===================== */}
          {(pageView === 'both' || pageView === '2') && (
            <div className="bg-white w-full max-w-[210mm] shadow-2xl border border-slate-300 p-8 sm:p-14 text-slate-900 font-serif text-[10.5px] leading-relaxed relative rounded-xs min-h-[297mm] flex flex-col justify-between">
              <div>
                
                {/* DIKTUM KESATU */}
                <div className="flex items-start mb-2">
                  <span className="w-20 shrink-0 font-bold">KESATU</span>
                  <span className="w-4 shrink-0 text-center">:</span>
                  <p className="text-black flex-1">
                    Memberikan Kenaikan Gaji Berkala kepada Pegawai Pemerintah dengan Perjanjian Kerja di bawah ini:
                  </p>
                </div>

                {/* Data Pegawai Rincian 1 - 7 */}
                <div className="ml-8 space-y-1 mb-2">
                  
                  {/* 1. Nama */}
                  <div className="flex items-start py-0.5">
                    <span className="w-6 shrink-0">1.</span>
                    <span className="w-48 shrink-0">Nama</span>
                    <span className="w-4 shrink-0 text-center">:</span>
                    <span className="font-bold text-black flex-1 uppercase">
                      {skData.namaLengkap_I34}
                    </span>
                  </div>

                  {/* 2. NIP */}
                  <div className="flex items-start py-0.5">
                    <span className="w-6 shrink-0">2.</span>
                    <span className="w-48 shrink-0">NIP</span>
                    <span className="w-4 shrink-0 text-center">:</span>
                    <span className="text-black flex-1">
                      {skData.nip_I35}
                    </span>
                  </div>

                  {/* 3. Golongan/ Jabatan */}
                  <div className="flex items-start py-0.5">
                    <span className="w-6 shrink-0">3.</span>
                    <span className="w-48 shrink-0">Golongan/ Jabatan</span>
                    <span className="w-4 shrink-0 text-center">:</span>
                    <span className="text-black flex-1">
                      {skData.golJabatan_I36}
                    </span>
                  </div>

                  {/* 4. Masa Perjanjian Kerja */}
                  <div className="flex items-start py-0.5">
                    <span className="w-6 shrink-0">4.</span>
                    <span className="w-48 shrink-0">Masa Perjanjian Kerja</span>
                    <span className="w-4 shrink-0 text-center">:</span>
                    <span className="text-black flex-1">
                      {skData.masaPerjanjian}
                    </span>
                  </div>

                  {/* 5. Perpanjangan Perjanjian Kerja */}
                  <div className="flex items-start py-0.5">
                    <span className="w-6 shrink-0">5.</span>
                    <span className="w-48 shrink-0">Perpanjangan Perjanjian Kerja</span>
                    <span className="w-4 shrink-0 text-center">:</span>
                    <span className="text-black flex-1">
                      {skData.perpanjanganPerjanjian}
                    </span>
                  </div>

                  {/* 6. Kantor/ Unit Kerja */}
                  <div className="flex items-start py-0.5">
                    <span className="w-6 shrink-0">6.</span>
                    <span className="w-48 shrink-0">Kantor/ Unit Kerja</span>
                    <span className="w-4 shrink-0 text-center">:</span>
                    <span className="text-black flex-1">
                      {skData.unitKerja_I39}
                    </span>
                  </div>

                  {/* 7. Gaji Lama */}
                  <div className="flex items-start py-0.5">
                    <span className="w-6 shrink-0">7.</span>
                    <span className="w-48 shrink-0">Gaji Lama</span>
                    <span className="w-4 shrink-0 text-center">:</span>
                    <span className="text-black flex-1">
                      {skData.gajiLamaFull_I44}
                    </span>
                  </div>

                  {/* Sub rincian SK Terakhir (1 s/d 5) */}
                  <div className="pl-6 pt-1 space-y-1">
                    <p className="text-black">atas dasar surat keputusan terakhir tentang pangkat/ gaji yang ditetapkan:</p>
                    
                    <div className="flex items-start pl-2">
                      <span className="w-5 shrink-0">1.</span>
                      <span className="w-41 shrink-0">Oleh Pejabat</span>
                      <span className="w-4 shrink-0 text-center">:</span>
                      <span className="text-black flex-1">{skData.skLamaPejabat}</span>
                    </div>

                    <div className="flex items-start pl-2">
                      <span className="w-5 shrink-0">2.</span>
                      <span className="w-41 shrink-0">Tanggal</span>
                      <span className="w-4 shrink-0 text-center">:</span>
                      <span className="text-black flex-1">{skData.skLamaTanggal}</span>
                    </div>

                    <div className="flex items-start pl-2">
                      <span className="w-5 shrink-0">3.</span>
                      <span className="w-41 shrink-0">Nomor</span>
                      <span className="w-4 shrink-0 text-center">:</span>
                      <span className="text-black flex-1">{skData.skLamaNomor_I40}</span>
                    </div>

                    <div className="flex items-start pl-2">
                      <span className="w-5 shrink-0">4.</span>
                      <span className="w-41 shrink-0">Tanggal Berlaku Gaji Tersebut</span>
                      <span className="w-4 shrink-0 text-center">:</span>
                      <span className="text-black flex-1">{skData.skLamaTmt_I43}</span>
                    </div>

                    <div className="flex items-start pl-2">
                      <span className="w-5 shrink-0">5.</span>
                      <span className="w-41 shrink-0">Masa Kerja Golongan</span>
                      <span className="w-4 shrink-0 text-center">:</span>
                      <span className="text-black flex-1">{skData.skLamaMk}</span>
                    </div>

                    <p className="pl-7 pt-0.5 text-black">Pada Tanggal Tersebut</p>
                    <p className="pt-0.5 text-black">diberikan kenaikan gaji berkala hingga memperoleh:</p>
                  </div>

                  {/* 8. Gaji Baru */}
                  <div className="flex items-start py-0.5">
                    <span className="w-6 shrink-0">8.</span>
                    <span className="w-48 shrink-0">Gaji Baru</span>
                    <span className="w-4 shrink-0 text-center">:</span>
                    <span className="font-bold text-black flex-1">
                      {skData.gajiBaruFull_I46}
                    </span>
                  </div>

                  {/* 9. Berdasarkan Masa Kerja */}
                  <div className="flex items-start py-0.5">
                    <span className="w-6 shrink-0">9.</span>
                    <span className="w-48 shrink-0">Berdasarkan Masa Kerja</span>
                    <span className="w-4 shrink-0 text-center">:</span>
                    <span className="text-black flex-1">
                      {skData.mkGolongan_I48}
                    </span>
                  </div>

                  {/* 10. Mulai Tanggal */}
                  <div className="flex items-start py-0.5">
                    <span className="w-6 shrink-0">10.</span>
                    <span className="w-48 shrink-0">Mulai Tanggal</span>
                    <span className="w-4 shrink-0 text-center">:</span>
                    <span className="text-black flex-1">
                      {skData.tmtBaru_I45}
                    </span>
                  </div>

                </div>

                {/* DIKTUM KEDUA */}
                <div className="flex items-start mb-2 pt-2">
                  <span className="w-20 shrink-0 font-bold">KEDUA</span>
                  <span className="w-4 shrink-0 text-center">:</span>
                  <p className="text-justify text-black leading-relaxed flex-1">
                    {skData.diktumBiaya_C51}
                  </p>
                </div>

                {/* DIKTUM KETIGA */}
                <div className="flex items-start mb-4">
                  <span className="w-20 shrink-0 font-bold">KETIGA</span>
                  <span className="w-4 shrink-0 text-center">:</span>
                  <p className="text-black flex-1">
                    Keputusan ini mulai berlaku sejak tanggal ditetapkan.
                  </p>
                </div>

                {/* Tanda Tangan & Penetapan (Right Aligned) */}
                <div className="flex justify-end pt-2">
                  <div className="w-72 text-left space-y-1">
                    <div className="flex">
                      <span className="w-28 shrink-0">Ditetapkan di</span>
                      <span className="w-4 shrink-0">:</span>
                      <span>Penajam</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 shrink-0">Pada Tanggal</span>
                      <span className="w-4 shrink-0">:</span>
                      <span>{skData.tanggalPenetapan_I55}</span>
                    </div>

                    <div className="pt-3 font-bold">
                      KEPALA BKPSDM,
                    </div>

                    {/* Placeholder Tanda Tangan SRIKANDI */}
                    <div className="py-7 font-mono text-[11px] text-slate-800">
                      ${'{'}ttd_pengirim{'}'}
                    </div>

                    <div className="space-y-0.5">
                      <p className="font-bold underline decoration-1 text-black">
                        ${'{'}nama_pengirim{'}'}
                      </p>
                      <p className="text-[10px] text-black">
                        NIP. ${'{'}nip_pengirim{'}'}
                      </p>
                    </div>

                  </div>
                </div>

              </div>

              {/* Tembusan (Bottom Left) */}
              <div className="pt-6 border-t border-slate-200 text-[9.5px]">
                <p className="font-bold mb-0.5 text-black">
                  Tembusan Keputusan ini disampaikan kepada Yth:
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-black">
                  <li>Kepala Badan Keuangan dan Aset Daerah Kabupaten Penajam Paser Utara</li>
                  <li>Yang bersangkutan untuk di ketahui sebagaiamana mestinya.</li>
                </ol>

                <div className="pt-3 text-center text-[10px] text-slate-400 font-sans">
                  - Halaman 2 dari 2 -
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Bottom Bar */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              {skData.namaLengkap_I34}
            </span>
            <span>&bull;</span>
            <span>Gaji Pokok Baru: {skData.gajiBaruFull_I46.split('(')[0]}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingDocs}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg font-medium transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
