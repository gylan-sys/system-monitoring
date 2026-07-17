import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  HelpCircle, 
  ShieldAlert, 
  Check, 
  Volume2, 
  Building, 
  AlertTriangle, 
  Info,
  Calendar,
  BookOpen,
  Award,
  Clock,
  UserCheck,
  Sliders,
  Palette,
  Layout,
  Eye,
  Upload,
  Trash2,
  Smartphone,
  Download,
  Share2
} from 'lucide-react';

interface SettingsViewProps {
  onSaveSettings?: (settings: any) => void;
}

export default function SettingsView({ onSaveSettings }: SettingsViewProps) {
  // Navigation sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'system' | 'branding' | 'pwa'>('system');

  // System Settings States
  const [labName, setLabName] = useState(() => localStorage.getItem('cfg_lab_name') || 'Laboratorium Metrologi Kimia & Fisika');
  const [warningDays, setWarningDays] = useState(() => Number(localStorage.getItem('cfg_warning_days') || '30'));
  const [defaultPic, setDefaultPic] = useState(() => localStorage.getItem('cfg_default_pic') || 'Dr. Hendra Wijaya');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('cfg_sound_enabled') !== 'false');
  const [autoOpenScan, setAutoOpenScan] = useState(() => localStorage.getItem('cfg_auto_open_scan') !== 'false');
  
  // Custom App Branding & Design States
  const [appName, setAppName] = useState(() => localStorage.getItem('cfg_app_name') || 'LabCalib');
  const [appSubtitle, setAppSubtitle] = useState(() => localStorage.getItem('cfg_app_subtitle') || 'Metrologi Lab');
  const [appLogo, setAppLogo] = useState(() => localStorage.getItem('cfg_app_logo') || '🔧');
  const [sidebarBg, setSidebarBg] = useState(() => localStorage.getItem('cfg_sidebar_bg') || 'midnight');
  const [sidebarOpacity, setSidebarOpacity] = useState(() => localStorage.getItem('cfg_sidebar_opacity') || '85');
  const [sidebarBlur, setSidebarBlur] = useState(() => localStorage.getItem('cfg_sidebar_blur') || 'md');
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setLabName(localStorage.getItem('cfg_lab_name') || 'Laboratorium Metrologi Kimia & Fisika');
      setWarningDays(Number(localStorage.getItem('cfg_warning_days') || '30'));
      setDefaultPic(localStorage.getItem('cfg_default_pic') || 'Dr. Hendra Wijaya');
      setSoundEnabled(localStorage.getItem('cfg_sound_enabled') !== 'false');
      setAutoOpenScan(localStorage.getItem('cfg_auto_open_scan') !== 'false');
      setAppName(localStorage.getItem('cfg_app_name') || 'LabCalib');
      setAppSubtitle(localStorage.getItem('cfg_app_subtitle') || 'Metrologi Lab');
      setAppLogo(localStorage.getItem('cfg_app_logo') || '🔧');
      setSidebarBg(localStorage.getItem('cfg_sidebar_bg') || 'midnight');
      setSidebarOpacity(localStorage.getItem('cfg_sidebar_opacity') || '85');
      setSidebarBlur(localStorage.getItem('cfg_sidebar_blur') || 'md');
    };
    window.addEventListener('lab_settings_updated', handleUpdate);
    return () => {
      window.removeEventListener('lab_settings_updated', handleUpdate);
    };
  }, []);

  const processFile = (file: File) => {
    setLogoError(null);
    // Allow only image files
    if (!file.type.startsWith('image/')) {
      setLogoError('Format file tidak didukung. Harap pilih file gambar (PNG, JPG, SVG, dll).');
      return;
    }
    // Limit file size to 1MB
    if (file.size > 1024 * 1024) {
      setLogoError('Ukuran file logo terlalu besar. Maksimal ukuran file adalah 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setAppLogo(base64);
      }
    };
    reader.onerror = () => {
      setLogoError('Gagal membaca file gambar.');
    };
    reader.readAsDataURL(file);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleResetLogo = () => {
    setAppLogo('🔧');
    setLogoError(null);
  };

  const sidebarThemes = [
    { id: 'midnight', name: 'Slate Midnight', desc: 'Gelap berkelas, profesional', tint: 'bg-slate-950 border-slate-800' },
    { id: 'glass', name: 'Glassmorphic Clear', desc: 'Transparan elegan & modern', tint: 'bg-slate-900/60 border-slate-700/50' },
    { id: 'nebula', name: 'Deep Nebula Blue', desc: 'Biru angkasa futuristik', tint: 'bg-indigo-950 border-indigo-900' },
    { id: 'obsidian', name: 'Cyber Obsidian', desc: 'Hitam solid kontras tinggi', tint: 'bg-black border-zinc-800' },
    { id: 'charcoal', name: 'Warm Charcoal', desc: 'Abu-abu hangat nyaman di mata', tint: 'bg-zinc-900 border-zinc-800' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save System Preferences
    localStorage.setItem('cfg_lab_name', labName);
    localStorage.setItem('cfg_warning_days', String(warningDays));
    localStorage.setItem('cfg_default_pic', defaultPic);
    localStorage.setItem('cfg_sound_enabled', String(soundEnabled));
    localStorage.setItem('cfg_auto_open_scan', String(autoOpenScan));
    
    // Save Branding & Tampilan
    localStorage.setItem('cfg_app_name', appName);
    localStorage.setItem('cfg_app_subtitle', appSubtitle);
    localStorage.setItem('cfg_app_logo', appLogo);
    localStorage.setItem('cfg_sidebar_bg', sidebarBg);
    localStorage.setItem('cfg_sidebar_opacity', String(sidebarOpacity));
    localStorage.setItem('cfg_sidebar_blur', sidebarBlur);

    // Dispatch event so App.tsx and other views can adapt instantly
    window.dispatchEvent(new Event('lab_settings_updated'));

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);

    if (onSaveSettings) {
      onSaveSettings({
        labName,
        warningDays,
        defaultPic,
        soundEnabled,
        autoOpenScan,
        appName,
        appSubtitle,
        appLogo,
        sidebarBg,
        sidebarOpacity,
        sidebarBlur
      });
    }
  };

  // Helper values for Interactive Sidebar Live Preview
  const getPreviewBgColor = () => {
    const opacityDecimal = Number(sidebarOpacity) / 100;
    if (sidebarBg === 'midnight') return `rgba(2, 6, 23, ${opacityDecimal})`;
    if (sidebarBg === 'glass') return `rgba(15, 23, 42, ${opacityDecimal})`;
    if (sidebarBg === 'nebula') return `rgba(49, 46, 129, ${opacityDecimal})`;
    if (sidebarBg === 'obsidian') return `rgba(0, 0, 0, ${opacityDecimal})`;
    if (sidebarBg === 'charcoal') return `rgba(9, 9, 11, ${opacityDecimal})`;
    return `rgba(15, 23, 42, ${opacityDecimal})`;
  };

  const getPreviewBlurStyle = () => {
    if (sidebarBlur === 'none') return 'none';
    if (sidebarBlur === 'xs') return 'blur(2px)';
    if (sidebarBlur === 'sm') return 'blur(4px)';
    if (sidebarBlur === 'md') return 'blur(12px)';
    if (sidebarBlur === 'lg') return 'blur(24px)';
    if (sidebarBlur === 'xl') return 'blur(40px)';
    return 'blur(12px)';
  };

  const getPreviewBorderClass = () => {
    if (sidebarBg === 'midnight') return 'border-white/10';
    if (sidebarBg === 'glass') return 'border-white/5';
    if (sidebarBg === 'nebula') return 'border-indigo-500/20';
    if (sidebarBg === 'obsidian') return 'border-zinc-800/60';
    if (sidebarBg === 'charcoal') return 'border-zinc-800/40';
    return 'border-white/5';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Settings size={20} />
            </div>
            <h1 className="text-lg font-bold text-slate-900">Pengaturan & Panduan Aplikasi</h1>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Konfigurasi preferensi sistem laboratorium, sesuaikan tampilan aplikasi {appName}, dan pelajari panduan standar kalibrasi.
          </p>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex space-x-1 border-b border-slate-200 pb-px">
        <button
          type="button"
          onClick={() => setActiveSubTab('system')}
          className={`flex items-center space-x-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'system'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders size={14} />
          <span>Preferensi Sistem & SOP</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('branding')}
          className={`flex items-center space-x-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'branding'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Palette size={14} />
          <span>Konfigurasi Tampilan App (Sidebar)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('pwa')}
          className={`flex items-center space-x-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'pwa'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Smartphone size={14} />
          <span>Aplikasi Mobile & Offline (PWA)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Forms (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            
            {activeSubTab === 'system' ? (
              // TAB 1: SYSTEM PREFERENCES FORM
              <>
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-sm font-bold text-slate-800 flex items-center">
                    <Sliders className="text-indigo-500 mr-2" size={16} />
                    Preferensi Sistem Laboratorium
                  </h2>
                </div>

                <div className="p-6 space-y-5">
                  {/* Lab Name */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
                      <Building size={12} className="mr-1.5 text-slate-400" />
                      Nama Laboratorium / Instansi
                    </label>
                    <input
                      type="text"
                      value={labName}
                      onChange={(e) => setLabName(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-slate-50/50 hover:bg-slate-50"
                      placeholder="Masukkan nama laboratorium..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Warning Threshold */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
                        <Clock size={12} className="mr-1.5 text-slate-400" />
                        Ambang Batas Peringatan (Hari)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={warningDays}
                          onChange={(e) => setWarningDays(Math.max(1, Number(e.target.value)))}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-slate-50/50"
                          min="1"
                          required
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">Hari</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Alat akan berstatus &quot;Butuh Kalibrasi&quot; jika tanggal jatuh tempo kurang dari jumlah hari ini.
                      </p>
                    </div>

                    {/* Default PIC */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
                        <UserCheck size={12} className="mr-1.5 text-slate-400" />
                        Penanggung Jawab Default (PIC)
                      </label>
                      <input
                        type="text"
                        value={defaultPic}
                        onChange={(e) => setDefaultPic(e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-slate-50/50"
                        placeholder="Nama PIC utama..."
                        required
                      />
                    </div>
                  </div>

                  <hr className="border-slate-100 my-2" />

                  {/* Toggles */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Fitur & Notifikasi</h3>
                    
                    {/* Sound alert */}
                    <div className="flex items-start justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition">
                      <div className="flex items-start space-x-3">
                        <Volume2 className="text-indigo-500 shrink-0 mt-0.5" size={16} />
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800">Umpan Balik Suara Kamera</p>
                          <p className="text-[10px] text-slate-400 leading-normal">Bunyikan sinyal audio beep otomatis saat QR code berhasil terdeteksi.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer outline-none shrink-0 ${soundEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                      >
                        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${soundEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Scan auto-open */}
                    <div className="flex items-start justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition">
                      <div className="flex items-start space-x-3">
                        <Settings className="text-indigo-500 shrink-0 mt-0.5" size={16} />
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800">Auto-Buka Hasil Scan QR</p>
                          <p className="text-[10px] text-slate-400 leading-normal">Langsung tampilkan detail spesifikasi dan validitas alat sesaat setelah QR Code terpindai.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAutoOpenScan(!autoOpenScan)}
                        className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer outline-none shrink-0 ${autoOpenScan ? 'bg-indigo-600' : 'bg-slate-200'}`}
                      >
                        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${autoOpenScan ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Locked Interval Settings Note */}
                  <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2">
                    <div className="flex items-center space-x-2 text-slate-500">
                      <Info size={14} className="text-slate-400 shrink-0" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Interval Kalibrasi Standar Kategori</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Konfigurasi interval kalibrasi standar per kategori alat saat ini <span className="font-bold text-indigo-600">Dikunci</span> oleh Administrator Utama (Hanya dapat dimodifikasi oleh Admin IT guna mematuhi kepatuhan sistem audit mutu laboratorium ISO/IEC 17025).
                    </p>
                  </div>
                </div>
              </>
            ) : activeSubTab === 'branding' ? (
              // TAB 2: BRANDING & APP CONFIGURATION FORM (NEW requested feature!)
              <>
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-sm font-bold text-slate-800 flex items-center">
                    <Palette className="text-indigo-500 mr-2" size={16} />
                    Konfigurasi Identitas & Tampilan Sidebar
                  </h2>
                </div>

                <div className="p-6 space-y-6">
                  {/* Identity settings */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">🏷️ Identitas Aplikasi</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* App Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Aplikasi</label>
                        <input
                          type="text"
                          value={appName}
                          onChange={(e) => setAppName(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-slate-50/50"
                          placeholder="Contoh: LabCalib"
                          required
                        />
                      </div>

                      {/* App Subtitle */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subjudul / Slogan</label>
                        <input
                          type="text"
                          value={appSubtitle}
                          onChange={(e) => setAppSubtitle(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-slate-50/50"
                          placeholder="Contoh: Metrologi Lab"
                          required
                        />
                      </div>
                    </div>

                    {/* Logo File Upload Section */}
                    <div className="space-y-3 pt-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Logo Aplikasi (Upload Gambar)</label>
                      
                      <div 
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-2xl p-5 flex flex-col md:flex-row items-center gap-5 transition-all relative ${
                          dragActive 
                            ? 'border-indigo-600 bg-indigo-50/40 scale-[1.01]' 
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
                        }`}
                      >
                        {/* Hidden Input File */}
                        <input
                          id="logo-file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />

                        {/* Current Logo Preview */}
                        <div className="relative flex-shrink-0 group">
                          <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-4xl shadow-sm overflow-hidden bg-white">
                            {appLogo.startsWith('data:image/') || appLogo.startsWith('http') ? (
                              <img src={appLogo} alt="Logo Aplikasi" className="w-full h-full object-contain" />
                            ) : (
                              <span className="font-bold">{appLogo}</span>
                            )}
                          </div>
                          {appLogo !== '🔧' && (
                            <button
                              type="button"
                              onClick={handleResetLogo}
                              className="absolute -top-1.5 -right-1.5 p-1 bg-rose-100 text-rose-600 hover:bg-rose-200 rounded-full shadow-xs transition-colors cursor-pointer"
                              title="Reset ke Logo Default"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>

                        {/* Upload Controls */}
                        <div className="flex-1 text-center md:text-left space-y-1.5">
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                            <button
                              type="button"
                              onClick={() => document.getElementById('logo-file-input')?.click()}
                              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer border border-indigo-200/50"
                            >
                              <Upload size={13} />
                              <span>Pilih File Logo</span>
                            </button>
                            
                            {appLogo !== '🔧' && (
                              <button
                                type="button"
                                onClick={handleResetLogo}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition cursor-pointer"
                              >
                                Gunakan Default (🔧)
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Format yang didukung: PNG, JPG, WEBP, atau SVG (Maks. 1MB).
                          </p>
                          <p className="hidden md:block text-[9px] text-slate-400 italic">
                            Tips: Anda juga bisa menyeret (drag & drop) gambar langsung ke area ini.
                          </p>
                        </div>
                      </div>

                      {/* Local Error Feedback */}
                      {logoError && (
                        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] font-medium text-rose-600 flex items-center space-x-1.5">
                          <span className="shrink-0 text-xs">⚠️</span>
                          <span>{logoError}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Sidebar Background Styles */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">🎨 Tema & Background Sidebar</h3>
                    
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pilih Desain Dasar</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {sidebarThemes.map(theme => (
                          <div 
                            key={theme.id}
                            onClick={() => setSidebarBg(theme.id)}
                            className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-center justify-between gap-3 ${sidebarBg === theme.id ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}
                          >
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-slate-800">{theme.name}</p>
                              <p className="text-[9px] text-slate-400 leading-tight">{theme.desc}</p>
                            </div>
                            <div className={`w-8 h-8 rounded-lg shrink-0 border ${theme.tint}`} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                      {/* Opacity Control */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tingkat Transparansi (Opacity)</label>
                          <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-mono">{sidebarOpacity}%</span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="100"
                          step="5"
                          value={sidebarOpacity}
                          onChange={(e) => setSidebarOpacity(e.target.value)}
                          className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-[8px] text-slate-400 font-bold px-0.5">
                          <span>30% (Sangat Transparan)</span>
                          <span>100% (Solid)</span>
                        </div>
                      </div>

                      {/* Backdrop Blur Control */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Intensitas Efek Blur (Backdrop Blur)</label>
                        <div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                          {['none', 'xs', 'md', 'lg', 'xl'].map((blurOption) => {
                            const labelMap: { [key: string]: string } = { none: 'Off', xs: 'Rendah', md: 'Sedang', lg: 'Tinggi', xl: 'Ultra' };
                            return (
                              <button
                                key={blurOption}
                                type="button"
                                onClick={() => setSidebarBlur(blurOption)}
                                className={`py-1 text-[10px] font-bold rounded-lg cursor-pointer transition ${sidebarBlur === blurOption ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                              >
                                {labelMap[blurOption]}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[8px] text-slate-400">Efek blur akan mempercantik tampilan elemen yang berada di belakang sidebar.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // TAB 3: PWA MOBILE & OFFLINE GUIDE
              <>
                <div className="p-5 border-b border-slate-100 bg-indigo-50/20">
                  <h2 className="text-sm font-bold text-slate-800 flex items-center">
                    <Smartphone className="text-indigo-500 mr-2" size={16} />
                    Aplikasi Mobile & Dukungan Offline (PWA)
                  </h2>
                </div>
                <div className="p-6 space-y-6 text-xs text-slate-600 leading-relaxed">
                  <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
                    <h4 className="font-bold text-indigo-950 flex items-center">
                      <Smartphone className="text-indigo-600 mr-1.5" size={14} />
                      Mengapa Menggunakan Versi PWA?
                    </h4>
                    <p className="text-[11px] text-indigo-800/95">
                      Progressive Web App (PWA) mengubah web ini menjadi aplikasi ponsel yang bisa diinstal langsung ke layar utama handphone (Android & iPhone) tanpa memerlukan App Store/Play Store. Ini memberikan efisiensi kerja lapangan tertinggi bagi admin dan petugas lab.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Android Card */}
                    <div className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50/30 hover:bg-slate-50/80 transition">
                      <div className="flex items-center space-x-2 text-indigo-600">
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-extrabold text-[10px]">Android</span>
                        <span className="font-bold text-slate-800">Browser Google Chrome</span>
                      </div>
                      <ol className="list-decimal pl-4 space-y-2 text-[11px] font-medium text-slate-600">
                        <li>Buka aplikasi <span className="font-bold">Google Chrome</span> di HP Anda.</li>
                        <li>Kunjungi alamat server aplikasi LabCalib Anda.</li>
                        <li>Tekan tombol <span className="font-bold text-indigo-600">"Pasang Aplikasi HP"</span> yang berkedip di pojok kiri bawah menu samping (sidebar).</li>
                        <li>Atau, klik ikon titik tiga <span className="font-bold">(⋮)</span> di pojok kanan atas Chrome, lalu pilih <span className="font-bold text-slate-800">"Tambahkan ke Layar Utama"</span> atau <span className="font-bold text-indigo-600">"Instal Aplikasi"</span>.</li>
                        <li>Selesai! LabCalib kini terpasang langsung di laci aplikasi Anda.</li>
                      </ol>
                    </div>

                    {/* iOS Card */}
                    <div className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50/30 hover:bg-slate-50/80 transition">
                      <div className="flex items-center space-x-2 text-indigo-600">
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-extrabold text-[10px]">iOS / iPhone</span>
                        <span className="font-bold text-slate-800">Browser Apple Safari</span>
                      </div>
                      <ol className="list-decimal pl-4 space-y-2 text-[11px] font-medium text-slate-600">
                        <li>Buka aplikasi <span className="font-bold text-indigo-600">Safari</span> bawaan iPhone Anda (PWA tidak didukung oleh browser Chrome di iOS).</li>
                        <li>Kunjungi alamat server LabCalib Anda.</li>
                        <li>Tekan tombol <span className="font-bold text-slate-800">"Share / Bagikan"</span> (panah ke atas keluar dari kotak) di menu bar Safari bawah.</li>
                        <li>Gulir ke bawah pada lembar bagikan, pilih opsi <span className="font-bold text-indigo-600">"Add to Home Screen / Tambahkan ke Layar Utama"</span>.</li>
                        <li>Beri nama <span className="font-bold">"LabCalib"</span>, lalu tap <span className="font-bold text-indigo-600">"Add / Tambah"</span> di pojok kanan atas.</li>
                      </ol>
                    </div>
                  </div>

                  <div className="border border-amber-100 bg-amber-50/60 rounded-xl p-4 space-y-2.5">
                    <h4 className="font-bold text-amber-950 flex items-center">
                      <Sliders className="text-amber-600 mr-1.5" size={14} />
                      Fitur Unggulan Kerja Lapangan (Offline Mode)
                    </h4>
                    <p className="text-[11px] text-amber-800/90 leading-relaxed">
                      Dengan service worker terintegrasi, seluruh file aset aplikasi tersimpan aman di memori ponsel. Jika Anda melakukan pengambilan sampling atau pengecekan di laboratorium tertutup tanpa koneksi internet (blank spot):
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] font-medium text-amber-900/90">
                      <li>Kamera scanner QR tetap berfungsi mencari alat yang terdaftar.</li>
                      <li>Riwayat kalibrasi dan SOP penanganan dapat dibaca secara offline penuh.</li>
                      <li>Input log penggunaan alat langsung disimpan di database lokal ponsel dan disinkronkan secara aman.</li>
                    </ul>
                  </div>
                </div>
              </>
            )}

            {activeSubTab !== 'pwa' && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 italic">Konfigurasi disimpan secara lokal di browser Anda.</span>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs animate-none"
                >
                  {saveSuccess ? (
                    <>
                      <Check size={14} />
                      <span>Konfigurasi Disimpan!</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            )}
          </form>

          {/* TAB 1 SOP (Hanya tampil di system sub-tab agar rapi) */}
          {activeSubTab === 'system' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
              <h3 className="text-sm font-bold text-rose-800 flex items-center space-x-1.5">
                <ShieldAlert size={16} className="text-rose-500" />
                <span>SOP Penanganan Alat Berstatus Kadaluarsa (Expired)</span>
              </h3>
              
              <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
                <p>
                  Berdasarkan standar sistem mutu laboratorium ISO 17025, apabila suatu peralatan sampling telah melewati batas kalibrasinya, maka tindakan wajib berikut harus segera diambil:
                </p>
                <ol className="list-decimal pl-5 space-y-1.5 font-medium text-slate-700">
                  <li>
                    <span className="font-bold text-rose-600">Pelabelan Merah:</span> Segera pasang label fisik berwarna merah bertuliskan <span className="italic font-bold">&quot;ALAT KADALUARSA - TIDAK BOLEH DIGUNAKAN&quot;</span> pada badan alat.
                  </li>
                  <li>
                    <span className="font-bold text-slate-700">Karantina Alat:</span> Jika memungkinkan, pindahkan alat dari meja pengujian utama ke lemari karantina atau area isolasi agar tidak digunakan secara tidak sengaja oleh analis lain.
                  </li>
                  <li>
                    <span className="font-bold text-slate-700">Pemberitahuan PIC:</span> Hubungi penanggung jawab alat (PIC) untuk menjadwalkan kalibrasi ulang oleh Balai Metrologi atau Lembaga Kalibrasi Eksternal yang terakreditasi KAN.
                  </li>
                  <li>
                    <span className="font-bold text-amber-700">Audit Hasil Pengujian:</span> Jika alat terbukti telah digunakan setelah tanggal kadaluarsa, seluruh data hasil sampling dari alat tersebut wajib ditinjau ulang (di-audit) dan berpotensi dinyatakan tidak valid.
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Right: Advice & Interactive Live Previews (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {activeSubTab === 'system' ? (
            <>
              {/* Advice / Saran Section */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden space-y-4">
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 pointer-events-none">
                  <Settings size={200} />
                </div>

                <div className="flex items-center space-x-2">
                  <BookOpen size={18} className="text-indigo-300" />
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-indigo-200">Rekomendasi Mutu & Kalibrasi</h2>
                </div>

                <div className="space-y-4 text-xs text-indigo-100 leading-relaxed">
                  <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <p className="font-bold text-indigo-300 flex items-center">
                      <Award size={14} className="mr-1" />
                      Akreditasi KAN (ISO/IEC 17025)
                    </p>
                    <p className="text-[11px] text-indigo-200/90">
                      Selalu pilih laboratorium kalibrasi eksternal yang bersertifikat Komite Akreditasi Nasional (KAN) untuk memastikan ketertelusuran standar pengukuran ke sistem internasional (SI).
                    </p>
                  </div>

                  <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <p className="font-bold text-indigo-300 flex items-center">
                      <Calendar size={14} className="mr-1" />
                      Pengecekan Antara (Intermediate Check)
                    </p>
                    <p className="text-[11px] text-indigo-200/90">
                      Untuk alat dengan presisi tinggi seperti Timbangan Analitis dan pH Meter, lakukan &quot;Pengecekan Antara&quot; menggunakan anak timbangan standar atau larutan buffer bersertifikat setiap minggu sebelum digunakan.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <p className="font-bold text-indigo-300 flex items-center">
                      <AlertTriangle size={14} className="mr-1" />
                      Kondisi Lingkungan Lab
                    </p>
                    <p className="text-[11px] text-indigo-200/90">
                      Suhu ruangan (20-25°C) dan kelembapan (45-60%) lab harus selalu dicatat di log penunjang karena fluktuasi ekstrem akan membatalkan sertifikat kalibrasi pabrik instrumen sensitif.
                    </p>
                  </div>
                </div>
              </div>

              {/* Reference List for Standard Intervals */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center">
                    <Info size={14} className="text-slate-400 mr-1.5" />
                    Daftar Saran Interval Kalibrasi Standar
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Saran standar frekuensi kalibrasi instrumen laboratorium umum:</p>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">pH Meter Digital</p>
                      <p className="text-[10px] text-slate-400">Sensitif terhadap degradasi elektroda</p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold rounded-md text-[10px] border border-amber-100">6 Bulan</span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">Timbangan Analitis</p>
                      <p className="text-[10px] text-slate-400">Sangat sensitif fluktuasi gravitasi & debu</p>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-md text-[10px] border border-indigo-100">12 Bulan</span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">Spektrofotometer UV-Vis</p>
                      <p className="text-[10px] text-slate-400">Penurunan intensitas lampu halogen/deuterium</p>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-md text-[10px] border border-indigo-100">12 Bulan</span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">Mikropipet (Eppendorf/Sartorius)</p>
                      <p className="text-[10px] text-slate-400">Korosi piston pegas mekanis</p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold rounded-md text-[10px] border border-amber-100">6 Bulan</span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">HPLC / GC Gas Chromatography</p>
                      <p className="text-[10px] text-slate-400">Kompleksitas tinggi & degradasi detektor</p>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-md text-[10px] border border-indigo-100">12 Bulan</span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">Autoclave / Oven Sterilisasi</p>
                      <p className="text-[10px] text-slate-400">Sensor suhu dan tekanan berkala</p>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-md text-[10px] border border-indigo-100">12 Bulan</span>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded-lg leading-relaxed border border-slate-100">
                    ⚠️ <span className="font-bold text-slate-600">Catatan Frekuensi:</span> Jika frekuensi pemakaian instrumen sangat tinggi (&gt;100 kali sehari), interval kalibrasi sebaiknya dipercepat menjadi setengah dari rekomendasi di atas.
                  </p>
                </div>
              </div>
            </>
          ) : activeSubTab === 'branding' ? (
            <>
              {/* LIVE INTERACTIVE SIDEBAR PREVIEW (Requested branding preview!) */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center">
                    <Eye size={14} className="text-slate-400 mr-1.5" />
                    Preview Sidebar Interaktif
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Saksikan visualisasi perubahan gaya dan identitas sidebar Anda secara langsung:</p>
                </div>

                <div className="relative rounded-2xl border border-slate-100 overflow-hidden h-[340px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
                  {/* Backdrop shapes to show blur translucency */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.25),transparent)] pointer-events-none" />
                  <div className="absolute w-20 h-20 bg-amber-400 rounded-full filter blur-md -top-4 -left-4 animate-pulse" />
                  <div className="absolute w-24 h-24 bg-teal-300 rounded-full filter blur-xl bottom-4 right-4" />
                  
                  {/* Simulated Sidebar component */}
                  <div style={{
                    backgroundColor: getPreviewBgColor(),
                    backdropFilter: getPreviewBlurStyle(),
                    WebkitBackdropFilter: getPreviewBlurStyle()
                  }} className={`absolute left-0 top-0 bottom-0 w-48 text-white p-4 flex flex-col justify-between border-r ${getPreviewBorderClass()} transition-all duration-300`}>
                     {/* Brand */}
                     <div className="space-y-4">
                       <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
                         <div className={`w-10 h-10 flex items-center justify-center text-sm shrink-0 overflow-hidden ${
                           appLogo.startsWith('data:image/') || appLogo.startsWith('http') ? '' : 'bg-indigo-600/15 border border-indigo-500/20 rounded-lg'
                         }`}>
                           {appLogo.startsWith('data:image/') || appLogo.startsWith('http') ? (
                             <img src={appLogo} alt="Logo" className="w-full h-full object-contain" />
                           ) : (
                             appLogo
                           )}
                         </div>
                         <div className="min-w-0">
                           <h3 className="text-[11px] font-extrabold truncate leading-tight">{appName}</h3>
                           <p className="text-[8px] text-indigo-300 font-bold uppercase tracking-wider truncate leading-none mt-0.5">{appSubtitle}</p>
                         </div>
                       </div>
                       
                       {/* Navigation */}
                       <div className="space-y-1">
                         <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-[9px] font-bold">
                           <Layout size={10} />
                           <span>Dashboard Analitis</span>
                         </div>
                         <div className="flex items-center space-x-2 px-2.5 py-1.5 text-slate-300 text-[9px] font-bold">
                           <Sliders size={10} />
                           <span>Daftar Alat Sampling</span>
                         </div>
                       </div>
                     </div>

                     {/* User info Footer */}
                     <div className="pt-2 border-t border-white/10 flex items-center space-x-1.5">
                       <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold">GK</div>
                       <div className="min-w-0">
                         <p className="text-[8px] font-extrabold truncate leading-none">gkrismantara@gmail.com</p>
                         <p className="text-[7px] text-slate-400 leading-none mt-0.5">Staf Pengawas</p>
                       </div>
                     </div>
                  </div>
                  
                  {/* Floating badge */}
                  <div className="ml-44 text-white p-4 z-10 text-center select-none bg-black/30 backdrop-blur-xs rounded-xl border border-white/5 shadow-lg">
                    <Eye size={18} className="mx-auto mb-1 text-indigo-300" />
                    <span className="text-[9px] font-bold block text-white/90">Visual Real-time</span>
                  </div>
                </div>
              </div>

              {/* Helpful Tips Card */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center">
                  <span>💡 Tips Branding & Tampilan</span>
                </h3>
                <div className="space-y-2.5 text-[11px] text-slate-500 leading-relaxed">
                  <p>
                    <span className="font-bold text-slate-700">Glassmorphic Clear</span> sangat ideal bila Anda menginginkan nuansa transparan yang modern dengan latar belakang yang agak bayang di baliknya.
                  </p>
                  <p>
                    Gunakan <span className="font-bold text-slate-700">Slate Midnight</span> atau <span className="font-bold text-slate-700">Cyber Obsidian</span> dengan opacity 85% ke atas untuk kontras paling jernih agar mata analis tidak mudah lelah.
                  </p>
                </div>
              </div>
            </>
          ) : (
            // TAB 3: PWA RIGHT SIDEBAR INFO
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden space-y-4">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 pointer-events-none">
                <Smartphone size={200} />
              </div>
              <div className="flex items-center space-x-2 text-indigo-300">
                <Smartphone className="text-indigo-400" size={16} />
                <h3 className="text-xs font-extrabold uppercase tracking-wider">Tips Efisiensi Ponsel</h3>
              </div>
              <p className="text-[11px] text-indigo-200 leading-relaxed">
                Agar penggunaan aplikasi LabCalib di ponsel lapangan berjalan dengan efisiensi maksimal, kami menyarankan beberapa konfigurasi berikut:
              </p>
              <div className="space-y-3.5 text-[11px] text-indigo-100 leading-relaxed">
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                  <p className="font-bold text-indigo-300">🔋 Mode Hemat Daya (Battery Saver)</p>
                  <p className="text-[10.5px] text-indigo-200/90">Beberapa sistem operasi ponsel membatasi jalannya Service Worker jika mode hemat daya ekstrem aktif. Pastikan mengecualikan aplikasi LabCalib agar performa background tetap responsif.</p>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                  <p className="font-bold text-indigo-300">📸 Akses Kamera QR Code</p>
                  <p className="text-[10.5px] text-indigo-200/90">Saat pertama kali membuka scanner QR, ponsel akan meminta izin kamera. Pastikan memilih &quot;Izinkan saat aplikasi digunakan&quot; agar scanner dapat aktif secara instan kapan saja.</p>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                  <p className="font-bold text-indigo-300">💾 Jangan Bersihkan Cache Browser</p>
                  <p className="text-[10.5px] text-indigo-200/90">Karena aplikasi ini menggunakan penyimpanan lokal browser (localStorage), jangan jalankan pembersih cache pihak ketiga yang agresif untuk menjamin keutuhan data riwayat alat Anda di ponsel.</p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
