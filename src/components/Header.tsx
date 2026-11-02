import React from 'react';
import { User } from 'firebase/auth';
import { AppSession } from '../types/kgb';
import {
  FileSpreadsheet,
  HardDrive,
  RefreshCw,
  FileText,
  Settings,
  LogIn,
  LogOut,
  CheckCircle2,
  ShieldCheck,
  User as UserIcon,
  Sparkles,
  Lock
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
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  onOpenSheetsConfig,
  onOpenTemplateEditor,
  isSyncing,
  onSync,
  spreadsheetTitle,
  hasUnsavedChanges,
  onSaveAll,
  session,
  onOpenAuthModal,
  onLogoutSession
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
                <Lock className="w-3.5 h-3.5" />
                <span>Login Role</span>
              </button>
            )}

            <div className="h-6 w-px bg-white/10 mx-0.5 hidden sm:block" />
            
            {/* Google Sheets Status / Config */}
            <button
              onClick={onOpenSheetsConfig}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 border border-white/10 hover:border-cyan-500/40 transition-all duration-300 shadow-sm backdrop-blur-md hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] active:scale-95"
              title="Konfigurasi Sumber Data Google Sheets"
            >
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <span className="max-w-[130px] truncate">
                {spreadsheetTitle || 'Hubungkan Sheets'}
              </span>
            </button>

            {/* Refresh / Sync */}
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 border border-white/10 hover:border-cyan-500/40 transition-all duration-300 backdrop-blur-md disabled:opacity-50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] active:scale-95"
              title="Sinkronisasi Data Google Sheets Real-time"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sinkron</span>
            </button>

            {/* Menu Format SK (Google Docs & Bawaan) */}
            <button
              onClick={onOpenTemplateEditor}
              className="relative group flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-cyan-200 transition-all duration-300 backdrop-blur-md active:scale-95 overflow-hidden"
              title="Menu Format SK: Hubungkan Google Docs Template atau Kustomisasi Template"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-cyan-500/30 to-blue-600/30 border border-cyan-400/40 rounded-xl group-hover:border-cyan-300 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition duration-300" />
              <FileText className="relative w-4 h-4 text-cyan-300 shrink-0" />
              <span className="relative">Format SK</span>
              <span className="relative hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-semibold bg-cyan-400/20 text-cyan-200 rounded border border-cyan-400/30">
                Google Docs
              </span>
            </button>

            {/* Save All Changes Button (Admin only or disabled for user) */}
            {isAdmin ? (
              <button
                onClick={onSaveAll}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 backdrop-blur-md active:scale-95 ${
                  hasUnsavedChanges
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse'
                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{hasUnsavedChanges ? 'Simpan Perubahan *' : 'Tersimpan'}</span>
              </button>
            ) : (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900/40 text-slate-400 border border-white/5 cursor-not-allowed"
                title="Fitur simpan hanya dapat digunakan oleh akun Admin (V3)"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Mode Lihat</span>
              </div>
            )}

            {/* Google Authentication */}
            <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

            {user ? (
              <div className="flex items-center gap-2.5 pl-1 bg-white/5 border border-white/10 px-2 py-1 rounded-xl backdrop-blur-md">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full ring-2 ring-cyan-400/50"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-slate-950 flex items-center justify-center text-xs font-black">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[120px]">
                    {user.displayName || 'Akun Google'}
                  </div>
                  <div className="text-[10px] text-cyan-400 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    Drive & Sheets
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  title="Keluar Google"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                disabled={isLoggingIn}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] transition duration-300 disabled:opacity-50 active:scale-95"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isLoggingIn ? 'Menghubungkan...' : 'Login Google'}</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
