/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { KGBRecord, SKTemplateConfig, AppSession } from './types/kgb';
import { DEFAULT_KGB_DATA, DEFAULT_TEMPLATE, fetchSpreadsheetData, ALL_KGB_YEARS, hasValueCForYear } from './services/googleSheets';
import { initAuth, googleSignIn, logoutGoogle } from './services/firebase';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { FilterBar } from './components/FilterBar';
import { KGBTable } from './components/KGBTable';
import { SKPreviewModal } from './components/SKPreviewModal';
import { SheetsConfigModal } from './components/SheetsConfigModal';
import { UnitKerjaPrintModal } from './components/UnitKerjaPrintModal';
import { DriveExportModal } from './components/DriveExportModal';
import { TemplateEditorModal } from './components/TemplateEditorModal';
import { GlassyAuthModal } from './components/GlassyAuthModal';
import { CheckCircle2, AlertCircle, FileSpreadsheet, RotateCcw, FileText } from 'lucide-react';
import { getGajiPokok, parseMkYears } from './services/salaryTable';

const STORAGE_KEY_DATA = 'kgb_app_records_v10_mulai_tanggal_auto';
const STORAGE_KEY_TEMPLATE = 'kgb_app_template_v5_gdocs_master';
const STORAGE_KEY_SHEET_ID = 'kgb_app_sheet_id_v1';
const STORAGE_KEY_SESSION = 'kgb_app_session_v2';

const DEFAULT_SPREADSHEET_ID = '1ySnjA-CxZSLs-bcw5YHfNJx6Tm9VGxWTBoGbGeERPJU';
const DEFAULT_DOCS_TEMPLATE_ID = '1HE3b6txpsid3vAqwxbmZu3p6sojQt4wmqN9jlml7L_Q';

