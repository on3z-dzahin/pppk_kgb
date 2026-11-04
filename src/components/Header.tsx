import React from 'react';
import { User } from 'firebase/auth';
import { AppSession } from '../types/kgb';
import {
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  onOpenSheetsConfig: () => void;
  onOpenTemplateEditor: () => void;
  isSyncing: boolean;
  onSync: () => void;
  spreadsheetTitle?: string;
  hasUnsavedChanges: boolean;
  onSaveAll: () => void;
  session: AppSession | null;
  onOpenAuthModal: () => void;
  onLogoutSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  onOpenAuthModal,
}) => {
  const isAdmin = session?.role === 'admin';
  
  return (
    <header className="bg-slate-950/75 backdrop-blur-2xl border-b border-white/10 text-white sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Brand with Blue Glow */}
          <div className="flex items-center gap-3.5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition duration-500" />
              <div className="relative w-11 h-11 rounded-xl bg-slate-900/90 border border-white/20 flex items-center justify-center backdrop-blur-xl shadow-inner">
                <span className="text-xl font-black bg-gradient-to-br from-cyan-300 via-blue-400 to-indigo-300 bg-clip-text text-transparent tracking-tighter">
                  SK
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span>KGB Online</span>
                  <span className="text-cyan-400 text-xs font-mono font-medium tracking-normal px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30">
                    PPU
                  </span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded-full backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Perpres 11/2024
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 text-[10px] font-medium bg-white/5 text-slate-300 border border-white/10 rounded-full">
                  DB KGB &bull; TEMPLATE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Dashboard Manajemen & Cetak Surat Keputusan Kenaikan Gaji Berkala
              </p>
            </div>
          </div>

          {/* Action Tools & User Auth */}
          <div className="flex flex-wrap items-center gap-2.5">

            {/* Role & Auth Status Pill */}
            {session ? (
              <div className="flex items-center gap-1.5 p-1 pl-2.5 bg-slate-900/80 border border-white/15 rounded-2xl backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.12)]">
                <div className="flex items-center gap-2 pr-1">
                  {isAdmin ? (
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-slate-800 border border-white/20 text-slate-300">
                      <UserIcon className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <div className="text-left">
                    <div className="text-xs font-black tracking-tight leading-none text-white flex items-center gap-1.5">
                      <span>{session.username}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase font-mono ${
                          isAdmin
                            ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                            : 'bg-slate-800 text-slate-300 border border-white/10'
                        }`}
                      >
                        {isAdmin ? 'Admin' : 'User'}
                      </span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">
                      {isAdmin ? 'Akses Penuh' : 'Hanya Melihat'}
                    </div>
                  </div>
                </div>

                {/* Ganti Role / Akun Button */}
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="px-2.5 py-1 text-[11px] font-bold text-cyan-300 hover:text-white bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 rounded-xl transition duration-200"
                  title="Ganti Akun atau Beralih Role"
                >
                  Ganti Akun
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:to-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300 active:scale-95 cursor-pointer"
                title="Buka Glassy Login Form"
              >
                <span>Login Role</span>
              </button>
            )}

            {/* 
              ========================================================
              SEMUA TOMBOL DI BAWAH INI TELAH DISEMBUNYIKAN/DIHAPUS:
              - Google Sheets
              - Sinkron
              - Format SK
              - Tersimpan / Simpan Perubahan
              - Login Google
              ========================================================
            */}

          </div>

        </div>
      </div>
    </header>
  );
};
