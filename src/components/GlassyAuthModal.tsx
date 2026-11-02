import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppRole, AppSession } from '../types/kgb';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  KeyRound,
  UserPlus,
  LogIn
} from 'lucide-react';

interface GlassyAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: AppSession) => void;
  currentSession: AppSession | null;
  onGoogleLogin?: () => void;
  isGoogleLoggingIn?: boolean;
}

interface CustomUser {
  username: string;
  password: string;
  displayName: string;
  role: AppRole;
}

const STORAGE_CUSTOM_USERS = 'kgb_app_custom_users_v1';

export const GlassyAuthModal: React.FC<GlassyAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentSession,
  onGoogleLogin,
  isGoogleLoggingIn
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Signup form state
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<AppRole>('user');

  if (!isOpen) return null;

  // Handle Quick Fill
  const handleQuickFill = (role: AppRole) => {
    setErrorMessage(null);
    if (role === 'admin') {
      setUsername('V3');
      setPassword('Admin');
    } else {
      setUsername('User');
      setPassword('user');
    }
  };

  // Handle Login Submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    setTimeout(() => {
      // 1. Verify default credentials
      // Admin: username: V3 & password: Admin (akses penuh)
      if (
        (cleanUser === 'V3' || cleanUser.toLowerCase() === 'v3') &&
        cleanPass === 'Admin'
      ) {
        const session: AppSession = {
          username: 'V3',
          role: 'admin',
          displayName: 'Administrator (V3)',
          loginTime: new Date().toISOString()
        };
        setSuccessMessage('Berhasil masuk sebagai Admin (Akses Penuh)!');
        setTimeout(() => {
          onLoginSuccess(session);
          setIsSubmitting(false);
        }, 600);
        return;
      }

      // User: username: User & password: user (hanya melihat)
      if (
        (cleanUser === 'User' || cleanUser.toLowerCase() === 'user') &&
        cleanPass === 'user'
      ) {
        const session: AppSession = {
          username: 'User',
          role: 'user',
          displayName: 'Staf / Pelihat (User)',
          loginTime: new Date().toISOString()
        };
        setSuccessMessage('Berhasil masuk sebagai User (Hanya Melihat)!');
        setTimeout(() => {
          onLoginSuccess(session);
          setIsSubmitting(false);
        }, 600);
        return;
      }

      // 2. Check custom signed up users in localStorage
      try {
        const rawCustom = localStorage.getItem(STORAGE_CUSTOM_USERS);
        if (rawCustom) {
          const customUsers: CustomUser[] = JSON.parse(rawCustom);
          const found = customUsers.find(
            u => u.username.toLowerCase() === cleanUser.toLowerCase() && u.password === cleanPass
          );
          if (found) {
            const session: AppSession = {
              username: found.username,
              role: found.role,
              displayName: found.displayName || found.username,
              loginTime: new Date().toISOString()
            };
            setSuccessMessage(`Berhasil masuk sebagai ${found.role === 'admin' ? 'Admin' : 'User'}!`);
            setTimeout(() => {
              onLoginSuccess(session);
              setIsSubmitting(false);
            }, 600);
            return;
          }
        }
      } catch (err) {
        console.error('Failed reading custom users:', err);
      }

      // Invalid credentials
      setErrorMessage(
        'Kredensial tidak cocok. Gunakan Admin (username: V3 & password: Admin) atau User (username: User & password: user).'
      );
      setIsSubmitting(false);
    }, 450);
  };

  // Handle Signup Submission
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regUsername.trim() || !regPassword.trim()) {
      setErrorMessage('Username dan Password wajib diisi.');
      return;
    }

    if (regPassword.length < 4) {
      setErrorMessage('Password minimal 4 karakter.');
      return;
    }

    try {
      const rawCustom = localStorage.getItem(STORAGE_CUSTOM_USERS);
      const customUsers: CustomUser[] = rawCustom ? JSON.parse(rawCustom) : [];

      if (customUsers.some(u => u.username.toLowerCase() === regUsername.trim().toLowerCase())) {
        setErrorMessage('Username tersebut sudah digunakan.');
        return;
      }

      const newUser: CustomUser = {
        username: regUsername.trim(),
        password: regPassword,
        displayName: regFullName.trim() || regUsername.trim(),
        role: regRole
      };

      customUsers.push(newUser);
      localStorage.setItem(STORAGE_CUSTOM_USERS, JSON.stringify(customUsers));

      setSuccessMessage('Pendaftaran akun berhasil! Silakan login sekarang.');
      setUsername(newUser.username);
      setPassword(newUser.password);
      setTimeout(() => {
        setMode('login');
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mendaftarkan akun.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      {/* Background Ambient Glow Orbs */}
      <div className="fixed top-1/4 left-1/3 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/3 w-80 h-80 bg-blue-600/15 rounded-full blur-[110px] pointer-events-none" />

      {/* Main Glass Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md bg-slate-900/65 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-[0_0_50px_rgba(6,182,212,0.22)] p-6 sm:p-8 text-slate-100 overflow-hidden"
      >
        {/* Glow Accent Border Line at Top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Close Button */}
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

        {/* Mode Switcher Tabs */}
        <div className="flex items-center p-1 bg-slate-950/70 border border-white/10 rounded-2xl mb-6 backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.35)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.35)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar Akun</span>
          </button>
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

        {/* LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Quick Credentials Chips */}
            <div className="space-y-2 mb-3">
              <span className="text-[11px] font-bold text-slate-400 block tracking-wide">
                Pilih Role Akses Cepat:
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
                    V3 / Admin
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
                    User / user
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium">
                    Hanya Melihat
                  </div>
                </button>
              </div>
            </div>

            {/* Username Input */}
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
                  placeholder="Masukkan username (e.g. V3 atau User)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-white/15 rounded-xl text-white text-xs font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition shadow-inner"
                />
              </div>
            </div>

            {/* Password Input */}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:via-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all duration-300 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer mt-2"
            >
              <span>{isSubmitting ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Google Login Alternative */}
            {onGoogleLogin && (
              <div className="pt-3 border-t border-white/10 mt-4">
                <button
                  type="button"
                  onClick={onGoogleLogin}
                  disabled={isGoogleLoggingIn}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2.5 active:scale-98"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  <span>{isGoogleLoggingIn ? 'Menghubungkan...' : 'Masuk dengan Akun Google'}</span>
                </button>
              </div>
            )}
          </form>
        ) : (
          /* SIGNUP FORM */
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={regFullName}
                onChange={e => setRegFullName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-white/15 rounded-xl text-white text-xs font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Username Baru
              </label>
              <input
                type="text"
                required
                value={regUsername}
                onChange={e => setRegUsername(e.target.value)}
                placeholder="Masukkan username unik"
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-white/15 rounded-xl text-white text-xs font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                placeholder="Minimal 4 karakter"
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-white/15 rounded-xl text-white text-xs font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Pilih Role Akun
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegRole('user')}
                  className={`p-3 rounded-xl border text-left transition ${
                    regRole === 'user'
                      ? 'border-cyan-400 bg-cyan-950/30 text-white'
                      : 'border-white/10 bg-slate-950/40 text-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold">User</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Hanya melihat data</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRegRole('admin')}
                  className={`p-3 rounded-xl border text-left transition ${
                    regRole === 'admin'
                      ? 'border-cyan-400 bg-cyan-950/30 text-white'
                      : 'border-white/10 bg-slate-950/40 text-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold text-cyan-300">Admin</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Akses penuh sistem</div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:via-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all duration-300 flex items-center justify-center gap-2 active:scale-98 cursor-pointer mt-2"
            >
              <span>Daftarkan Akun Baru</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

      </motion.div>
    </div>
  );
};
