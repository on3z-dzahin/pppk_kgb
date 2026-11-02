import React, { useState } from 'react';
import { FileSpreadsheet, CheckCircle2, AlertCircle, HelpCircle, ExternalLink, RefreshCw, X, Database } from 'lucide-react';

interface SheetsConfigModalProps {
  spreadsheetInput: string;
  onSpreadsheetInputChange: (val: string) => void;
  kgbSheetName: string;
  onKgbSheetNameChange: (val: string) => void;
  templateSheetName: string;
  onTemplateSheetNameChange: (val: string) => void;
  onLoadFromSheets: () => void;
  onLoadDemoData: () => void;
  isLoading: boolean;
  error?: string | null;
  onClose: () => void;
  accessToken: string | null;
  onNeedLogin: () => void;
}

export const SheetsConfigModal: React.FC<SheetsConfigModalProps> = ({
  spreadsheetInput,
  onSpreadsheetInputChange,
  kgbSheetName,
  onKgbSheetNameChange,
  templateSheetName,
  onTemplateSheetNameChange,
  onLoadFromSheets,
  onLoadDemoData,
  isLoading,
  error,
  onClose,
  accessToken,
  onNeedLogin
}) => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] border border-white/15 w-full max-w-xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/90 text-white flex items-center justify-between border-b border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/15 text-cyan-400 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Koneksi Google Sheets (DB KGB & TEMPLATE)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Input data langsung dari Google Sheets untuk visualisasi real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition border border-transparent hover:border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          
          {error && (
            <div className="p-3.5 bg-red-950/40 text-red-200 rounded-2xl border border-red-500/40 text-xs flex items-start gap-2.5 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Gagal memuat spreadsheet:</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Input Spreadsheet ID or URL */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Google Spreadsheet URL atau ID:
            </label>
            <input
              type="text"
              value={spreadsheetInput}
              onChange={e => onSpreadsheetInputChange(e.target.value)}
              placeholder="Contoh: https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950/70 border border-white/15 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white font-mono shadow-inner"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Tempel tautan lengkap dari browser atau Spreadsheet ID dokumen Google Sheets Anda.
            </p>
          </div>

          {/* Sheet Names */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Nama Sheet Data KGB:
              </label>
              <input
                type="text"
                value={kgbSheetName}
                onChange={e => onKgbSheetNameChange(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-950/70 border border-white/15 rounded-xl text-white font-mono shadow-inner focus:border-cyan-400 focus:outline-none"
                placeholder="DB KGB"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Default: DB KGB</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Nama Sheet Template SK:
              </label>
              <input
                type="text"
                value={templateSheetName}
                onChange={e => onTemplateSheetNameChange(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-950/70 border border-white/15 rounded-xl text-white font-mono shadow-inner focus:border-cyan-400 focus:outline-none"
                placeholder="TEMPLATE"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Default: TEMPLATE</span>
            </div>
          </div>

          {/* Collapsible Column Structure Guide */}
          <div>
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showGuide ? 'Sembunyikan' : 'Lihat'} Panduan Kolom Spreadsheet (DB KGB)</span>
            </button>

            {showGuide && (
              <div className="mt-2.5 p-3.5 bg-slate-950/70 rounded-2xl border border-white/10 text-xs text-slate-300 space-y-2 backdrop-blur-md">
                <div className="font-bold text-white border-b border-white/10 pb-1.5 flex items-center justify-between">
                  <span>Format Kolom Sheet &quot;DB KGB&quot;:</span>
                  <span className="text-[10px] font-mono text-cyan-400">PPU KGB Standard</span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                  <div><b className="text-white">Kolom B</b>: Nama Lengkap Pegawai</div>
                  <div><b className="text-white">Kolom C</b>: NIP / NIPPPK Pegawai</div>
                  <div><b className="text-white">Kolom K</b>: Tanggal TMT / Bulan Acuan</div>
                  <div><b className="text-white">Kolom R</b>: Jabatan Pegawai</div>
                  <div><b className="text-white">Kolom S</b>: Unit Kerja / OPD</div>
                  <div><b className="text-white">Kolom T:AD</b>: Acuan Filter Tahun (2022-2032)</div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Demo Data alternative */}
          <div className="p-3.5 bg-cyan-950/25 border border-cyan-500/30 rounded-2xl flex items-center justify-between text-xs backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <div className="flex items-center gap-2.5 text-cyan-200">
              <Database className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="font-bold text-white">Mode Simulasi Cepat:</span>
                <span className="text-slate-300 ml-1">Gunakan data contoh PNS & PPPK 2025-2027</span>
              </div>
            </div>
            <button
              onClick={() => {
                onLoadDemoData();
                onClose();
              }}
              className="px-3.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 font-bold rounded-xl text-xs transition active:scale-95 shrink-0"
            >
              Muat Demo
            </button>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            {accessToken ? (
              <span className="flex items-center gap-1.5 text-cyan-300 font-semibold font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Terhubung dengan Google
              </span>
            ) : (
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Akses publik aktif (tanpa perlu login)
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition"
            >
              Batal
            </button>

            {!accessToken && (
              <button
                onClick={onNeedLogin}
                className="px-3.5 py-2 text-xs font-bold bg-white/5 border border-white/15 text-slate-200 hover:text-white hover:bg-white/10 rounded-xl transition active:scale-95"
                title="Login jika spreadsheet Anda bersifat privat"
              >
                Login Google (Opsional)
              </button>
            )}

            <button
              onClick={onLoadFromSheets}
              disabled={isLoading || !spreadsheetInput.trim()}
              className="flex items-center gap-2 px-4.5 py-2 text-xs font-black bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.35)] transition-all duration-300 active:scale-95 disabled:opacity-50 border border-cyan-400/40"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-200 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Memuat...' : 'Hubungkan & Tarik Data'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
