/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  Shield, 
  Briefcase, 
  Clock, 
  Wrench, 
  Activity, 
  KeyRound, 
  Users, 
  Power, 
  Check, 
  ChevronRight, 
  Eye, 
  EyeOff,
  Sparkles,
  Calendar,
  Lock,
  ArrowRightLeft,
  Camera,
  Edit
} from 'lucide-react';
import { User as SystemUser, UsageLog, Equipment } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: SystemUser;
  usersList: SystemUser[];
  usageLogs: UsageLog[];
  equipmentList: Equipment[];
  onUpdateUser: (updatedUser: SystemUser) => void;
  onSwitchUser: (user: SystemUser) => void;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  currentUser,
  usersList,
  usageLogs,
  equipmentList,
  onUpdateUser,
  onSwitchUser,
}: UserProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'switch'>('profile');
  
  // Password change states
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [secError, setSecError] = useState<string | null>(null);
  const [secSuccess, setSecSuccess] = useState<string | null>(null);

  // Switch account states
  const [switchPassword, setSwitchPassword] = useState('');
  const [selectedUserToSwitch, setSelectedUserToSwitch] = useState<SystemUser | null>(null);
  const [switchError, setSwitchError] = useState<string | null>(null);

  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileUsername, setProfileUsername] = useState(currentUser.username);
  const [profileTeam, setProfileTeam] = useState(currentUser.team || '');
  const [profilePicError, setProfilePicError] = useState<string | null>(null);
  const [profilePicSuccess, setProfilePicSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    setProfileName(currentUser.name);
    setProfileUsername(currentUser.username);
    setProfileTeam(currentUser.team || '');
    setProfilePicError(null);
    setProfilePicSuccess(null);
  }, [currentUser]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfilePicError(null);
    setProfilePicSuccess(null);

    if (!profileName.trim()) {
      setProfilePicError('Nama tidak boleh kosong.');
      return;
    }
    if (!profileUsername.trim()) {
      setProfilePicError('Username tidak boleh kosong.');
      return;
    }

    onUpdateUser({
      ...currentUser,
      name: profileName.trim(),
      username: profileUsername.trim().toLowerCase(),
      team: profileTeam || undefined
    });

    setProfilePicSuccess('Profil Anda berhasil diperbarui!');
    setIsEditingProfile(false);
    setTimeout(() => setProfilePicSuccess(null), 3000);
  };

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfilePicError(null);
    if (!file.type.startsWith('image/')) {
      setProfilePicError('Format file tidak didukung. Harap pilih gambar.');
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) {
      setProfilePicError('Ukuran file foto maksimal 1.5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        onUpdateUser({
          ...currentUser,
          picture: base64
        });
        setProfilePicSuccess('Foto profil berhasil diperbarui!');
        setTimeout(() => setProfilePicSuccess(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  // Stats calculation
  const personalLogs = usageLogs.filter(log => log.operator.toLowerCase() === currentUser.name.toLowerCase());
  const activeBorrowedAssets = usageLogs.filter(
    log => log.status === 'Sedang Digunakan' && log.operator.toLowerCase() === currentUser.name.toLowerCase()
  );
  
  // Total tools under current user's team responsibility
  const teamResponsibleTools = equipmentList.filter(
    eq => eq.scope === 'tim' && eq.assignedTeam === currentUser.team
  );

  const totalActions = personalLogs.length;

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setSecError(null);
    setSecSuccess(null);

    // Verify current password
    if (currentUser.password && currentPasswordInput !== currentUser.password) {
      setSecError('Password saat ini tidak cocok.');
      return;
    }

    if (!newPasswordInput || newPasswordInput.length < 4) {
      setSecError('Password baru harus minimal 4 karakter.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setSecError('Konfirmasi password baru tidak cocok.');
      return;
    }

    // Success
    const updatedUser = {
      ...currentUser,
      password: newPasswordInput
    };
    onUpdateUser(updatedUser);
    setSecSuccess('Password berhasil diperbarui!');
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    
    setTimeout(() => {
      setSecSuccess(null);
    }, 3000);
  };

  const handleQuickSwitch = (targetUser: SystemUser) => {
    // If target has no password or password matches
    if (!targetUser.password || switchPassword === targetUser.password) {
      onSwitchUser(targetUser);
      setSwitchError(null);
      setSwitchPassword('');
      setSelectedUserToSwitch(null);
      onClose();
    } else {
      setSwitchError('Password salah untuk pengguna ini.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity cursor-pointer" 
        onClick={onClose} 
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[550px] max-h-[90vh]"
        >
          {/* Left Panel: Profile Highlight Banner */}
          <div className="md:w-5/12 bg-slate-900 text-white p-6 flex flex-col justify-between relative overflow-hidden shrink-0">
            {/* Background glowing effects */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />

            <div className="space-y-4 relative z-10">
              <span className="text-[10px] font-bold px-2 py-1 bg-indigo-500/30 text-indigo-300 rounded-md tracking-wider uppercase">
                Profil Aktif
              </span>
              
              <div className="pt-2 flex flex-col items-center text-center">
                {/* Avatar with Upload Trigger */}
                <div className="relative group cursor-pointer w-18 h-18 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl font-black text-white shadow-lg ring-4 ring-indigo-500/20 overflow-hidden">
                  {currentUser.picture ? (
                    <img src={currentUser.picture} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name.substring(0, 2).toUpperCase()
                  )}
                  
                  {/* Upload Overlay */}
                  <label className="absolute inset-0 bg-slate-900/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5 text-[8px] font-black text-white cursor-pointer">
                    <Camera size={14} className="text-white" />
                    <span>UBAH FOTO</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePicUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                
                <h3 className="text-base font-black text-white mt-3 leading-tight truncate w-full" title={currentUser.name}>
                  {currentUser.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">@{currentUser.username}</p>

                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase ${
                    currentUser.role === 'admin' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {currentUser.role === 'admin' ? 'Admin' : 'Petugas'}
                  </span>
                  
                  {currentUser.team && (
                    <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded-full text-[9px] font-black uppercase">
                      {currentUser.team}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Summary Counts */}
            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-800 relative z-10">
              <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800/60 text-center">
                <span className="text-[14px] font-black text-emerald-400">{activeBorrowedAssets.length}</span>
                <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Alat Dipakai</p>
              </div>
              <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800/60 text-center">
                <span className="text-[14px] font-black text-indigo-400">{totalActions}</span>
                <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Total Log</p>
              </div>
            </div>

            {/* Footer with logout */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
              <span className="flex items-center gap-1">
                <Clock size={11} />
                Shift Lab Aktif
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('active_user');
                  window.location.reload();
                }}
                className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 hover:underline cursor-pointer transition"
              >
                <Power size={11} />
                Logout
              </button>
            </div>
          </div>

          {/* Right Panel: Controls & Settings Form */}
          <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
            {/* Modal Header Tab Buttons */}
            <div className="bg-white border-b border-slate-100 p-3.5 flex items-center justify-between shrink-0">
              <div className="flex space-x-1.5">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-3 py-1.5 text-[11px] font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'profile' 
                      ? 'bg-slate-100 text-slate-900' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <User size={13} />
                  Ringkasan
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`px-3 py-1.5 text-[11px] font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'security' 
                      ? 'bg-slate-100 text-slate-900' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <KeyRound size={13} />
                  Keamanan
                </button>
                <button
                  onClick={() => setActiveTab('switch')}
                  className={`px-3 py-1.5 text-[11px] font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'switch' 
                      ? 'bg-slate-100 text-slate-900' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ArrowRightLeft size={13} />
                  Ganti Shift
                </button>
              </div>

              {/* Close Button */}
              <button 
                onClick={onClose} 
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body Container with Scroll support */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              
              {/* TAB 1: PROFILE SUMMARY & ACTIVE ACTIONS */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  {/* Detailed Personal Details Grid */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1">
                        <Sparkles size={13} className="text-indigo-500" />
                        Detail Kredensial
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit size={11} />
                        {isEditingProfile ? 'Batal Edit' : 'Edit Info'}
                      </button>
                    </div>

                    {profilePicError && (
                      <div className="p-2 bg-rose-50 border border-rose-100 text-rose-700 text-[10px] rounded-lg font-bold">
                        {profilePicError}
                      </div>
                    )}
                    {profilePicSuccess && (
                      <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] rounded-lg font-bold flex items-center gap-1 animate-pulse">
                        <Check size={11} />
                        {profilePicSuccess}
                      </div>
                    )}
                    
                    {isEditingProfile ? (
                      <form onSubmit={handleSaveProfile} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap</label>
                            <input
                              type="text"
                              value={profileName}
                              onChange={(e) => setProfileName(e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Username</label>
                            <input
                              type="text"
                              value={profileUsername}
                              onChange={(e) => setProfileUsername(e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          {currentUser.role !== 'admin' && (
                            <div className="space-y-1 col-span-2">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase">Tim Penempatan</label>
                              <input
                                type="text"
                                value={profileTeam}
                                onChange={(e) => setProfileTeam(e.target.value)}
                                placeholder="Misal: Tim A"
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          )}
                        </div>
                        <button
                          type="submit"
                          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold transition shadow-xs cursor-pointer animate-none"
                        >
                          Simpan Perubahan Profil
                        </button>
                      </form>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 text-xs leading-relaxed">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Nama Pengguna</p>
                          <p className="font-extrabold text-slate-700">@{currentUser.username}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Divisi Tim</p>
                          <p className="font-extrabold text-slate-700">{currentUser.team || 'Divisi Admin / Bersama'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Tanggal Registrasi</p>
                          <p className="font-semibold text-slate-600 flex items-center gap-1 mt-0.5">
                            <Calendar size={11} />
                            {currentUser.createdAt || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Status Akun</p>
                          <p className="font-extrabold text-emerald-600 flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Terverifikasi
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Borrowed / Active Tools list */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3 shadow-xs">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1">
                      <Wrench size={13} className="text-emerald-500" />
                      Alat Yang Sedang Dipakai ({activeBorrowedAssets.length})
                    </h4>

                    {activeBorrowedAssets.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-[11px] bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        Anda tidak memiliki alat yang sedang aktif digunakan saat ini.
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                        {activeBorrowedAssets.map(log => (
                          <div 
                            key={log.id} 
                            className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-700 truncate">{log.equipmentName}</p>
                              <p className="text-[9px] text-slate-400 font-semibold">Tujuan: {log.purpose} • Log ID: {log.id}</p>
                            </div>
                            <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded border border-emerald-200 shrink-0">
                              Mulai: {log.startTime}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: SECURITY & PASSWORD UPDATE */}
              {activeTab === 'security' && (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-4 shadow-xs">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1 border-b border-slate-50 pb-2">
                      <Lock size={13} className="text-rose-500" />
                      Perbarui Password Mandiri
                    </h4>

                    {secError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-bold">
                        ❌ {secError}
                      </div>
                    )}

                    {secSuccess && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs font-bold flex items-center gap-1">
                        <Check size={14} /> {secSuccess}
                      </div>
                    )}

                    {/* Form Input fields */}
                    <div className="space-y-3 text-xs">
                      {/* Current Password */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase">Password Saat Ini</label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPasswordInput}
                            onChange={(e) => setCurrentPasswordInput(e.target.value)}
                            placeholder="Ketik password lama Anda..."
                            required
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition focus:outline-none cursor-pointer"
                          >
                            {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase">Password Baru (Min 4 karakter)</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPasswordInput}
                            onChange={(e) => setNewPasswordInput(e.target.value)}
                            placeholder="Ketik password baru Anda..."
                            required
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition focus:outline-none cursor-pointer"
                          >
                            {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm New Password */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase">Konfirmasi Password Baru</label>
                        <input
                          type="password"
                          value={confirmPasswordInput}
                          onChange={(e) => setConfirmPasswordInput(e.target.value)}
                          placeholder="Ketik ulang password baru..."
                          required
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Lock size={12} />
                      <span>Ubah Password Akun</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: SHIFT WORKER SWITCHER */}
              {activeTab === 'switch' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3.5 shadow-xs">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1 border-b border-slate-50 pb-2">
                      <Users size={13} className="text-indigo-500" />
                      Ganti Akun Shift Laboratorium
                    </h4>
                    
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      Sangat berguna jika gawai/komputer lab ini dipakai bergantian oleh petugas dinas selanjutnya. Pilih operator untuk langsung beralih session:
                    </p>

                    {switchError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-bold">
                        ❌ {switchError}
                      </div>
                    )}

                    {/* Users Selector Grid / List */}
                    <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                      {usersList
                        .filter(u => u.id !== currentUser.id)
                        .map(u => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              setSelectedUserToSwitch(u);
                              setSwitchPassword('');
                              setSwitchError(null);
                            }}
                            className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition cursor-pointer ${
                              selectedUserToSwitch?.id === u.id
                                ? 'bg-indigo-50/50 border-indigo-200 text-indigo-950'
                                : 'bg-slate-5/50 border-slate-100 hover:bg-slate-50 text-slate-700 hover:border-slate-200'
                            }`}
                          >
                            <div className="min-w-0 flex items-center space-x-2.5">
                              <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-black text-slate-600 flex items-center justify-center shrink-0">
                                {u.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold truncate">{u.name}</p>
                                <p className="text-[9px] text-slate-400 font-semibold">@{u.username} • {u.role === 'admin' ? 'Admin' : u.team || 'Petugas'}</p>
                              </div>
                            </div>
                            
                            <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">
                              Pilih
                            </span>
                          </button>
                        ))}
                    </div>

                    {/* Active password input if requested */}
                    {selectedUserToSwitch && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2.5"
                      >
                        <p className="font-extrabold text-slate-700">Masukkan password untuk @{selectedUserToSwitch.username}:</p>
                        <div className="flex space-x-2">
                          <input
                            type="password"
                            value={switchPassword}
                            onChange={(e) => setSwitchPassword(e.target.value)}
                            placeholder="Isi password akun ini..."
                            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleQuickSwitch(selectedUserToSwitch);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleQuickSwitch(selectedUserToSwitch)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer transition"
                          >
                            Masuk
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
