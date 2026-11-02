import React, { useState } from 'react';
import { KGBRecord, SKTemplateConfig } from '../types/kgb';
import { generateUnitKerjaPdf, triggerDownload } from '../services/pdfGenerator';
import { Building2, Download, Printer, X, CheckCircle2, HardDrive } from 'lucide-react';

interface UnitKerjaPrintModalProps {
  records: KGBRecord[];
  template: SKTemplateConfig;
  onClose: () => void;
  onUploadUnitKerjaToDrive: (unitKerja: string, records: KGBRecord[]) => void;
  isDriveReady: boolean;
  selectedYear?: number;
}

export const UnitKerjaPrintModal: React.FC<UnitKerjaPrintModalProps> = ({
  records,
  template,
  onClose,
  onUploadUnitKerjaToDrive,
  isDriveReady,
  selectedYear
}) => {
  // Group records by Unit Kerja
  const unitMap = new Map<string, KGBRecord[]>();
  records.forEach(r => {
    const key = r.unitKerja.trim() || 'Unit Lainnya';
    const list = unitMap.get(key) || [];
    list.push(r);
    unitMap.set(key, list);
  });

  const unitList = Array.from(unitMap.entries()).map(([name, items]) => ({
    name,
    count: items.length,
    items
  }));

  const [downloadingUnit, setDownloadingUnit] = useState<string | null>(null);

  const handleDownloadUnit = (unitName: string, items: KGBRecord[]) => {
    setDownloadingUnit(unitName);
    try {
      const { blob, filename } = generateUnitKerjaPdf(unitName, items, template, selectedYear);
      triggerDownload(blob, filename);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setTimeout(() => setDownloadingUnit(null), 600);
    }
  };

  const handleDownloadAllUnits = () => {
    unitList.forEach(({ name, items }) => {
      const { blob, filename } = generateUnitKerjaPdf(name, items, template, selectedYear);
      triggerDownload(blob, filename);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] border border-white/15 w-full max-w-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/90 text-white flex items-center justify-between border-b border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/15 text-cyan-400 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Cetak SK per Unit Kerja (1 File PDF)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Setiap file berisi seluruh pegawai dari unit kerja yang sama
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
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Ditemukan <b className="text-cyan-400">{unitList.length}</b> Unit Kerja pada filter aktif</span>
            {unitList.length > 1 && (
              <button
                onClick={handleDownloadAllUnits}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline"
              >
                Unduh Semua Unit Kerja ({unitList.length} file)
              </button>
            )}
          </div>

          <div className="space-y-3">
            {unitList.map(({ name, count, items }) => (
              <div
                key={name}
                className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-slate-950/50 hover:bg-slate-950/80 transition-all duration-300 backdrop-blur-md hover:border-cyan-500/30"
              >
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">{name}</h4>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                    <span className="text-cyan-300 font-semibold">{count} Pegawai</span>
                    <span>&bull;</span>
                    <span className="font-mono text-[11px] text-slate-400">
                      Output: SK_KGB_{name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Download PDF button */}
                  <button
                    onClick={() => handleDownloadUnit(name, items)}
                    disabled={downloadingUnit === name}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] transition active:scale-95 disabled:opacity-50 border border-cyan-400/40"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-200" />
                    <span>{downloadingUnit === name ? 'Membuat...' : 'Unduh PDF'}</span>
                  </button>

                  {/* Upload to Google Drive */}
                  <button
                    onClick={() => onUploadUnitKerjaToDrive(name, items)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/15 rounded-xl transition active:scale-95"
                    title="Simpan PDF Unit Kerja ini ke Google Drive"
                  >
                    <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">Drive</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-white/10 flex justify-between items-center text-xs text-slate-400 backdrop-blur-md">
          <span className="font-mono">Format file standar resmi SK (A4)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold rounded-xl border border-white/15 transition active:scale-95"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
