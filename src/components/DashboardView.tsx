/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Activity, 
  QrCode, 
  Bell,
  Settings
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Equipment, UsageLog, SystemNotification, CalibrationStatus } from '../types';
import { getDaysRemaining, formatDateIndo } from '../utils/helpers';

interface DashboardViewProps {
  equipment: Equipment[];
  usageLogs: UsageLog[];
  notifications: SystemNotification[];
  onNavigate: (tab: string) => void;
  onSelectEquipment: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
}

export default function DashboardView({
  equipment,
  usageLogs,
  notifications,
  onNavigate,
  onSelectEquipment,
  onMarkAllNotificationsRead,
}: DashboardViewProps) {
  const [warningDays, setWarningDays] = React.useState(() => Number(localStorage.getItem('cfg_warning_days') || '30'));

  React.useEffect(() => {
    const handleUpdate = () => {
      setWarningDays(Number(localStorage.getItem('cfg_warning_days') || '30'));
    };
    window.addEventListener('lab_settings_updated', handleUpdate);
    return () => window.removeEventListener('lab_settings_updated', handleUpdate);
  }, []);

  // Statistics calculations
  const totalCount = equipment.length;
  const validCount = equipment.filter(e => e.status === 'valid').length;
  const warningCount = equipment.filter(e => e.status === 'warning').length;
  const expiredCount = equipment.filter(e => e.status === 'expired').length;
  const calibratingCount = equipment.filter(e => e.status === 'calibrating').length;
  const maintenanceCount = equipment.filter(e => e.status === 'maintenance').length;

  const activeUsage = usageLogs.filter(log => log.status === 'Sedang Digunakan');
  const unreadNotifications = notifications.filter(n => !n.isRead);

  // Sorting upcoming calibrations
  const upcomingCalibrations = [...equipment]
    .filter(e => e.status !== 'calibrating' && e.status !== 'maintenance')
    .sort((a, b) => new Date(a.nextCalibrationDate).getTime() - new Date(b.nextCalibrationDate).getTime())
    .slice(0, 4);

  // Dynamic calculation for Monthly Calibration Trend
  const monthlyData = React.useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    
    // Initialize months
    const data = monthNames.map((name, index) => ({
      name,
      monthIndex: index,
      'Kalibrasi Valid': 0,
      'Butuh Kalibrasi': 0,
      'Kadaluarsa': 0,
      'Uji Kalibrasi': 0,
      'Maintenance': 0,
    }));

    equipment.forEach((item) => {
      if (!item.nextCalibrationDate) return;
      
      const date = new Date(item.nextCalibrationDate);
      if (isNaN(date.getTime())) return;
      
      const month = date.getMonth(); // 0-11
      
      // Increment according to item status
      if (item.status === 'valid') {
        data[month]['Kalibrasi Valid'] += 1;
      } else if (item.status === 'warning') {
        data[month]['Butuh Kalibrasi'] += 1;
      } else if (item.status === 'expired') {
        data[month]['Kadaluarsa'] += 1;
      } else if (item.status === 'calibrating') {
        data[month]['Uji Kalibrasi'] += 1;
      } else if (item.status === 'maintenance') {
        data[month]['Maintenance'] += 1;
      }
    });

    return data;
  }, [equipment]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Wrench size={180} />
        </div>
        <div className="relative z-10 space-y-2">
          <span className="bg-blue-500/30 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Sistem Informasi Laboratorium
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Sistem Kalibrasi & Pemeliharaan Alat</h1>
          <p className="text-blue-100 max-w-xl text-sm leading-relaxed">
            Selamat datang di portal kontrol lab. Memudahkan pelacakan masa berlaku kalibrasi, log penggunaan real-time, cetak QR code fisik alat, dan dokumen sertifikat audit.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01, boxShadow: '0 8px 20px -6px rgba(0, 0, 0, 0.05)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Alat</span>
            <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
              <Wrench size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-800">{totalCount}</h3>
            <p className="text-xs text-slate-400 mt-1">Unit terdaftar</p>
          </div>
        </motion.div>

        {/* Valid */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01, boxShadow: '0 8px 20px -6px rgba(16, 185, 129, 0.1)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Kalibrasi Aktif</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-emerald-600">{validCount}</h3>
            <p className="text-xs text-emerald-600 mt-1">Aman digunakan</p>
          </div>
        </motion.div>

        {/* Warning */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01, boxShadow: '0 8px 20px -6px rgba(245, 158, 11, 0.1)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Perlu Kalibrasi</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-amber-600">{warningCount}</h3>
            <p className="text-xs text-amber-500 mt-1">&lt; {warningDays} hari lagi</p>
          </div>
        </motion.div>

        {/* Expired */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01, boxShadow: '0 8px 20px -6px rgba(239, 68, 68, 0.1)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Kadaluarsa</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <XCircle size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-rose-600">{expiredCount}</h3>
            <p className="text-xs text-rose-500 mt-1">Tidak boleh dipakai</p>
          </div>
        </motion.div>

        {/* Calibrating */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01, boxShadow: '0 8px 20px -6px rgba(59, 130, 246, 0.1)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sedang Kalibrasi</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Calendar size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-blue-600">{calibratingCount}</h3>
            <p className="text-xs text-blue-500 mt-1">Dalam proses uji</p>
          </div>
        </motion.div>

        {/* Maintenance */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01, boxShadow: '0 8px 20px -6px rgba(168, 85, 247, 0.1)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Maintenance</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Settings size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-purple-600">{maintenanceCount}</h3>
            <p className="text-xs text-purple-500 mt-1">Diberhentikan sementara</p>
          </div>
        </motion.div>
      </div>

      {/* Main Grid: Upcoming Calibrations & Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Timeline & Health Status */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Timeline Kalibrasi */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Timeline Kalibrasi Terdekat</h2>
                <p className="text-xs text-slate-500">Daftar instrumen dengan tanggal jatuh tempo terdekat</p>
              </div>
              <button 
                onClick={() => onNavigate('alat')} 
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
              >
                Lihat Semua Alat &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {upcomingCalibrations.map((item) => {
                const daysLeft = getDaysRemaining(item.nextCalibrationDate);
                let urgencyColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                let indicatorColor = 'bg-emerald-500';
                
                if (daysLeft < 0) {
                  urgencyColor = 'bg-rose-100 text-rose-800 border-rose-200';
                  indicatorColor = 'bg-rose-500';
                } else if (daysLeft <= warningDays) {
                  urgencyColor = 'bg-amber-100 text-amber-800 border-amber-200';
                  indicatorColor = 'bg-amber-500';
                }

                return (
                  <div 
                    key={item.id} 
                    onClick={() => onSelectEquipment(item.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 cursor-pointer transition gap-3"
                  >
                    <div className="flex items-start space-x-3 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${indicatorColor}`} />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 leading-snug truncate">{item.name}</h4>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 mt-1">
                          <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium text-[10px]">ID: {item.id}</span>
                          {item.inventoryNumber && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="font-semibold text-indigo-600 font-mono text-[10px]">No. Inv: {item.inventoryNumber}</span>
                            </>
                          )}
                          <span className="text-slate-300">•</span>
                          <span className="truncate">{item.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end space-x-3.5 pt-2.5 sm:pt-0 border-t border-slate-100/70 sm:border-t-0 text-left sm:text-right shrink-0">
                      <div className="min-w-0">
                        <p className="text-xs text-slate-600 font-semibold">Batas: {formatDateIndo(item.nextCalibrationDate)}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">PJ: {item.responsiblePerson}</p>
                      </div>
                      <span className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-full border font-bold shrink-0 ${urgencyColor}`}>
                        {daysLeft < 0 ? 'KADALUARSA' : `${daysLeft} Hari Lagi`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tren Kalibrasi Bulanan */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-800">Tren Kesiapan Kalibrasi Bulanan</h2>
              <p className="text-xs text-slate-500">Jumlah instrumen berdasarkan tenggat waktu kalibrasi bulanan</p>
            </div>

            <div className="h-72 w-full mt-2 font-sans">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} 
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b', fontSize: '12px', marginBottom: '4px' }}
                    itemStyle={{ fontSize: '11px', padding: '2px 0' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}
                  />
                  <Bar dataKey="Kalibrasi Valid" stackId="a" fill="#10b981" />
                  <Bar dataKey="Butuh Kalibrasi" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="Kadaluarsa" stackId="a" fill="#f43f5e" />
                  <Bar dataKey="Uji Kalibrasi" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="Maintenance" stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Access QR & Scanner Simulation Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-xl shadow-xs relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10 pointer-events-none">
              <QrCode size={160} />
            </div>
            <div className="max-w-md space-y-4">
              <h3 className="text-lg font-bold">Verifikasi Lapangan via QR Code</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Setiap alat dilengkapi QR Code unik. Cukup scan kode fisik pada instrumen untuk melihat validitas kalibrasi langsung di layar tanpa login atau mencari manual.
              </p>
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => onNavigate('scan')}
                  className="bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold px-4 py-2.5 rounded-lg flex items-center space-x-2 transition cursor-pointer"
                >
                  <QrCode size={16} />
                  <span>Buka Kamera Scan QR</span>
                </button>
                <button
                  onClick={() => onNavigate('alat')}
                  className="bg-indigo-600/50 hover:bg-indigo-600/70 border border-indigo-400/30 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition cursor-pointer"
                >
                  Cetak QR Fisik Alat
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real-time Usage & Notifications */}
        <div className="space-y-6">
          
          {/* Active Usage Log */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="text-indigo-600 animate-pulse" size={18} />
                <h2 className="text-lg font-bold text-slate-800">Status Penggunaan</h2>
              </div>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {activeUsage.length} Aktif
              </span>
            </div>

            {activeUsage.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg">
                <p className="text-xs text-slate-400">Semua alat dalam kondisi standby.</p>
                <button 
                  onClick={() => onNavigate('penggunaan')} 
                  className="text-xs text-indigo-600 font-semibold hover:underline mt-2 cursor-pointer"
                >
                  Mulai Penggunaan Alat &rarr;
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeUsage.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{log.equipmentName}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Operator: {log.operator}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded-md font-medium animate-pulse">
                        Sesi Aktif
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200/50 flex justify-between items-center text-[10px] text-slate-400">
                      <span>Mulai: {log.startTime} WIB</span>
                      <button 
                        onClick={() => onNavigate('penggunaan')}
                        className="text-indigo-600 font-semibold hover:underline cursor-pointer"
                      >
                        Selesaikan Sesi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alert Notifications Panel */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Bell className="text-amber-500" size={18} />
                <h2 className="text-lg font-bold text-slate-800">Alat Masuk Tenggat</h2>
              </div>
              {unreadNotifications.length > 0 && (
                <button 
                  onClick={onMarkAllNotificationsRead}
                  className="text-[11px] text-slate-500 hover:text-indigo-600 transition cursor-pointer"
                >
                  Tandai Dibaca
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {notifications.slice(0, 3).map((notif) => {
                let colorClass = 'bg-blue-50 border-blue-100 text-blue-800';
                let icon = <Bell size={14} />;
                
                if (notif.type === 'danger') {
                  colorClass = 'bg-rose-50 border-rose-100 text-rose-800';
                  icon = <XCircle size={14} className="text-rose-600" />;
                } else if (notif.type === 'warning') {
                  colorClass = 'bg-amber-50 border-amber-100 text-amber-800';
                  icon = <AlertTriangle size={14} className="text-amber-600" />;
                } else if (notif.type === 'success') {
                  colorClass = 'bg-emerald-50 border-emerald-100 text-emerald-800';
                  icon = <CheckCircle size={14} className="text-emerald-600" />;
                }

                return (
                  <div 
                    key={notif.id} 
                    className={`p-3 rounded-lg border flex space-x-2.5 items-start text-xs transition ${colorClass} ${!notif.isRead ? 'ring-1 ring-inset ring-indigo-500/20' : ''}`}
                  >
                    <div className="mt-0.5">{icon}</div>
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{notif.title}</span>
                        {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-90">{notif.message}</p>
                      <p className="text-[9px] opacity-60 text-right mt-1">{notif.date}</p>
                    </div>
                  </div>
                );
              })}

              {notifications.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Tidak ada pemberitahuan atau alarm aktif.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
