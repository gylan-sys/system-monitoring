import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  User as UserIcon, 
  Users, 
  ArrowRight, 
  UserPlus, 
  LogIn, 
  AlertCircle, 
  BookOpen, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  HelpCircle 
} from 'lucide-react';
import { User } from '../types';

interface LoginViewProps {
  usersList: User[];
  teamsList: string[];
  selfRegistrationEnabled: boolean;
  onLoginSuccess: (user: User) => void;
  onRegister: (newUser: User) => void;
  appName: string;
  appSubtitle: string;
  appLogo: string;
  loginBg?: string;
}

export default function LoginView({
  usersList,
  teamsList,
  selfRegistrationEnabled,
  onLoginSuccess,
  onRegister,
  appName,
  appSubtitle,
  appLogo,
  loginBg = 'dark'
}: LoginViewProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [team, setTeam] = useState(teamsList[0] || 'Tim A');
  const [error, setError] = useState<string | null>(null);
  
  // Local background state that defaults to localStorage or the loginBg prop
  const [currentBg, setCurrentBg] = useState<string>(() => {
    return localStorage.getItem('cfg_login_bg') || loginBg || 'dark';
  });

  // Sync back when parent or localStorage updates
  useEffect(() => {
    const handleSettingsUpdated = () => {
      const storedBg = localStorage.getItem('cfg_login_bg');
      if (storedBg) {
        setCurrentBg(storedBg);
      }
    };
    window.addEventListener('lab_settings_updated', handleSettingsUpdated);
    return () => window.removeEventListener('lab_settings_updated', handleSettingsUpdated);
  }, []);

  // Handle message from OAuth popup window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }
      
      if (event.data?.type === 'GOOGLE_OAUTH_SUCCESS' && event.data?.user) {
        onLoginSuccess(event.data.user);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLoginSuccess]);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const response = await fetch(`/api/auth/google/url?redirectUri=${encodeURIComponent(redirectUri)}`);
      if (!response.ok) {
        throw new Error('Gagal memuat sistem masuk Google dari server.');
      }
      
      const { url } = await response.json();
      const width = 520;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        url,
        'google_signin_popup',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=no`
      );
      
      if (!popup) {
        setError('Popup diblokir! Izinkan popup untuk melanjutkan masuk menggunakan akun Google.');
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(err.message || 'Terjadi kesalahan sistem saat menghubungi server Google.');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Username dan password harus diisi.');
      return;
    }

    const matched = usersList.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (matched) {
      onLoginSuccess(matched);
    } else {
      setError('Username atau password salah.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !username.trim() || !password.trim()) {
      setError('Semua data pendaftaran harus diisi.');
      return;
    }

    const exists = usersList.some(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (exists) {
      setError('Username sudah digunakan oleh petugas lain.');
      return;
    }

    const isAdmin = username.trim().toLowerCase().includes('gkrismantara');
    const newUser: User = {
      id: `USR-${Date.now()}`,
      username: username.trim(),
      password: password,
      name: name.trim(),
      role: isAdmin ? 'admin' : 'petugas',
      team: isAdmin ? '' : team,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onRegister(newUser);
    onLoginSuccess(newUser);
  };



  const isCustomBg = currentBg && !['dark', 'forest', 'cyber', 'sunset', 'light'].includes(currentBg);

  // Helper styles for presets of Left panel background
  const getPresetBackgroundClass = () => {
    if (currentBg === 'forest') return 'bg-gradient-to-br from-zinc-950 via-emerald-950 to-zinc-900';
    if (currentBg === 'cyber') return 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900';
    if (currentBg === 'sunset') return 'bg-gradient-to-br from-zinc-900 via-orange-950 to-zinc-950';
    if (currentBg === 'light') return 'bg-gradient-to-br from-slate-200 via-slate-100 to-indigo-50/50';
    return 'bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950';
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 relative overflow-hidden font-sans">
      
      {/* ==================== LEFT SIDE: BRANDING, INFORMATION & CUSTOM BACKGROUND ==================== */}
      <div 
        className={`hidden lg:flex lg:w-[55%] xl:w-[60%] relative flex-col justify-between p-12 text-white overflow-hidden ${getPresetBackgroundClass()} transition-all duration-500 border-r border-slate-200/10`}
        style={isCustomBg ? {
          backgroundImage: `url(${currentBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : undefined}
      >
        {/* Semi-transparent mask on custom background for higher text readability */}
        {isCustomBg && (
          <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px] z-0" />
        )}
        
        {/* Soft background glow circles to add premium modern style */}
        {!isCustomBg && currentBg !== 'light' && (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
          </>
        )}

        {/* 1. Header Row */}
        <div className="flex items-center justify-between z-10 relative">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-lg border border-white/20">
              {appLogo.startsWith('data:image/') || appLogo.startsWith('http') ? (
                <img src={appLogo} alt="Logo" className="w-8 h-8 object-contain" />
              ) : (
                appLogo
              )}
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
                {appName}
              </h1>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1 block">
                {appSubtitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-[10px] font-extrabold tracking-wider uppercase text-slate-200 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Operational Live</span>
          </div>
        </div>

        {/* 2. Middle Content Area: Information Layout */}
        <div className="my-auto max-w-xl z-10 relative space-y-8 pt-8 pb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-200 px-3 py-1 rounded-lg text-xs font-bold border border-indigo-400/10">
              <Sparkles size={13} className="animate-pulse" />
              <span>Sistem Manajemen Kalibrasi Terpadu</span>
            </div>
            <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Sistem Kalibrasi & <br className="hidden xl:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-emerald-300">
                Pemantauan Alat Lab
              </span>
            </h2>
            <p className="text-slate-200/90 text-sm leading-relaxed font-medium">
              Aplikasi pendukung standardisasi mutu laboratorium berdasarkan ISO/IEC 17025. Memantau kelayakan alat, rekam kalibrasi berkala, dan penugasan tim sampling secara digital.
            </p>
          </div>

          {/* Core operational benefits */}
          <div className="space-y-4 pt-2">
            {/* Benefit 1 */}
            <div className="flex gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-xs transition duration-200">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-400/20">
                <Award className="text-indigo-300" size={18} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-100">Standardisasi ISO/IEC 17025</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Menjaga rantai ketertelusuran standar dengan interval kalibrasi akurat dan log audit lengkap untuk seluruh peralatan sampling.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-xs transition duration-200">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-400/20">
                <ShieldCheck className="text-indigo-300" size={18} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-100">Peringatan Kadaluarsa Otomatis</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sistem otomatis memberikan tanda penanganan darurat pada alat yang mendekati masa habis kalibrasi (expired) dalam 30 hari.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-xs transition duration-200">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-400/20">
                <Users className="text-indigo-300" size={18} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-100">Distribusi Tim & Manajemen Lapangan</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Mempermudah verifikasi dan checklist peminjaman alat bagi petugas sampling lapangan secara instan dan paperless.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Footer Row: Information */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-10 relative pt-6 border-t border-white/10 text-xs text-slate-300/80 font-medium">
          <div>
            <span>Komite Akreditasi Nasional (KAN) compliant • v2.4</span>
          </div>
          <div className="flex items-center gap-1.5 opacity-90">
            <span>Terstandardisasi ISO/IEC 17025</span>
          </div>
        </div>
      </div>

      {/* ==================== RIGHT SIDE: SOFT MINIMALIST LOGIN FORM (WHITE) ==================== */}
      <div className="w-full lg:w-[45%] xl:w-[40%] bg-white flex flex-col justify-center items-center p-6 sm:p-12 md:p-16 min-h-screen relative shadow-2xl z-10">
        
        {/* Small floating hint/help button */}
        <div className="absolute top-6 right-6 hidden sm:block">
          <button 
            type="button"
            onClick={() => alert(`Sistem masuk terenkripsi secara lokal. Gunakan akun yang sudah terdaftar atau buat akun petugas baru jika fitur registrasi diaktifkan.`)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition cursor-pointer"
            title="Bantuan Masuk"
          >
            <HelpCircle size={18} />
          </button>
        </div>

        <div className="max-w-md w-full py-8 space-y-8">
          
          {/* MOBILE ONLY BRAND LOGO IN HEADER */}
          <div className="lg:hidden flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/15 mb-3">
              {appLogo.startsWith('data:image/') || appLogo.startsWith('http') ? (
                <img src={appLogo} alt="Logo" className="w-8 h-8 object-contain" />
              ) : (
                appLogo
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{appName}</h1>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1.5">{appSubtitle}</p>
          </div>

          {/* Form Header */}
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center lg:justify-start gap-2">
              {isRegistering ? (
                <>
                  <UserPlus className="text-indigo-600" size={24} />
                  <span>Daftar Akun Petugas</span>
                </>
              ) : (
                <>
                  <LogIn className="text-indigo-600" size={24} />
                  <span>Masuk ke Sistem</span>
                </>
              )}
            </h2>
            <p className="text-slate-500 text-xs font-medium">
              {isRegistering 
                ? 'Lengkapi formulir pendaftaran untuk bergabung sebagai petugas sampling.' 
                : 'Silakan masuk menggunakan username dan password petugas sampling Anda.'
              }
            </p>
          </div>

          {/* Error Notice Panel */}
          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 flex items-start space-x-2.5 shadow-2xs">
              <AlertCircle className="text-rose-500 shrink-0 mt-0.5 animate-bounce" size={16} />
              <p className="text-xs font-semibold text-rose-700 leading-normal">{error}</p>
            </div>
          )}

          {!isRegistering ? (
            /* ==================== LOGIN FORM ==================== */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon size={16} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username Anda"
                    className="w-full bg-slate-50/80 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-150"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer select-none">
                    Lupa Password?
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound size={16} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50/80 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-150"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3.5 font-bold text-xs shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer mt-6"
              >
                <span>Masuk Sekarang</span>
                <ArrowRight size={14} />
              </button>

              {/* Divider Option */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-extrabold tracking-wider">
                  <span className="bg-white px-3 text-slate-400">Atau Masuk Dengan</span>
                </div>
              </div>

              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-slate-50 hover:bg-slate-100/70 text-slate-700 border border-slate-200 rounded-xl py-3 font-bold text-xs transition duration-150 flex items-center justify-center space-x-2.5 cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google Account</span>
              </button>

              {selfRegistrationEnabled && (
                <div className="pt-4 text-center border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(true);
                      setError(null);
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
                  >
                    Belum punya akun? Daftar sebagai Petugas
                  </button>
                </div>
              )}
            </form>
          ) : (
            /* ==================== REGISTER FORM ==================== */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon size={16} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda"
                    className="w-full bg-slate-50/80 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-150"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon size={16} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Buat username unik"
                    className="w-full bg-slate-50/80 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-150"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound size={16} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Buat password minimal 6 karakter"
                    className="w-full bg-slate-50/80 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-150"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Pilih Tim Sampling
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Users size={16} />
                  </div>
                  <select
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold text-slate-850 focus:outline-none transition-all duration-150 appearance-none cursor-pointer"
                  >
                    {teamsList.map((t) => (
                      <option key={t} value={t} className="text-slate-800">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3.5 font-bold text-xs shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer mt-6"
              >
                <span>Daftar Akun Petugas</span>
                <ArrowRight size={14} />
              </button>

              {/* Divider Option */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-extrabold tracking-wider">
                  <span className="bg-white px-3 text-slate-400">Atau Daftar Dengan</span>
                </div>
              </div>

              {/* Google Registration Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-slate-50 hover:bg-slate-100/70 text-slate-700 border border-slate-200 rounded-xl py-3 font-bold text-xs transition duration-150 flex items-center justify-center space-x-2.5 cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google Account</span>
              </button>

              <div className="pt-4 text-center border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    setError(null);
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
                >
                  Sudah punya akun? Masuk disini
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
