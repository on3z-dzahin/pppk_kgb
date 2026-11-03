import React from 'react';
import { INDONESIAN_MONTHS } from '../services/googleSheets';
import { Calendar, Filter, Search, Printer, HardDrive, Check, Building, FileText } from 'lucide-react';

interface FilterBarProps {
  years: number[];
  selectedYear: number;
  onSelectYear: (year: number) => void;

  availableMonths: number[]; // Dynamic months available for selectedYear
  selectedMonth: number | 'all';
  onSelectMonth: (month: number | 'all') => void;

  searchQuery: string;
  onSearchChange: (q: string) => void;

  selectedUnitKerja: string;
  onSelectUnitKerja: (u: string) => void;
  availableUnitKerja: string[];

  statusFilter: 'all' | 'pending' | 'completed';
  onStatusFilterChange: (s: 'all' | 'pending' | 'completed') => void;

  onOpenUnitKerjaPrintModal: () => void;
  onOpenDriveExportModal: () => void;
  isDriveReady: boolean;

  onOpenTemplateEditor: () => void;
  templateMode?: 'google_docs' | 'built_in';
  hasGoogleDoc?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  years,
  selectedYear,
  onSelectYear,
  availableMonths,
  selectedMonth,
  onSelectMonth,
  searchQuery,
  onSearchChange,
  selectedUnitKerja,
  onSelectUnitKerja,
  availableUnitKerja,
  statusFilter,
  onStatusFilterChange,
  onOpenUnitKerjaPrintModal,
  onOpenDriveExportModal,
  isDriveReady,
  onOpenTemplateEditor,
  templateMode,
  hasGoogleDoc
}) => {
  return (
    <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-5 mb-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.45)]">
      
      {/* Top Row: Year, Dynamic Month & Unit Kerja Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-4 border-b border-white/10">
        
        {/* Filter Tahun (Acuan Kolom T:AD 2022 - 2032) */}
        <div className="md:col-span-3">
          <label className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-2">
            <div className="p-1 rounded-md bg-blue-500/20 text-cyan-400 border border-blue-500/30">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <span>Tahun Target KGB</span>
          </label>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={e => onSelectYear(Number(e.target.value))}
              className="w-full text-sm font-bold bg-slate-950/70 border border-cyan-500/30 rounded-xl px-3.5 py-2.5 text-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 shadow-inner transition cursor-pointer"
            >
              {years.map(y => (
                <option key={y} value={y} className="bg-slate-900 text-white font-medium">
                  Tahun {y}
                </option>
              ))}
            </select>
          </div>
          <span className="text-[10px] text-cyan-400/80 font-mono mt-1 block">
            
          </span>
        </div>

        {/* Filter Bulan Dinamis (Kolom K dengan Value "C" di Kolom T:AD) */}
        <div className="md:col-span-4">
          <label className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-2">
            <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <span>Pilih Bulan</span>
          </label>
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={e => onSelectMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full text-sm font-bold bg-slate-950/70 border border-emerald-500/30 rounded-xl px-3.5 py-2.5 text-emerald-300 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 shadow-inner transition cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white font-medium">
                Semua Bulan ({availableMonths.length} bulan terdaftar value &quot;C&quot;)
              </option>
              {availableMonths.map(m => (
                <option key={m} value={m} className="bg-slate-900 text-white font-medium">
                  {INDONESIAN_MONTHS[m - 1]} (Bulan {String(m).padStart(2, '0')})
                </option>
              ))}
            </select>
          </div>
          <span className="text-[10px] text-emerald-400/80 font-mono mt-1 block">
            value &quot;C&quot; ({selectedYear})
          </span>
        </div>

        {/* Filter Unit Kerja */}
        <div className="md:col-span-5">
          <label className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-2">
            <div className="p-1 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Building className="w-3.5 h-3.5" />
            </div>
            <span>Unit Kerja</span>
          </label>
          <select
            value={selectedUnitKerja}
            onChange={e => onSelectUnitKerja(e.target.value)}
            className="w-full text-sm font-medium bg-slate-950/70 border border-white/15 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 shadow-inner transition cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-white">
              Semua Unit Kerja ({availableUnitKerja.length} instansi)
            </option>
            {availableUnitKerja.map(u => (
              <option key={u} value={u} className="bg-slate-900 text-white">
                {u}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-400 mt-1 block">
            
          </span>
        </div>

      </div>

      {/* Bottom Row: Search, Status Tabs & Batch Print/Drive Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 pt-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Cari Nama Pegawai, NIP, Jabatan..."
            className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-2 bg-slate-950/70 border border-white/15 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 transition shadow-inner"
          />
        </div>

        {/* Status Filter Badges */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/10 backdrop-blur-md">
          <button
            onClick={() => onStatusFilterChange('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 ${
              statusFilter === 'all'
                ? 'bg-white/15 text-white shadow-inner border border-white/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => onStatusFilterChange('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 ${
              statusFilter === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Belum SK
          </button>
          <button
            onClick={() => onStatusFilterChange('completed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 ${
              statusFilter === 'completed'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sudah SK
          </button>
        </div>

        {/* Batch Print, Drive & Format SK Actions */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Menu Format SK (Google Docs / Bawaan) */}
          <button
            onClick={onOpenTemplateEditor}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-400/30 transition-all duration-300 backdrop-blur-md hover:border-amber-400/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] active:scale-95"
            title="Buka Menu Format SK & Pengaturan Template Google Docs"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Format SK</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
              templateMode === 'google_docs' ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30' : 'bg-amber-500/20 text-amber-200 border border-amber-400/30'
            }`}>
              {templateMode === 'google_docs' ? 'Google Docs' : 'Template Bawaan'}
            </span>
          </button>

          {/* Cetak Per Unit Kerja */}
          <button
            onClick={onOpenUnitKerjaPrintModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900/70 hover:bg-slate-800/80 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all duration-300 backdrop-blur-md hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] active:scale-95"
            title="Cetak SATU PDF berisi semua pegawai yang memiliki Unit Kerja yang sama"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cetak SK per Unit Kerja</span>
          </button>

          {/* Integrasi Simpan ke Drive */}
          <button
            onClick={onOpenDriveExportModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.35)] transition-all duration-300 active:scale-95 border border-cyan-400/40"
            title="Simpan otomatis dokumen SK ke Google Drive"
          >
            <HardDrive className="w-3.5 h-3.5 text-cyan-200" />
            <span>Simpan ke Drive</span>
          </button>

        </div>

      </div>

    </div>
  );
};
