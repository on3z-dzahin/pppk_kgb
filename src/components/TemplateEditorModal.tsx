import React, { useState } from 'react';
import { SKTemplateConfig, KGBRecord } from '../types/kgb';
import { extractDocId, createTemplateInUserGoogleDrive, fetchGoogleDocText } from '../services/googleDocs';
import {
  FileText,
  Save,
  RotateCcw,
  X,
  Check,
  ExternalLink,
  Copy,
  CheckCheck,
  Sparkles,
  FileCode,
  PlusCircle,
  Loader2,
  Eye,
  Sliders,
  CheckCircle2,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { DEFAULT_TEMPLATE, DEFAULT_KGB_DATA } from '../services/googleSheets';
import { OFFICIAL_GOOGLE_DOCS_TEMPLATE_TEXT, renderGoogleDocsTemplateText } from '../services/googleDocsTemplateText';

interface TemplateEditorModalProps {
  template: SKTemplateConfig;
  onSaveTemplate: (newTemplate: SKTemplateConfig) => void;
  onClose: () => void;
  accessToken?: string | null;
  sampleRecord?: KGBRecord;
}

export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  template,
  onSaveTemplate,
  onClose,
  accessToken,
  sampleRecord
}) => {
  const [form, setForm] = useState<SKTemplateConfig>({
    ...template,
    googleDocsTemplateId: template.googleDocsTemplateId || '',
    templateMode: 'google_docs',
    templateText: template.templateText || OFFICIAL_GOOGLE_DOCS_TEMPLATE_TEXT
  });

  const [activeTab, setActiveTab] = useState<'template_editor' | 'preview' | 'gdocs_link'>('template_editor');
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);
  const [createDocSuccess, setCreateDocSuccess] = useState<string | null>(null);
  const [isSyncingDoc, setIsSyncingDoc] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [previewMode, setPreviewMode] = useState<'rendered' | 'raw'>('rendered');

  const demoRecord: KGBRecord = sampleRecord || DEFAULT_KGB_DATA[0];

  const handleSyncDoc = async () => {
    const docId = extractDocId(form.googleDocsTemplateId || '');
    if (!docId) {
      setSyncNotice('Masukkan URL atau ID Google Docs yang valid terlebih dahulu.');
      return;
    }
    setIsSyncingDoc(true);
    setSyncNotice('Sedang menarik teks template dari Google Docs...');
    try {
      const txt = await fetchGoogleDocText(docId, accessToken);
      if (txt && txt.length > 50) {
        setForm(prev => ({
          ...prev,
          templateText: txt,
          templateMode: 'google_docs'
        }));
        setSyncNotice('Berhasil! Teks template telah disinkronkan langsung dari Google Docs Anda.');
      } else {
        setSyncNotice('Gagal membaca isi Google Docs. Pastikan izin akses diset atau login Google.');
      }
    } catch (err: any) {
      setSyncNotice(`Error sinkronisasi: ${err.message || 'Kesalahan'}`);
    } finally {
      setIsSyncingDoc(false);
    }
  };

  const handleChange = (field: keyof SKTemplateConfig, val: any) => {
    setForm(prev => ({ ...prev, [field]: val }));
    setSavedSuccess(false);
  };

  const handleCopy = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  const handleInsertTag = (tag: string) => {
    handleCopy(tag);
    setForm(prev => ({
      ...prev,
      templateText: (prev.templateText || '') + (prev.templateText?.endsWith('\n') ? '' : '\n') + tag
    }));
  };

  const handleSave = () => {
    onSaveTemplate(form);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleResetToOfficial = () => {
    if (window.confirm('Kembalikan teks template ke format resmi Google Docs (KGB Penajam Paser Utara)?')) {
      setForm(prev => ({
        ...prev,
        templateText: OFFICIAL_GOOGLE_DOCS_TEMPLATE_TEXT,
        dasarHukum: DEFAULT_TEMPLATE.dasarHukum,
        templateMode: 'google_docs'
      }));
      setSavedSuccess(false);
    }
  };

  const handleCreateDocInDrive = async () => {
    if (!accessToken) {
      alert('Silakan login dengan akun Google terlebih dahulu pada bilah atas dashboard.');
      return;
    }
    setIsCreatingDoc(true);
    setCreateDocSuccess(null);
    try {
      const res = await createTemplateInUserGoogleDrive(accessToken);
      const updated = {
        ...form,
        googleDocsTemplateId: res.docId,
        templateMode: 'google_docs' as const
      };
      setForm(updated);
      onSaveTemplate(updated);
      setCreateDocSuccess(`Template KGB resmi berhasil dibuat di Google Drive Anda! ID: ${res.docId}`);
    } catch (err: any) {
      alert(err.message || 'Gagal membuat template di Google Drive');
    } finally {
      setIsCreatingDoc(false);
    }
  };

  const cleanDocId = extractDocId(form.googleDocsTemplateId || '');

  const placeholderList = [
    { tag: '{{nomor_sk_lengkap}}', desc: 'Nomor SK lengkap sesuai format A10 (contoh: 800.1.11.13/001/BKPSDM-PPPK/VI/2026)' },
    { tag: '{{nama}}', desc: 'Nama lengkap pegawai beserta gelar (Kolom B)' },
    { tag: '{{nip}}', desc: 'Nomor Induk Pegawai (Kolom C)' },
    { tag: '{{golongan}}', desc: 'Golongan ruang (contoh: V, IX, X)' },
    { tag: '{{jabatan}}', desc: 'Jabatan pegawai (Kolom R)' },
    { tag: '{{unit_kerja}}', desc: 'Kantor / Unit Kerja OPD (Kolom S)' },
    { tag: '{{gaji_lama_lengkap}}', desc: 'Gaji lama beserta kalimat terbilang rupiah (Perpres 11/2024)' },
    { tag: '{{sk_lama_pejabat}}', desc: 'Pejabat penetap SK lama (Bupati Penajam Paser Utara)' },
    { tag: '{{sk_lama_tanggal}}', desc: 'Tanggal SK lama' },
    { tag: '{{sk_lama_nomor}}', desc: 'Nomor SK lama' },
    { tag: '{{sk_lama_tmt}}', desc: 'Tanggal berlaku gaji lama (TMT lama)' },
    { tag: '{{sk_lama_mk}}', desc: 'Masa kerja golongan lama' },
    { tag: '{{gaji_baru_lengkap}}', desc: 'Gaji baru beserta kalimat terbilang rupiah (Perpres 11/2024)' },
    { tag: '{{mk_sesudah}}', desc: 'Masa kerja golongan baru (contoh: 02 Tahun 00 Bulan)' },
    { tag: '{{kolom_k}}', desc: 'Tanggal Kolom K format resmi Indonesia (contoh: 1 Juni 2025)' },
    { tag: '{{kolom_p}}', desc: 'Mulai Tanggal / Kolom P otomatis (contoh: 1 Juni 2026)' },
    { tag: '{{tmt_baru}}', desc: 'Terhitung mulai tanggal (TMT) baru' },
    { tag: '{{tanggal_penetapan}}', desc: 'Tanggal penetapan SK' }
  ];

  const renderedPreviewText = renderGoogleDocsTemplateText(
    demoRecord,
    demoRecord.tahunKgb || 2026,
    form.templateText || OFFICIAL_GOOGLE_DOCS_TEMPLATE_TEXT
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] border border-white/15 w-full max-w-4xl overflow-hidden flex flex-col max-h-[94vh] text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/90 text-white flex items-center justify-between shrink-0 border-b border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-cyan-500/15 text-cyan-400 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Menu Format SK & Template Google Docs
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 font-mono shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  Google Docs Template Aktif
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Format Surat Keputusan Kenaikan Gaji Berkala (PPPK) Kabupaten Penajam Paser Utara
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer border border-transparent hover:border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-slate-950/60 border-b border-white/10 flex items-center gap-2 shrink-0 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('template_editor')}
            className={`pb-2.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'template_editor'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Teks Template SK (Google Docs)</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`pb-2.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'preview'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Pratinjau Hasil Data Pegawai</span>
          </button>

          <button
            onClick={() => setActiveTab('gdocs_link')}
            className={`pb-2.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'gdocs_link'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Tautan Google Docs & Drive API</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1 bg-slate-950/40">
          
          {/* TAB 1: TEMPLATE TEXT EDITOR */}
          {activeTab === 'template_editor' && (
            <div className="space-y-4">
              
              {/* Notice Banner */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start justify-between gap-3 text-blue-900">
                <div className="flex items-start gap-2.5">
                  <FileCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs">
                      Format SK Resmi Berdasarkan Dokumen Google Docs (KGB PPPK PPU)
                    </h4>
                    <p className="text-[11px] text-blue-800 mt-0.5">
                      Teks di bawah ini adalah format resmi dokumen SK KGB yang mencakup Konsiderans, 5 Butir Mengingat, Diktum KESATU s/d KETIGA, serta tag penandatanganan elektronik SRIKANDI. Anda dapat mengedit teks ini secara langsung.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResetToOfficial}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-300 transition shrink-0 cursor-pointer flex items-center gap-1"
                  title="Kembalikan teks ke format resmi Google Docs"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Resmi</span>
                </button>
              </div>

              {/* Placeholder Toolbar Chips */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px]">
                    Klik tag placeholder di bawah untuk menyalin atau menambahkan ke template:
                  </span>
                  {copiedTag && (
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCheck className="w-3.5 h-3.5" />
                      Tersalin: {copiedTag}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {placeholderList.map(item => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => handleCopy(item.tag)}
                      title={`${item.desc} (Klik untuk salin)`}
                      className="px-2 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 hover:border-blue-300 border border-slate-200 rounded text-[11px] font-mono transition cursor-pointer flex items-center gap-1"
                    >
                      <span>{item.tag}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleCopy('${ttd_pengirim}')}
                    title="Posisi tanda tangan SRIKANDI (Klik untuk salin)"
                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[11px] font-mono transition cursor-pointer"
                  >
                    ${'{'}ttd_pengirim{'}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy('${nama_pengirim}')}
                    title="Nama pejabat SRIKANDI (Klik untuk salin)"
                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[11px] font-mono transition cursor-pointer"
                  >
                    ${'{'}nama_pengirim{'}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy('NIP. ${nip_pengirim}')}
                    title="NIP pejabat SRIKANDI (Klik untuk salin)"
                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[11px] font-mono transition cursor-pointer"
                  >
                    NIP. ${'{'}nip_pengirim{'}'}
                  </button>
                </div>
              </div>

              {/* Textarea Editor */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-slate-300">
                  <label className="font-bold text-xs">
                    Isi Konten Dokumen SK (Format Google Docs):
                  </label>
                  <span className="text-[11px] text-cyan-400 font-mono">
                    {form.templateText?.length || 0} karakter
                  </span>
                </div>
                <textarea
                  value={form.templateText || ''}
                  onChange={e => handleChange('templateText', e.target.value)}
                  rows={16}
                  className="w-full p-4 bg-slate-950/80 border border-white/15 rounded-2xl font-mono text-xs text-white leading-relaxed focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none resize-y shadow-inner"
                  placeholder="Tuliskan format dokumen template SK di sini..."
                />
              </div>

            </div>
          )}

          {/* TAB 2: LIVE PREVIEW WITH REAL EMPLOYEE DATA */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-950">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-xs block">
                      Pratinjau dengan Contoh Data: {demoRecord.nama} ({demoRecord.nip})
                    </span>
                    <span className="text-[11px] text-emerald-800">
                      Golongan {demoRecord.pangkatGol} &bull; Gaji Lama: Rp 2.511.500 &bull; Gaji Baru: Rp 2.590.600
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-emerald-300">
                  <button
                    onClick={() => setPreviewMode('rendered')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                      previewMode === 'rendered' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Data Terisi
                  </button>
                  <button
                    onClick={() => setPreviewMode('raw')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                      previewMode === 'raw' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tag Placeholder
                  </button>
                </div>
              </div>

              {/* Document Sheet Display */}
              <div className="bg-white border border-slate-300 rounded-xl p-6 sm:p-8 shadow-sm font-serif text-[12px] leading-relaxed text-slate-900 max-h-[55vh] overflow-y-auto whitespace-pre-wrap">
                {previewMode === 'rendered' ? renderedPreviewText : (form.templateText || OFFICIAL_GOOGLE_DOCS_TEMPLATE_TEXT)}
              </div>

            </div>
          )}

          {/* TAB 3: GOOGLE DOCS LINK & CLOUD DRIVE */}
          {activeTab === 'gdocs_link' && (
            <div className="space-y-4">
              
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-blue-950 text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Tautan / ID File Template Google Docs Anda
                    </h4>
                    <p className="text-xs text-blue-800 mt-0.5">
                      Jika Anda ingin menghubungkan dokumen Google Docs langsung dari Google Drive Anda, masukkan URL atau File ID di sini.
                    </p>
                  </div>

                  {cleanDocId && (
                    <a
                      href={`https://docs.google.com/document/d/${cleanDocId}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-white text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Template</span>
                    </a>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    URL Lengkap atau Document ID:
                  </label>
                  <input
                    type="text"
                    value={form.googleDocsTemplateId || ''}
                    onChange={e => {
                      const val = e.target.value;
                      handleChange('googleDocsTemplateId', val);
                      if (val.trim()) {
                        handleChange('templateMode', 'google_docs');
                      }
                    }}
                    placeholder="Contoh: https://docs.google.com/document/d/1BxiMVs0XRA5nFM.../edit"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {cleanDocId && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <p className="text-[11px] text-emerald-700 font-mono">
                        &bull; Terdeteksi Document ID: <strong>{cleanDocId}</strong>
                      </p>
                      <button
                        type="button"
                        onClick={handleSyncDoc}
                        disabled={isSyncingDoc}
                        className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer ml-auto"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingDoc ? 'animate-spin' : ''}`} />
                        <span>{isSyncingDoc ? 'Menarik Teks...' : 'Tarik & Sinkronkan Teks dari Google Docs'}</span>
                      </button>
                    </div>
                  )}

                  {syncNotice && (
                    <div className="mt-2 p-2.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg text-xs flex items-center justify-between">
                      <span>{syncNotice}</span>
                      <button type="button" onClick={() => setSyncNotice(null)} className="text-blue-500 font-bold ml-2">×</button>
                    </div>
                  )}
                </div>

                {/* Live Google Docs Iframe Preview inside Editor */}
                {cleanDocId && (
                  <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs">
                    <div className="p-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Pratinjau Dokumen Google Docs Terhubung
                      </span>
                      <a
                        href={`https://docs.google.com/document/d/${cleanDocId}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka di Tab Baru</span>
                      </a>
                    </div>
                    <iframe
                      src={`https://docs.google.com/document/d/${cleanDocId}/preview`}
                      className="w-full h-72 border-0"
                      title="Google Docs Embed Preview"
                    />
                  </div>
                )}

                {/* 1-Click Create Template in User's Google Drive */}
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCreateDocInDrive}
                    disabled={isCreatingDoc}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    {isCreatingDoc ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Membuat File di Google Drive Anda...</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Buat Template di Google Drive Saya (1-Klik Otomatis)</span>
                      </>
                    )}
                  </button>
                  <span className="text-[11px] text-slate-500">
                    Otomatis membuat file Google Docs baru berisi format resmi Kabupaten Penajam Paser Utara.
                  </span>
                </div>

                {createDocSuccess && (
                  <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{createDocSuccess}</span>
                  </div>
                )}
              </div>

              {/* Catatan Penandatanganan SRIKANDI */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed space-y-1">
                <strong>Catatan Khusus SRIKANDI:</strong>
                <p>
                  Bagian tanda tangan di Google Docs tetap menggunakan teks:{' '}
                  <code className="bg-amber-100 font-mono font-bold px-1">${'{'}ttd_pengirim{'}'}</code>,{' '}
                  <code className="bg-amber-100 font-mono font-bold px-1">${'{'}nama_pengirim{'}'}</code>, dan{' '}
                  <code className="bg-amber-100 font-mono font-bold px-1">NIP. ${'{'}nip_pengirim{'}'}</code> tanpa diubah agar aplikasi SRIKANDI mendeteksi posisi tanda tangan elektronik.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-white/10 flex items-center justify-between shrink-0 backdrop-blur-md">
          <button
            onClick={handleResetToOfficial}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Kembalikan Default Resmi</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 text-xs font-black bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.35)] transition active:scale-95 cursor-pointer border border-cyan-400/40"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-cyan-200" />
                  <span>Simpan Pengaturan Format SK</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
