import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppSession } from '../types/kgb';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  KeyRound,
  LogIn
} from 'lucide-react';

interface GlassyAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: AppSession) => void;
  currentSession: AppSession | null;
  // Props Google login tetap dipertahankan untuk kompatibilitas App.tsx,
  // tapi TIDAK dipakai di modal ini (tersedia di Header setelah login role).
  onGoogleLogin?: () => void;
  isGoogleLoggingIn?: boolean;
}

/**
 * Kredensial resmi — HANYA 2 USER yang diizinkan (hard-coded):
 *   Admin : username "V3"   / password "Admin"   → akses penuh
 *   User  : username "User" / password "user"    → hanya melihat
 *
 * Tidak ada pendaftaran akun baru. Tidak ada penyimpanan user custom.
 */
const OFFICIAL_USERS: Record<string, { password: string; role: 'admin' | 'user'; displayName: string }> = {
  v3:   { password: 'Admin', role: 'admin', displayName: 'Administrator (V3)' },
  user: { password: 'user',  role: 'user',  displayName: 'Staf / Pelihat (User)' }
};

export const GlassyAuthModal: React.FC<GlassyAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentSession
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleQuickFill = (role: 'admin' | 'user') => {
    setErrorMessage(null);
    if (role === 'admin') {
      setUsername('V3');
      setPassword('Admin');
    } else {
      setUsername('User');
      setPassword('user');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password; // password case-sensitive

    setTimeout(() => {
      const match = OFFICIAL_USERS[cleanUser];

      if (!match || match.password !== cleanPass) {
        // Pesan TIDAK membocorkan kredensial
        setErrorMessage('Username atau password salah. Hubungi Administrator jika lupa akses.');
        setIsSubmitting(false);
        return;
      }

      const session: AppSession = {
        username: cleanUser === 'v3' ? 'V3' : 'User',
        role: match.role,
        displayName: match.displayName,
        loginTime: new Date().toISOString()
      };

      setSuccessMessage(
        `Berhasil masuk sebagai ${match.role === 'admin' ? 'Admin (Akses Penuh)' : 'User (Hanya Melihat)'}!`
      );

      setTimeout(() => {
        onLoginSuccess(session);
        setIsSubmitting(false);
      }, 600);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      {/* Ambient Glow Orbs */}
      <div className="fixed top-1/4 left-1/3 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/3 w-80 h-80 bg-blue-600/15 rounded-full blur-[110px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md bg-slate-900/65 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-[0_0_50px_rgba(6,182,212,0.22)] p-6 sm:p-8 text-slate-100 overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Close hanya muncul jika sudah ada session (mode "Ganti Akun") */}
        {currentSession && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border border-cyan-400/40 shadow-[0_0_25px_rgba(6,182,212,0.3)] mb-3">
            <Lock className="w-7 h-7 text-cyan-300" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
            <span>KGB Online</span>
            <span className="text-cyan-400 font-mono text-xs px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30">
              Auth
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sistem Informasi Kenaikan Gaji Berkala Terpadu
          </p>
        </div>

        {/* Alert Messages */}
        <AnimatePresence mode="wait">
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-4 p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-4 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>{successMessage}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Fill Cards */}
        <div className="space-y-2 mb-4">
          <span className="text-[11px] font-bold text-slate-400 block tracking-wide">
            Akses Cepat:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-950/40 hover:border-cyan-400 text-left transition duration-200 group active:scale-95"
            >
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Admin</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                V3 / ••••••
              </div>
              <div className="text-[9px] text-cyan-400/90 font-medium">
                Akses Penuh
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('user')}
              className="p-2.5 rounded-xl border border-white/10 bg-slate-950/40 hover:bg-slate-950/70 hover:border-white/20 text-left transition duration-200 group active:scale-95"
            >
              <div className="flex items-center gap-1.5 text-slate-200 font-bold text-xs">
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>User</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                User / ••••
              </div>
              <div className="text-[9px] text-slate-400 font-medium">
                Hanya Melihat
              </div>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Username
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="V3 atau User"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-white/15 rounded-xl text-white text-xs font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-white/15 rounded-xl text-white text-xs font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition shadow-inner font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:via-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all duration-300 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer mt-2"
          >
            <span>{isSubmitting ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Info footer */}
        <div className="mt-5 pt-4 border-t border-white/10 text-center">
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Akses terbatas untuk <span className="text-cyan-400 font-semibold">2 akun resmi</span>:
            Admin (V3) &amp; User.
            <br />
            Hubungi Administrator jika memerlukan akses tambahan.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
