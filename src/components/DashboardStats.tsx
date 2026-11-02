import React from 'react';
import { KGBRecord } from '../types/kgb';
import { formatRupiah } from '../services/salaryTable';
import { Users, FileCheck, AlertCircle, Building2, TrendingUp } from 'lucide-react';

interface DashboardStatsProps {
  records: KGBRecord[];
  allRecords: KGBRecord[];
  selectedYear: number;
  selectedMonth: number | 'all';
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  records,
  allRecords,
  selectedYear,
  selectedMonth
}) => {
  const totalInFilter = records.length;
  const sudahSk = records.filter(r => Boolean(r.nomorSk && r.nomorSk.trim())).length;
  const belumSk = totalInFilter - sudahSk;
  const percentage = totalInFilter > 0 ? Math.round((sudahSk / totalInFilter) * 100) : 0;

  // Unique unit kerja count in current filter
  const uniqueUnits = new Set(records.map(r => r.unitKerja.trim()).filter(Boolean)).size;

  // Total kenaikan gaji (Selisih Gaji Pokok Baru - Gaji Pokok Lama)
  const totalSelisih = records.reduce((acc, r) => {
    const diff = (r.gajiBaru || 0) - (r.gajiLama || 0);
    return acc + (diff > 0 ? diff : 0);
  }, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      
      {/* 1. Total Pegawai (Target KGB) */}
      <div className="relative group bg-slate-900/55 hover:bg-slate-900/75 backdrop-blur-xl rounded-2xl p-4.5 border border-white/10 hover:border-cyan-400/40 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_0_rgba(6,182,212,0.18)] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400/90 font-mono">
            Target KGB
          </span>
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 group-hover:scale-110 transition-transform">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-black text-white tracking-tight">{totalInFilter}</div>
          <span className="text-xs text-slate-400 font-medium">Pegawai</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          Tahun {selectedYear} {selectedMonth !== 'all' ? `(Bulan ${selectedMonth})` : 'Semua Bulan'}
        </p>
      </div>

      {/* 2. SK Lengkap */}
      <div className="relative group bg-slate-900/55 hover:bg-slate-900/75 backdrop-blur-xl rounded-2xl p-4.5 border border-white/10 hover:border-emerald-400/40 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_0_rgba(16,185,129,0.18)] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400/90 font-mono">
            SK Ditetapkan
          </span>
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
            <FileCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-black text-emerald-300 tracking-tight">{sudahSk}</div>
          <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            {percentage}%
          </span>
        </div>
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-2.5 overflow-hidden border border-white/5">
          <div
            className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-1.5 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* 3. Belum Ditetapkan */}
      <div className="relative group bg-slate-900/55 hover:bg-slate-900/75 backdrop-blur-xl rounded-2xl p-4.5 border border-white/10 hover:border-amber-400/40 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_0_rgba(245,158,11,0.18)] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400/90 font-mono">
            Belum Ada SK
          </span>
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 group-hover:scale-110 transition-transform">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-black text-amber-300 tracking-tight">{belumSk}</div>
          <span className="text-xs text-slate-400 font-medium">Perlu Nomor SK</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${belumSk > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          {belumSk > 0 ? 'Dapat diisi manual / penomoran cepat' : 'Semua nomor SK lengkap!'}
        </p>
      </div>

      {/* 4. Unit Kerja */}
      <div className="relative group bg-slate-900/55 hover:bg-slate-900/75 backdrop-blur-xl rounded-2xl p-4.5 border border-white/10 hover:border-purple-400/40 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_0_rgba(168,85,247,0.18)] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400/90 font-mono">
            Unit Kerja
          </span>
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 group-hover:scale-110 transition-transform">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-black text-white tracking-tight">{uniqueUnits}</div>
          <span className="text-xs text-slate-400 font-medium">Instansi / OPD</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          Tersedia cetak 1 PDF gabungan
        </p>
      </div>

      {/* 5. Estimasi Kenaikan Anggaran */}
      <div className="relative group bg-slate-900/55 hover:bg-slate-900/75 backdrop-blur-xl rounded-2xl p-4.5 border border-white/10 hover:border-blue-400/40 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_0_rgba(59,130,246,0.18)] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400/90 font-mono">
            Kenaikan Gaji/Bln
          </span>
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-lg font-black text-cyan-300 truncate">
            {formatRupiah(totalSelisih)}
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          Selisih per bulan dalam filter
        </p>
      </div>

    </div>
  );
};
