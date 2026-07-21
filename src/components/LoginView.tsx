import React, { useState } from 'react';
import { KeyRound, User as UserIcon, Users, ArrowRight, UserPlus, LogIn, AlertCircle } from 'lucide-react';
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

  // Dynamic Theme Styling based on loginBg
  let containerClass = "min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden px-4";
  let cardClass = "bg-slate-800/80 backdrop-blur-md rounded-2xl p-8 border border-slate-700/50 shadow-2xl";
  let titleClass = "text-xl font-bold text-white mb-6 flex items-center space-x-2";
  let labelClass = "block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2";
  let inputClass = "w-full bg-slate-900/50 border border-slate-700 focus:border-indigo-500 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium text-white placeholder-slate-500 focus:outline-none transition";
  let selectClass = "w-full bg-slate-900/50 border border-slate-700 focus:border-indigo-500 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium text-white focus:outline-none transition appearance-none";
  let dividerTextClass = "bg-slate-800 px-3 text-slate-400 font-extrabold text-[10px] tracking-wider";
  let googleButtonClass = "w-full bg-slate-900 hover:bg-slate-950 text-slate-200 border border-slate-700/80 hover:border-slate-600 rounded-xl py-3 font-extrabold text-xs transition flex items-center justify-center space-x-2 cursor-pointer shadow-md mb-2";
  let switchButtonClass = "text-xs font-bold text-indigo-400 hover:text-indigo-300 transition";
  let brandTitleClass = "text-2xl font-black tracking-tight text-white";
  let brandSubtitleClass = "text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1";
  
  let glowDiv1 = <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />;
  let glowDiv2 = <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />;

  if (loginBg === 'forest') {
    containerClass = "min-h-screen flex items-center justify-center bg-zinc-950 relative overflow-hidden px-4";
    cardClass = "bg-zinc-900/80 backdrop-blur-md rounded-2xl p-8 border border-emerald-950/50 shadow-2xl";
    titleClass = "text-xl font-bold text-white mb-6 flex items-center space-x-2";
    labelClass = "block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2";
    inputClass = "w-full bg-black/50 border border-emerald-900/60 focus:border-emerald-500 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium text-white placeholder-zinc-600 focus:outline-none transition";
    selectClass = "w-full bg-black/50 border border-emerald-900/60 focus:border-emerald-500 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium text-white focus:outline-none transition appearance-none";
    dividerTextClass = "bg-zinc-900 px-3 text-emerald-500/80 font-extrabold text-[10px] tracking-wider";
    googleButtonClass = "w-full bg-zinc-950 hover:bg-black text-emerald-300 border border-emerald-900/80 hover:border-emerald-700 rounded-xl py-3 font-extrabold text-xs transition flex items-center justify-center space-x-2 cursor-pointer shadow-md mb-2";
    switchButtonClass = "text-xs font-bold text-emerald-400 hover:text-emerald-300 transition";
    brandTitleClass = "text-2xl font-black tracking-tight text-white";
    brandSubtitleClass = "text-xs text-emerald-400/80 font-semibold uppercase tracking-wider mt-1";
    glowDiv1 = <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />;
    glowDiv2 = <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />;
  } else if (loginBg === 'cyber') {
    containerClass = "min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-4";
    cardClass = "bg-slate-900/80 backdrop-blur-md rounded-2xl p-8 border border-purple-950/50 shadow-2xl";
    titleClass = "text-xl font-bold text-white mb-6 flex items-center space-x-2";
    labelClass = "block text-xs font-bold text-purple-400 uppercase tracking-wider mb-2";
    inputClass = "w-full bg-black/50 border border-purple-900/60 focus:border-purple-500 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium text-white placeholder-purple-900/30 focus:outline-none transition";
    selectClass = "w-full bg-black/50 border border-purple-900/60 focus:border-purple-500 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium text-white focus:outline-none transition appearance-none";
    dividerTextClass = "bg-slate-900 px-3 text-purple-500/80 font-extrabold text-[10px] tracking-wider";
    googleButtonClass = "w-full bg-slate-950 hover:bg-black text-purple-300 border border-purple-900/80 hover:border-purple-700 rounded-xl py-3 font-extrabold text-xs transition flex items-center justify-center space-x-2 cursor-pointer shadow-md mb-2";
    switchButtonClass = "text-xs font-bold text-purple-400 hover:text-purple-300 transition";
    brandTitleClass = "text-2xl font-black tracking-tight text-white";
    brandSubtitleClass = "text-xs text-purple-400/80 font-semibold uppercase tracking-wider mt-1";
    glowDiv1 = <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/15 blur-[120px] pointer-events-none" />;
    glowDiv2 = <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-500/10 blur-[120px] pointer-events-none" />;
  } else if (loginBg === 'sunset') {
    containerClass = "min-h-screen flex items-center justify-center bg-zinc-900 relative overflow-hidden px-4";
    cardClass = "bg-zinc-800/80 backdrop-blur-md rounded-2xl p-8 border border-orange-950/50 shadow-2xl";
    titleClass = "text-xl font-bold text-white mb-6 flex items-center space-x-2";
    labelClass = "block text-xs font-bold text-orange-400 uppercase tracking-wider mb-2";
    inputClass = "w-full bg-black/50 border border-orange-900/60 focus:border-orange-500 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium text-white placeholder-orange-950/30 focus:outline-none transition";
    selectClass = "w-full bg-black/50 border border-orange-900/60 focus:border-orange-500 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium text-white focus:outline-none transition appearance-none";
    dividerTextClass = "bg-zinc-800 px-3 text-orange-500/80 font-extrabold text-[10px] tracking-wider";
    googleButtonClass = "w-full bg-zinc-900 hover:bg-zinc-950 text-orange-300 border border-orange-900/80 hover:border-orange-700 rounded-xl py-3 font-extrabold text-xs transition flex items-center justify-center space-x-2 cursor-pointer shadow-md mb-2";
    switchButtonClass = "text-xs font-bold text-orange-400 hover:text-orange-300 transition";
    brandTitleClass = "text-2xl font-black tracking-tight text-white";
    brandSubtitleClass = "text-xs text-orange-400/80 font-semibold uppercase tracking-wider mt-1";
    glowDiv1 = <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />;
    glowDiv2 = <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rose-500/10 blur-[120px] pointer-events-none" />;
  } else if (loginBg === 'light') {
    containerClass = "min-h-screen flex items-center justify-center bg-slate-100 relative overflow-hidden px-4";
    cardClass = "bg-white rounded-2xl p-8 border border-slate-200 shadow-xl";
    titleClass = "text-xl font-bold text-slate-800 mb-6 flex items-center space-x-2";
    labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2";
    inputClass = "w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none transition";
    selectClass = "w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 focus:outline-none transition appearance-none";
    dividerTextClass = "bg-white px-3 text-slate-400 font-extrabold text-[10px] tracking-wider";
    googleButtonClass = "w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl py-3 font-extrabold text-xs transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm mb-2";
    switchButtonClass = "text-xs font-bold text-indigo-600 hover:text-indigo-700 transition";
    brandTitleClass = "text-2xl font-black tracking-tight text-slate-800";
    brandSubtitleClass = "text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1";
    glowDiv1 = <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sky-500/5 blur-[120px] pointer-events-none" />;
    glowDiv2 = <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />;
  }

  const hasCustomBg = loginBg && !['dark', 'forest', 'cyber', 'sunset', 'light'].includes(loginBg);
  if (hasCustomBg) {
    containerClass = "min-h-screen flex items-center justify-center relative overflow-hidden px-4 bg-slate-950";
    cardClass = "bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/40 shadow-2xl z-10";
    titleClass = "text-xl font-bold text-white mb-6 flex items-center space-x-2";
    labelClass = "block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2";
    inputClass = "w-full bg-slate-950/70 border border-slate-700 focus:border-indigo-500 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium text-white placeholder-slate-500 focus:outline-none transition";
    selectClass = "w-full bg-slate-950/70 border border-slate-700 focus:border-indigo-500 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium text-white focus:outline-none transition appearance-none";
    dividerTextClass = "bg-slate-900 px-3 text-slate-450 font-extrabold text-[10px] tracking-wider";
    googleButtonClass = "w-full bg-slate-950 hover:bg-black text-slate-200 border border-slate-750 hover:border-slate-650 rounded-xl py-3 font-extrabold text-xs transition flex items-center justify-center space-x-2 cursor-pointer shadow-md mb-2";
    switchButtonClass = "text-xs font-bold text-indigo-400 hover:text-indigo-300 transition";
    brandTitleClass = "text-2xl font-black tracking-tight text-white drop-shadow-md z-10";
    brandSubtitleClass = "text-xs text-slate-200 font-extrabold uppercase tracking-wider mt-1 drop-shadow-xs z-10 bg-slate-950/30 px-2.5 py-0.5 rounded-full backdrop-blur-xs";
    glowDiv1 = <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px] pointer-events-none" />;
    glowDiv2 = <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />;
  }

  // Handle message from OAuth popup window
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin to be safe
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
      
      // Determine origin and redirectUri
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      
      // Fetch Google Auth URL from backend
      const response = await fetch(`/api/auth/google/url?redirectUri=${encodeURIComponent(redirectUri)}`);
      if (!response.ok) {
        throw new Error('Gagal memuat sistem masuk Google dari server.');
      }
      
      const { url } = await response.json();
      
      // Open popup window centered
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
      role: isAdmin ? 'admin' : 'petugas', // Assign admin role if user is gkrismantara
      team: isAdmin ? '' : team,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onRegister(newUser);
    onLoginSuccess(newUser);
  };

  return (
    <div 
      className={containerClass}
      style={hasCustomBg ? { 
        backgroundImage: `url(${loginBg})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        backgroundRepeat: 'no-repeat' 
      } : undefined}
    >
      {/* Decorative ambient background gradients */}
      {glowDiv1}
      {glowDiv2}

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/25 mb-4 border border-indigo-400/20">
            {appLogo.startsWith('data:image/') || appLogo.startsWith('http') ? (
              <img src={appLogo} alt="Logo" className="w-10 h-10 object-contain" />
            ) : (
              appLogo
            )}
          </div>
          <h1 className={brandTitleClass}>{appName}</h1>
          <p className={brandSubtitleClass}>{appSubtitle}</p>
        </div>

        {/* Content Card */}
        <div className={cardClass}>
          <h2 className={titleClass}>
            {isRegistering ? (
              <>
                <UserPlus className="text-indigo-400" size={20} />
                <span>Pendaftaran Petugas</span>
              </>
            ) : (
              <>
                <LogIn className="text-indigo-400" size={20} />
                <span>Masuk ke Sistem</span>
              </>
            )}
          </h2>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 flex items-start space-x-2.5 mb-6">
              <AlertCircle className="text-rose-400 shrink-0 mt-0.5" size={16} />
              <p className="text-xs font-medium text-rose-200 leading-normal">{error}</p>
            </div>
          )}

          {!isRegistering ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={labelClass}>Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <UserIcon size={16} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound size={16} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3.5 font-bold text-sm shadow-lg shadow-indigo-600/15 transition flex items-center justify-center space-x-2 cursor-pointer mt-6"
              >
                <span>Masuk Sekarang</span>
                <ArrowRight size={16} />
              </button>

              {/* Google login option */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-700/40"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className={dividerTextClass}>Atau Masuk Dengan</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className={googleButtonClass}
              >
                <svg className="w-4 h-4 mr-1 shrink-0" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google Account</span>
              </button>

              {selfRegistrationEnabled && (
                <div className="pt-4 text-center border-t border-slate-700/50 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(true);
                      setError(null);
                    }}
                    className={switchButtonClass}
                  >
                    Belum punya akun? Daftar sebagai Petugas
                  </button>
                </div>
              )}
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className={labelClass}>Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <UserIcon size={16} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <UserIcon size={16} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Buat username unik"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound size={16} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Buat password minimal 6 karakter"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Pilih Tim Sampling</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Users size={16} />
                  </div>
                  <select
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    className={selectClass}
                  >
                    {teamsList.map((t) => (
                      <option key={t} value={t} className="bg-slate-800 text-white">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3.5 font-bold text-sm shadow-lg shadow-indigo-600/15 transition flex items-center justify-center space-x-2 cursor-pointer mt-6"
              >
                <span>Daftar Akun Petugas</span>
                <ArrowRight size={16} />
              </button>

              {/* Google signup option */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-700/40"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className={dividerTextClass}>Atau Daftar Dengan</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className={googleButtonClass}
              >
                <svg className="w-4 h-4 mr-1 shrink-0" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google Account</span>
              </button>

              <div className="pt-4 text-center border-t border-slate-700/50 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    setError(null);
                  }}
                  className={switchButtonClass}
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
