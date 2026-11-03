import React, { useState } from 'react';
import { KGBRecord, SKTemplateConfig, calculateMulaiTanggal, AppRole } from '../types/kgb';
import { formatMasaKerja, parseMkYears, getGajiPokok, formatRupiah } from '../services/salaryTable';
import { Eye, Printer, HardDrive, Check, Save, Wand2, Calendar, FileText, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';

interface KGBTableProps {
  records: KGBRecord[];
  onUpdateRecord: (id: string, updates: Partial<KGBRecord>) => void;
  onPreviewSK: (record: KGBRecord) => void;
  onPrintSingleSK: (record: KGBRecord) => void;
  onUploadSingleToDrive: (record: KGBRecord) => void;
  onSaveRecord: (id: string) => void;
  selectedYear: number;
  role?: AppRole;
}

export const KGBTable: React.FC<KGBTableProps> = ({
  records,
  onUpdateRecord,
  onPreviewSK,
  onPrintSingleSK,
  onUploadSingleToDrive,
  onSaveRecord,
  selectedYear,
  role = 'admin'
}) => {
  const isAdmin = role === 'admin';
  const [batchNomorPrefix, setBatchNomorPrefix] = useState(`800.1.11.1/`);
  const [batchStartNum, setBatchStartNum] = useState(1);
  const [batchDate, setBatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Apply batch numbering
  const handleApplyBatchNumbers = () => {
    let current = batchStartNum;
    records.forEach(r => {
      const padded = String(current).padStart(3, '0');
      const generatedNo = `${batchNomorPrefix}${padded}/${selectedYear}`;
      onUpdateRecord(r.id, {
        nomorSk: generatedNo,
        tanggalPenetapan: batchDate,
        isSaved: false
      });
      current++;
    });
    setShowBatchModal(false);
  };

  // Handle MK Sebelum blur
  const handleMkSebelumBlur = (record: KGBRecord, val: string) => {
    const formatted = formatMasaKerja(val);
    const years = parseMkYears(formatted);
    const newGajiLama = getGajiPokok(record.pangkatGol, years);
    onUpdateRecord(record.id, {
      mkSebelum: formatted,
      gajiLama: newGajiLama,
      isSaved: false
    });
  };

  // Handle MK Sesudah blur
  const handleMkSesudahBlur = (record: KGBRecord, val: string) => {
    const formatted = formatMasaKerja(val);
    const years = parseMkYears(formatted);
    const newGajiBaru = getGajiPokok(record.pangkatGol, years);
    onUpdateRecord(record.id, {
      mkSesudah: formatted,
      gajiBaru: newGajiBaru,
      isSaved: false
    });
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] overflow-hidden mb-8">
      
      {/* Table Action Bar */}
      <div className="p-4 bg-slate-950/70 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-bold text-white tracking-wide">
            Daftar Pegawai KGB ({records.length} data)
          </span>
          <span className="text-[11px] text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/30 font-mono">
             {selectedYear} &bull;  ; 
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <button
              onClick={() => setShowBatchModal(!showBatchModal)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-400/30 rounded-xl shadow-xs transition-all duration-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] active:scale-95 cursor-pointer"
              title="Isi otomatis Nomor SK & Tanggal Penetapan secara berurutan"
            >
              <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Penomoran Cepat SK</span>
            </button>
          ) : (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800/60 text-slate-300 border border-white/10 rounded-xl backdrop-blur-md"
              title="Akun User dalam mode hanya melihat data"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mode Pelihat (Hanya Baca)</span>
            </div>
          )}
        </div>
      </div>

      {/* Batch Numbering Dropdown Panel */}
      {showBatchModal && (
        <div className="p-4 bg-slate-950/90 border-b border-cyan-500/30 flex flex-wrap items-end gap-3.5 text-xs backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Format Awalan Nomor SK
            </label>
            <input
              type="text"
              value={batchNomorPrefix}
              onChange={e => setBatchNomorPrefix(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-white/15 focus:border-cyan-400 rounded-lg text-white text-xs font-mono w-44 shadow-inner"
              placeholder="800.1.11.1/"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Nomor Awal
            </label>
            <input
              type="number"
              value={batchStartNum}
              onChange={e => setBatchStartNum(Number(e.target.value))}
              className="px-3 py-1.5 bg-slate-900 border border-white/15 focus:border-cyan-400 rounded-lg text-white text-xs w-20 shadow-inner"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Tanggal Penetapan Serentak
            </label>
            <input
              type="date"
              value={batchDate}
              onChange={e => setBatchDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-white/15 focus:border-cyan-400 rounded-lg text-white text-xs shadow-inner"
            />
          </div>
          <button
            onClick={handleApplyBatchNumbers}
            className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.4)] transition active:scale-95"
          >
            Terapkan ke {records.length} Pegawai
          </button>
          <button
            onClick={() => setShowBatchModal(false)}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 rounded-lg transition"
          >
            Batal
          </button>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/80 text-slate-300 border-b border-white/10 uppercase font-bold text-[11px] tracking-wider">
              <th className="py-3.5 px-3 w-10 text-center">No</th>
              <th className="py-3.5 px-3 min-w-[190px]">
                Nomor SK <span className="text-amber-400 font-normal lowercase">(diisi manual)</span>
              </th>
              <th className="py-3.5 px-3 min-w-[180px]">
                Nama Pegawai <span className="text-slate-500 font-normal"></span>
              </th>
              <th className="py-3.5 px-3 min-w-[150px]">
                NIP <span className="text-slate-500 font-normal"></span>
              </th>
              <th className="py-3.5 px-3 min-w-[140px]">
                Jabatan <span className="text-slate-500 font-normal"></span>
              </th>
              <th className="py-3.5 px-3 min-w-[160px]">
                Unit Kerja <span className="text-slate-500 font-normal"></span>
              </th>
              <th className="py-3.5 px-3 min-w-[155px]">
                Mulai Tanggal <span className="text-cyan-400 font-normal lowercase"></span>
              </th>
              <th className="py-3.5 px-3 min-w-[140px]">
                MK Sebelum
              </th>
              <th className="py-3.5 px-3 min-w-[140px]">
                MK Sesudah
              </th>
              <th className="py-3.5 px-3 min-w-[140px]">
                Tgl Penetapan <span className="text-amber-400 font-normal lowercase">(diisi manual)</span>
              </th>
              <th className="py-3.5 px-3 min-w-[130px] text-center">
                Aksi Cetak & Drive
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {records.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-16 text-center text-slate-400">
                  <FileText className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                  <p className="font-bold text-base text-slate-200">Tidak ada data pegawai untuk filter ini</p>
                  <p className="text-xs text-slate-400 mt-1">Silakan pilih Tahun atau Bulan lain pada filter di atas.</p>
                </td>
              </tr>
            ) : (
              records.map((r, idx) => (
                <tr
                  key={r.id}
                  className={`hover:bg-blue-900/15 transition-colors group ${
                    !r.nomorSk ? 'bg-amber-500/[0.03]' : ''
                  }`}
                >
                  {/* No */}
                  <td className="py-3 px-3 text-center text-slate-400 font-mono font-medium">
                    {idx + 1}
                  </td>

                  {/* 1. Nomor SK (diisi manual oleh Admin, read-only untuk User) */}
                  <td className="py-3 px-3">
                    {isAdmin ? (
                      <input
                        type="text"
                        value={r.nomorSk || ''}
                        onChange={e =>
                          onUpdateRecord(r.id, { nomorSk: e.target.value, isSaved: false })
                        }
                        placeholder="Contoh: 800.1.11.1/042/2026"
                        className="w-full px-2.5 py-1.5 bg-slate-950/70 border border-white/15 focus:border-cyan-400 rounded-lg text-white font-mono text-xs focus:ring-1 focus:ring-cyan-400 shadow-inner"
                      />
                    ) : (
                      <div className="w-full px-2.5 py-1.5 bg-slate-950/50 border border-white/10 rounded-lg text-white font-mono text-xs truncate">
                        {r.nomorSk || <span className="text-slate-500 italic">Belum ada nomor</span>}
                      </div>
                    )}
                  </td>

                  {/* 2. Nama (Kolom B) */}
                  <td className="py-3 px-3">
                    <div className="font-bold text-white leading-tight">
                      {r.nama}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                      <span>Gol. {r.pangkatGol} &bull; TMT: {r.tmtKgb}</span>
                      <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-mono font-bold text-[9px] border border-emerald-500/30">
                        {selectedYear}: [C]
                      </span>
                    </div>
                  </td>

                  {/* 3. NIP (Kolom C) */}
                  <td className="py-3 px-3 font-mono text-cyan-300/90">
                    {r.nip}
                  </td>

                  {/* 4. Jabatan (Kolom R) */}
                  <td className="py-3 px-3 text-slate-300">
                    {r.jabatan}
                  </td>

                  {/* 5. Unit Kerja (Kolom S) */}
                  <td className="py-3 px-3">
                    <span className="inline-block px-2.5 py-1 bg-white/5 border border-white/10 text-slate-200 rounded-lg font-medium text-[11px] backdrop-blur-xs">
                      {r.unitKerja}
                    </span>
                  </td>

                  {/* Mulai Tanggal (Kolom P otomatis dari Kolom K + Tahun Dashboard) */}
                  <td className="py-3 px-3">
                    <div className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{calculateMulaiTanggal(r.kolomK || r.tanggalAcuanK, selectedYear, r.tmtKgb)}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      TMT Lama: {r.kolomK || r.tanggalAcuanK || '1 Juni 2025'}
                    </div>
                  </td>

                  {/* 6. MK Sebelum (auto-format 3 -> 03 tahun 00 bulan) */}
                  <td className="py-3 px-3">
                    {isAdmin ? (
                      <input
                        type="text"
                        value={r.mkSebelum || ''}
                        onChange={e =>
                          onUpdateRecord(r.id, { mkSebelum: e.target.value, isSaved: false })
                        }
                        onBlur={e => handleMkSebelumBlur(r, e.target.value)}
                        placeholder="e.g. 3 atau 03 thn"
                        className="w-full px-2.5 py-1.5 bg-slate-950/70 border border-white/15 focus:border-cyan-400 rounded-lg text-white text-xs focus:ring-1 focus:ring-cyan-400 shadow-inner"
                        title="Ketik angka 3 otomatis jadi 03 tahun 00 bulan"
                      />
                    ) : (
                      <div className="w-full px-2.5 py-1.5 bg-slate-950/50 border border-white/10 rounded-lg text-slate-200 text-xs font-mono">
                        {r.mkSebelum || '-'}
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400 font-medium mt-1 block truncate font-mono">
                      Gaji: {formatRupiah((r.gajiLama && r.gajiLama >= 1800000 && r.gajiLama <= 15000000) ? r.gajiLama : getGajiPokok(r.kolomF || r.pangkatGol, parseMkYears(r.mkSebelum)))}
                    </span>
                  </td>

                  {/* 7. MK Sesudah (auto-format 5 -> 05 tahun 00 bulan) */}
                  <td className="py-3 px-3">
                    {isAdmin ? (
                      <input
                        type="text"
                        value={r.mkSesudah || ''}
                        onChange={e =>
                          onUpdateRecord(r.id, { mkSesudah: e.target.value, isSaved: false })
                        }
                        onBlur={e => handleMkSesudahBlur(r, e.target.value)}
                        placeholder="e.g. 5 atau 05 thn"
                        className="w-full px-2.5 py-1.5 bg-slate-950/70 border border-white/15 focus:border-cyan-400 rounded-lg text-white text-xs focus:ring-1 focus:ring-cyan-400 shadow-inner font-semibold"
                        title="Ketik angka otomatis jadi XX tahun 00 bulan"
                      />
                    ) : (
                      <div className="w-full px-2.5 py-1.5 bg-slate-950/50 border border-white/10 rounded-lg text-cyan-300 font-semibold text-xs font-mono">
                        {r.mkSesudah || '-'}
                      </div>
                    )}
                    <span className="text-[10px] text-cyan-300 font-semibold mt-1 block truncate font-mono">
                      Gaji Baru: {formatRupiah((r.gajiBaru && r.gajiBaru >= 1800000 && r.gajiBaru <= 15000000) ? r.gajiBaru : getGajiPokok(r.kolomF || r.pangkatGol, parseMkYears(r.mkSesudah)))}
                    </span>
                  </td>

                  {/* 8. Tanggal Penetapan (diisi manual oleh Admin) */}
                  <td className="py-3 px-3">
                    {isAdmin ? (
                      <input
                        type="date"
                        value={r.tanggalPenetapan || ''}
                        onChange={e =>
                          onUpdateRecord(r.id, {
                            tanggalPenetapan: e.target.value,
                            isSaved: false
                          })
                        }
                        className="w-full px-2.5 py-1.5 bg-slate-950/70 border border-white/15 focus:border-cyan-400 rounded-lg text-white text-xs focus:ring-1 focus:ring-cyan-400 shadow-inner"
                      />
                    ) : (
                      <div className="w-full px-2.5 py-1.5 bg-slate-950/50 border border-white/10 rounded-lg text-slate-200 text-xs font-mono">
                        {r.tanggalPenetapan || '-'}
                      </div>
                    )}
                  </td>

                  {/* 9. Aksi: Preview SK, Cetak Perpegawai, Drive, Save */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      
                      {/* Pratinjau SK (Semua Role Bisa) */}
                      <button
                        onClick={() => onPreviewSK(r)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/15 border border-transparent hover:border-cyan-500/30 transition-all duration-300 active:scale-95 cursor-pointer"
                        title="Pratinjau SK berdasarkan TEMPLATE"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Cetak SK Perpegawai (Semua Role Bisa) */}
                      <button
                        onClick={() => onPrintSingleSK(r)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/15 border border-transparent hover:border-emerald-500/30 transition-all duration-300 active:scale-95 cursor-pointer"
                        title={`Cetak SK ${r.nama} (PDF Otomatis Nama Pegawai)`}
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Simpan Otomatis ke Drive */}
                      <button
                        onClick={() => onUploadSingleToDrive(r)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-blue-300 hover:bg-blue-500/15 border border-transparent hover:border-blue-500/30 transition-all duration-300 active:scale-95 cursor-pointer"
                        title="Simpan Otomatis SK ini ke Google Drive"
                      >
                        <HardDrive className="w-4 h-4" />
                      </button>

                      {/* Simpan Baris (Khusus Admin) */}
                      {isAdmin ? (
                        <button
                          onClick={() => onSaveRecord(r.id)}
                          className={`p-1.5 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer ${
                            r.isSaved
                              ? 'text-emerald-400 hover:bg-emerald-500/15'
                              : 'text-amber-400 bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25 animate-pulse'
                          }`}
                          title={r.isSaved ? 'Data tersimpan' : 'Klik untuk simpan baris ini'}
                        >
                          {r.isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        </button>
                      ) : (
                        <span
                          className="p-1.5 text-slate-600"
                          title="Hanya Admin yang dapat menyimpan perubahan data"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      )}

                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-3 bg-slate-950/80 border-t border-white/10 text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Aturan otomatis MK: Ketik angka misal <b className="text-white">3</b> &rarr; otomatis terformat <b className="text-cyan-300">03 tahun 00 bulan</b></span>
        </div>
        <div className="text-slate-400 font-mono">
          Tabel Gaji Pokok Aktif: Perpres No. 11 Tahun 2024 (Gol. I s/d XVII)
        </div>
      </div>

    </div>
  );
};