export default function App() {
  // ==========================================
  // 1. Auth & Session State
  // ==========================================
  const [session, setSession] = useState<AppSession | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SESSION);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cached session', e);
      }
    }
    return null;
  });

  // showAuthModal hanya untuk "Ganti Akun" saat sudah login.
  // Saat belum login, modal dipaksa terbuka via `isAuthModalOpen`.
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isAuthModalOpen = !session || showAuthModal;

  // Google Auth State (Hanya untuk integrasi Sheets/Drive jika diperlukan)
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ==========================================
  // 2. Data & Template State
  // ==========================================
  const [records, setRecords] = useState<KGBRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DATA);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((r: KGBRecord) => {
            const gol = r.kolomF || r.pangkatGol || 'V';
            const mkSblmYears = parseMkYears(r.mkSebelum);
            const mkSsdhYears = parseMkYears(r.mkSesudah);
            const correctGajiLama = (!r.gajiLama || r.gajiLama > 20000000 || r.gajiLama < 1800000 || mkSblmYears === 0)
              ? getGajiPokok(gol, mkSblmYears)
              : r.gajiLama;
            const correctGajiBaru = (!r.gajiBaru || r.gajiBaru > 20000000 || r.gajiBaru < 1800000)
              ? getGajiPokok(gol, mkSsdhYears)
              : r.gajiBaru;
            return { ...r, gajiLama: correctGajiLama, gajiBaru: correctGajiBaru };
          });
        }
      } catch (e) {
        console.error('Failed to parse cached records', e);
      }
    }
    return DEFAULT_KGB_DATA;
  });

  const [template, setTemplate] = useState<SKTemplateConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TEMPLATE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_TEMPLATE,
          ...parsed,
          templateMode: 'built_in', // Default ke built_in/Docxtemplater
          googleDocsTemplateId: parsed.googleDocsTemplateId || DEFAULT_DOCS_TEMPLATE_ID,
          templateText: parsed.templateText || DEFAULT_TEMPLATE.templateText
        };
      } catch (e) {
        console.error('Failed to parse cached template', e);
      }
    }
    return { ...DEFAULT_TEMPLATE, googleDocsTemplateId: DEFAULT_DOCS_TEMPLATE_ID };
  });

  // ==========================================
  // 3. Spreadsheet Config State
  // ==========================================
  const [spreadsheetInput, setSpreadsheetInput] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_SHEET_ID) || DEFAULT_SPREADSHEET_ID;
  });
  const [kgbSheetName, setKgbSheetName] = useState('DB KGB');
  const [templateSheetName, setTemplateSheetName] = useState('TEMPLATE');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; type: 'success' | 'info' | 'error' } | null>(null);

  // ==========================================
  // 4. Filter & Modal State
  // ==========================================
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [selectedUnitKerja, setSelectedUnitKerja] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const [previewRecord, setPreviewRecord] = useState<KGBRecord | null>(null);
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showUnitKerjaPrintModal, setShowUnitKerjaPrintModal] = useState(false);
  const [showDriveExportModal, setShowDriveExportModal] = useState(false);
  const [driveExportSingleRecord, setDriveExportSingleRecord] = useState<KGBRecord | null>(null);
  const [driveExportSingleUnit, setDriveExportSingleUnit] = useState<{ name: string; items: KGBRecord[] } | null>(null);

  // ==========================================
  // Toast Helper
  // ==========================================
  const showToast = (title: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ title, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ==========================================
  // 5. Firebase Auth Init (Untuk fitur Sheets/Drive)
  // ==========================================
  useEffect(() => {
    const unsubscribe = initAuth(
      async (usr, token) => {
        setUser(usr);
        if (token) {
          setAccessToken(token);
          await performAutoLoad(token);
        }
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const performAutoLoad = async (token: string) => {
    try {
      const cleanId = DEFAULT_SPREADSHEET_ID;
      const { records: fetchedRecords, template: fetchedTemplate } = await fetchSpreadsheetData(
        cleanId, token, kgbSheetName, templateSheetName
      );
      if (fetchedRecords && fetchedRecords.length > 0) {
        setRecords(fetchedRecords);
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(fetchedRecords));
      }
      if (fetchedTemplate) {
        setTemplate(prev => ({
          ...prev,
          ...fetchedTemplate,
          googleDocsTemplateId: prev.googleDocsTemplateId || DEFAULT_DOCS_TEMPLATE_ID
        }));
      }
    } catch (e) {
      console.warn('Auto load error:', e);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        showToast('Berhasil login dengan akun Google!');
        await performAutoLoad(res.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Gagal login dengan Google', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setUser(null);
    setAccessToken(null);
    showToast('Telah keluar dari akun Google', 'info');
  };

  // ==========================================
  // 6. Session Handlers
  // ==========================================
  const handleLoginSuccess = async (newSession: AppSession) => {
    setSession(newSession);
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(newSession));
    setShowAuthModal(false);
    showToast(
      `Selamat datang, ${newSession.displayName}! Masuk sebagai ${newSession.role === 'admin' ? 'Admin' : 'User'}.`,
      'success'
    );
    
    // Auto-load data dari spreadsheet publik (tanpa auth)
    try {
      const { records: fetchedRecords, template: fetchedTemplate } = await fetchSpreadsheetData(
        DEFAULT_SPREADSHEET_ID, null, kgbSheetName, templateSheetName
      );
      if (fetchedRecords && fetchedRecords.length > 0) {
        setRecords(fetchedRecords);
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(fetchedRecords));
      }
      if (fetchedTemplate) {
        setTemplate(prev => ({
          ...prev,
          ...fetchedTemplate,
          googleDocsTemplateId: prev.googleDocsTemplateId || DEFAULT_DOCS_TEMPLATE_ID
        }));
      }
    } catch (e) {
      console.warn('Auto-load from default spreadsheet failed, using demo data:', e);
    }
  };

  const handleLogoutSession = () => {
    setSession(null);
    localStorage.removeItem(STORAGE_KEY_SESSION);
    setShowAuthModal(false);
    showToast('Sesi role telah diakhiri. Silakan login kembali.', 'info');
  };

  // ==========================================
  // 7. Dynamic Filters & Data Computation
  // ==========================================
  const availableYears = useMemo(() => {
    const fromData = records
      .flatMap(r => [r.tahunKgb, ...(r.activeYears || [])])
      .filter((y): y is number => typeof y === 'number' && !isNaN(y));
    const combined = Array.from(new Set([...ALL_KGB_YEARS, ...fromData]));
    combined.sort((a, b) => a - b);
    return combined;
  }, [records]);

  useEffect(() => {
    if (!availableYears.includes(selectedYear) && availableYears.length > 0) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const availableMonthsForSelectedYear = useMemo(() => {
    const matchingRecords = records.filter(r => hasValueCForYear(r, selectedYear));
    const months = matchingRecords
      .map(r => r.bulanKgb)
      .filter((m): m is number => typeof m === 'number' && m >= 1 && m <= 12);
    return Array.from(new Set(months)).sort((a, b) => a - b);
  }, [records, selectedYear]);

  useEffect(() => {
    if (selectedMonth !== 'all' && !availableMonthsForSelectedYear.includes(selectedMonth)) {
      setSelectedMonth(availableMonthsForSelectedYear.length > 0 ? availableMonthsForSelectedYear[0] : 'all');
    }
  }, [selectedYear, availableMonthsForSelectedYear, selectedMonth]);

  const availableUnitKerja = useMemo(() => {
    const matchingRecords = records.filter(r => hasValueCForYear(r, selectedYear));
    return Array.from(new Set(matchingRecords.map(r => r.unitKerja.trim()).filter(Boolean))).sort();
  }, [records, selectedYear]);

  const filteredRecords = useMemo(() => {
    return records
      .filter(r => {
        if (!hasValueCForYear(r, selectedYear)) return false;
        if (selectedMonth !== 'all' && r.bulanKgb !== selectedMonth) return false;
        if (selectedUnitKerja !== 'all' && r.unitKerja.trim().toLowerCase() !== selectedUnitKerja.trim().toLowerCase()) return false;

        const currentNomorSk = r.yearDetails?.[selectedYear]?.nomorSk || r.nomorSk;
        if (statusFilter === 'pending' && Boolean(currentNomorSk && currentNomorSk.trim())) return false;
        if (statusFilter === 'completed' && (!currentNomorSk || !currentNomorSk.trim())) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          if (!r.nama.toLowerCase().includes(q) && 
              !r.nip.toLowerCase().includes(q) && 
              !r.jabatan.toLowerCase().includes(q) && 
              !r.unitKerja.toLowerCase().includes(q) &&
              !(currentNomorSk || '').toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .map(r => {
        const yearDetail = r.yearDetails?.[selectedYear];
        return {
          ...r,
          tahunKgb: selectedYear,
          tmtKgb: `${selectedYear}-${String(r.bulanKgb).padStart(2, '0')}-01`,
          nomorSk: yearDetail?.nomorSk || r.nomorSk,
          tanggalPenetapan: yearDetail?.tanggalPenetapan || r.tanggalPenetapan
        };
      });
  }, [records, selectedYear, selectedMonth, selectedUnitKerja, statusFilter, searchQuery]);

  // ==========================================
  // 8. CRUD & Save Handlers
  // ==========================================
  const handleUpdateRecord = (id: string, updates: Partial<KGBRecord>) => {
    setRecords(prev =>
      prev.map(r => {
        if (r.id === id) {
          const updatedYearDetails = { ...(r.yearDetails || {}) };
          if (updates.nomorSk !== undefined || updates.tanggalPenetapan !== undefined) {
            updatedYearDetails[selectedYear] = {
              ...(updatedYearDetails[selectedYear] || {}),
              ...(updates.nomorSk !== undefined ? { nomorSk: updates.nomorSk } : {}),
              ...(updates.tanggalPenetapan !== undefined ? { tanggalPenetapan: updates.tanggalPenetapan } : {})
            };
          }
          return { ...r, ...updates, yearDetails: updatedYearDetails };
        }
        return r;
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleSaveRecord = (id: string) => {
    if (session?.role !== 'admin') {
      showToast('Aksi dibatasi: Hanya Admin yang dapat menyimpan data.', 'error');
      return;
    }
    setRecords(prev => {
      const updated = prev.map(r => (r.id === id ? { ...r, isSaved: true } : r));
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(updated));
      return updated;
    });
    setHasUnsavedChanges(false);
    showToast('Data baris berhasil disimpan!');
  };

  const handleSaveAll = () => {
    if (session?.role !== 'admin') {
      showToast('Aksi dibatasi: Hanya Admin yang dapat menyimpan seluruh perubahan.', 'error');
      return;
    }
    setRecords(prev => {
      const updated = prev.map(r => ({ ...r, isSaved: true }));
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(updated));
      return updated;
    });
    setHasUnsavedChanges(false);
    showToast('Seluruh perubahan data KGB berhasil disimpan!');
  };

  const handleSaveTemplate = (newTemplate: SKTemplateConfig) => {
    if (session?.role !== 'admin') {
      showToast('Aksi dibatasi: Hanya Admin yang dapat mengubah template SK.', 'error');
      return;
    }
    setTemplate(newTemplate);
    localStorage.setItem(STORAGE_KEY_TEMPLATE, JSON.stringify(newTemplate));
    showToast('Format Template SK berhasil diperbarui!');
  };

  // ==========================================
  // 9. Sync & Demo Data Handlers
  // ==========================================
  const handleLoadFromSheets = async () => {
    let cleanId = spreadsheetInput.trim();
    const urlMatch = cleanId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch) cleanId = urlMatch[1];

    if (!cleanId) {
      setSyncError('Masukkan Spreadsheet ID atau URL yang valid');
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    const { records: fetchedRecords, template: fetchedTemplate, error } = await fetchSpreadsheetData(
      cleanId, accessToken, kgbSheetName, templateSheetName
    );

    setIsSyncing(false);

    if (error) {
      setSyncError(error);
      showToast(error, 'error');
      return;
    }

    if (fetchedRecords.length === 0) {
      setSyncError('Tidak ada data yang dapat dibaca dari sheet tersebut.');
      return;
    }

    setRecords(fetchedRecords);
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(fetchedRecords));
    localStorage.setItem(STORAGE_KEY_SHEET_ID, spreadsheetInput);

    if (fetchedTemplate) {
      setTemplate(fetchedTemplate);
      localStorage.setItem(STORAGE_KEY_TEMPLATE, JSON.stringify(fetchedTemplate));
    }

    setShowSheetsModal(false);
    showToast(`Berhasil memuat ${fetchedRecords.length} data pegawai!`);
  };

  const handleLoadDemoData = () => {
    setRecords(DEFAULT_KGB_DATA);
    setTemplate(DEFAULT_TEMPLATE);
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(DEFAULT_KGB_DATA));
    localStorage.setItem(STORAGE_KEY_TEMPLATE, JSON.stringify(DEFAULT_TEMPLATE));
    setHasUnsavedChanges(false);
    showToast('Data demo KGB berhasil dimuat ulang!');
  };

  // ==========================================
  // 10. Print & Export Handlers (DOCX)
  // ==========================================
  const handlePrintSingleSK = async (record: KGBRecord) => {
    showToast('Sedang membuat dokumen SK (Word)...', 'info');
    try {
      // Panggil generator Docxtemplater
      const { generateDocxSK } = await import('./services/docxGenerator');
      await generateDocxSK(record, template, selectedYear);
      showToast(`Dokumen SK berhasil diunduh.`);
    } catch (error: any) {
      console.error('Gagal membuat dokumen SK:', error);
      showToast(error.message || 'Gagal membuat dokumen SK.', 'error');
    }
  };

  const handleUploadSingleToDrive = (record: KGBRecord) => {
    setDriveExportSingleRecord(record);
    setDriveExportSingleUnit(null);
    setShowDriveExportModal(true);
  };

  const handleUploadUnitKerjaToDrive = (unitKerjaName: string, items: KGBRecord[]) => {
    setDriveExportSingleRecord(null);
    setDriveExportSingleUnit({ name: unitKerjaName, items });
    setShowDriveExportModal(true);
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      
      {/* Background Ambient Glow */}
      <div className="fixed top-[-10%] left-[15%] w-[42rem] h-[42rem] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-[35%] right-[-10%] w-[38rem] h-[38rem] bg-cyan-500/12 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[25%] w-[45rem] h-[45rem] bg-indigo-600/12 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Toast (Di luar gate agar selalu tampil saat login/logout) */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[60] flex items-center gap-3 px-4.5 py-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.7)] border border-white/20 bg-slate-900/90 text-white text-xs backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          )}
          <span className="font-semibold tracking-wide">{toastMessage.title}</span>
        </div>
      )}

      {/* LOGIN GATE */}
      <GlassyAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          if (!session) {
            showToast('Silakan login terlebih dahulu untuk masuk aplikasi.', 'info');
            return;
          }
          setShowAuthModal(false);
        }}
        onLoginSuccess={handleLoginSuccess}
        currentSession={session}
      />

      {/* MAIN APP (Hanya dirender setelah login) */}
      {session && (
        <>
          <Header
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
            isLoggingIn={isLoggingIn}
            onOpenSheetsConfig={() => {
              if (session?.role !== 'admin') showToast('Catatan: Akun User hanya dapat melihat konfigurasi Sheets.', 'info');
              setShowSheetsModal(true);
            }}
            onOpenTemplateEditor={() => {
              if (session?.role !== 'admin') showToast('Catatan: Akun User hanya dapat melihat pratinjau template.', 'info');
              setShowTemplateModal(true);
            }}
            isSyncing={isSyncing}
            onSync={handleLoadFromSheets}
            spreadsheetTitle={spreadsheetInput ? 'Google Sheets Terhubung' : undefined}
            hasUnsavedChanges={hasUnsavedChanges}
            onSaveAll={handleSaveAll}
            session={session}
            onOpenAuthModal={() => setShowAuthModal(true)}
            onLogoutSession={handleLogoutSession}
          />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 flex-1 w-full">
            
            {/* Info Banner */}
            {!spreadsheetInput && (
              <div className="mb-6 p-4.5 bg-slate-900/60 backdrop-blur-2xl text-white rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] border border-cyan-500/30 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500" />
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-500/15 text-cyan-300 rounded-xl border border-cyan-500/30 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black text-white text-sm tracking-tight">Filter Value &quot;C&quot; Kolom T:AD & Kolom K Aktif:</span>
                    <span className="text-slate-300 ml-1.5 block sm:inline mt-0.5 sm:mt-0">
                      Tahun 2026 memuat tepat 8 bulan sesuai value &quot;C&quot; (Januari, Februari, Maret, April, Juni, Juli, Oktober, November).
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <button onClick={handleLoadDemoData} className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/15 font-semibold rounded-xl transition duration-300 flex items-center gap-1.5 active:scale-95">
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Reset Demo</span>
                  </button>
                  <button onClick={() => setShowSheetsModal(true)} className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl transition duration-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95">
                    Koneksi Sheets
                  </button>
                </div>
              </div>
            )}

            <DashboardStats records={filteredRecords} allRecords={records} selectedYear={selectedYear} selectedMonth={selectedMonth} />

            {/* Banner Menu Format SK */}
            <div className="mb-6 p-4 sm:p-5 bg-slate-900/60 backdrop-blur-2xl border border-white/10 hover:border-cyan-500/30 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition duration-300">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="p-2.5 sm:p-3 rounded-2xl shrink-0 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-tight">Menu Format SK: Template Word (DocxTemplater)</h3>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full border bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
                      Cetak Tanpa Login
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Dokumen SK dihasilkan langsung dari file template `.docx` tanpa memerlukan koneksi API Google Docs.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                <button onClick={() => setShowTemplateModal(true)} className="px-4 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)] flex items-center gap-2 transition active:scale-95">
                  <FileText className="w-4 h-4 text-slate-950" />
                  <span>Menu Format SK</span>
                </button>
              </div>
            </div>

            <FilterBar
              years={availableYears} selectedYear={selectedYear} onSelectYear={setSelectedYear}
              availableMonths={availableMonthsForSelectedYear} selectedMonth={selectedMonth} onSelectMonth={setSelectedMonth}
              searchQuery={searchQuery} onSearchChange={setSearchQuery}
              selectedUnitKerja={selectedUnitKerja} onSelectUnitKerja={setSelectedUnitKerja} availableUnitKerja={availableUnitKerja}
              statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
              onOpenUnitKerjaPrintModal={() => setShowUnitKerjaPrintModal(true)}
              onOpenDriveExportModal={() => { setDriveExportSingleRecord(null); setDriveExportSingleUnit(null); setShowDriveExportModal(true); }}
              isDriveReady={Boolean(user && accessToken)}
              onOpenTemplateEditor={() => setShowTemplateModal(true)}
              templateMode={template.templateMode}
              hasGoogleDoc={Boolean(template.googleDocsTemplateId)}
            />

            <KGBTable
              records={filteredRecords}
              onUpdateRecord={handleUpdateRecord}
              onPreviewSK={rec => setPreviewRecord(rec)}
              onPrintSingleSK={handlePrintSingleSK}
              onUploadSingleToDrive={handleUploadSingleToDrive}
              onSaveRecord={handleSaveRecord}
              selectedYear={selectedYear}
              role={session?.role || 'admin'}
            />

          </main>

          <footer className="bg-slate-950/70 backdrop-blur-xl border-t border-white/10 py-5 text-center text-xs text-slate-400">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Sistem Informasi Kenaikan Gaji Berkala (KGB) &bull; Terintegrasi Google Sheets & DocxTemplater</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                KGB Perpres No. 11/2024 &bull; Format Standar BKN
              </div>
            </div>
          </footer>

          {/* Modals */}
          {previewRecord && (
            <SKPreviewModal
              record={previewRecord}
              template={template}
              onClose={() => setPreviewRecord(null)}
              onUploadToDrive={handleUploadSingleToDrive}
              isDriveReady={Boolean(user && accessToken)}
              accessToken={accessToken}
              onUpdateTemplate={handleSaveTemplate}
              selectedYear={selectedYear}
            />
          )}

          {showSheetsModal && (
            <SheetsConfigModal
              spreadsheetInput={spreadsheetInput} onSpreadsheetInputChange={setSpreadsheetInput}
              kgbSheetName={kgbSheetName} onKgbSheetNameChange={setKgbSheetName}
              templateSheetName={templateSheetName} onTemplateSheetNameChange={setTemplateSheetName}
              onLoadFromSheets={handleLoadFromSheets} onLoadDemoData={handleLoadDemoData}
              isLoading={isSyncing} error={syncError} onClose={() => setShowSheetsModal(false)}
              accessToken={accessToken} onNeedLogin={handleLogin}
            />
          )}

          {showTemplateModal && (
            <TemplateEditorModal
              template={template} onSaveTemplate={handleSaveTemplate} onClose={() => setShowTemplateModal(false)}
              accessToken={accessToken} sampleRecord={filteredRecords[0] || records[0]}
            />
          )}

          {showUnitKerjaPrintModal && (
            <UnitKerjaPrintModal
              records={filteredRecords} template={template} onClose={() => setShowUnitKerjaPrintModal(false)}
              onUploadUnitKerjaToDrive={handleUploadUnitKerjaToDrive} isDriveReady={Boolean(user && accessToken)}
              selectedYear={selectedYear}
            />
          )}

          {showDriveExportModal && (
            <DriveExportModal
              records={filteredRecords} template={template} accessToken={accessToken}
              onClose={() => { setShowDriveExportModal(false); setDriveExportSingleRecord(null); setDriveExportSingleUnit(null); }}
              singleRecord={driveExportSingleRecord} singleUnitKerja={driveExportSingleUnit}
              onNeedLogin={handleLogin}
            />
          )}
        </>
      )}
    </div>
  );
}
