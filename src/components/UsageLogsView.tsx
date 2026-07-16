/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  CheckCircle, 
  Search, 
  Clock, 
  User, 
  FileSpreadsheet, 
  HelpCircle, 
  Activity, 
  Plus, 
  Check, 
  X,
  AlertCircle
} from 'lucide-react';
import { Equipment, UsageLog } from '../types';
import { formatDateIndo } from '../utils/helpers';

interface UsageLogsViewProps {
  usageLogs: UsageLog[];
  equipmentList: Equipment[];
  onStartUsage: (eqId: string, operator: string, purpose: string, notes: string) => void;
  onEndUsage: (logId: string, notes: string) => void;
}

export default function UsageLogsView({
  usageLogs,
  equipmentList,
  onStartUsage,
  onEndUsage,
}: UsageLogsViewProps) {
  // Search and display states
  const [search, setSearch] = useState('');
  const [showStartForm, setShowStartForm] = useState(false);
  const [showEndFormId, setShowEndFormId] = useState<string | null>(null);

  // Form input states (Start Sesi)
  const [selectedEqId, setSelectedEqId] = useState('');
  const [operator, setOperator] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [agreeToExpired, setAgreeToExpired] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);

  // Form input states (Selesai Sesi)
  const [endNotes, setEndNotes] = useState('');

  // Lists
  const activeLogs = usageLogs.filter(log => log.status === 'Sedang Digunakan');
  const pastLogs = usageLogs.filter(log => log.status === 'Selesai');

  // Filter logs based on search (including by inventory number)
  const filteredPastLogs = pastLogs.filter(log => {
    const eq = equipmentList.find(e => e.id === log.equipmentId);
    const invNumber = eq?.inventoryNumber || '';
    return (
      log.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
      log.operator.toLowerCase().includes(search.toLowerCase()) ||
      log.purpose.toLowerCase().includes(search.toLowerCase()) ||
      log.equipmentId.toLowerCase().includes(search.toLowerCase()) ||
      invNumber.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Handle start session submit
  const handleStartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEqId || !operator || !purpose) {
      setShowError('Mohon isi alat, nama operator, dan tujuan penggunaan!');
      return;
    }

    // Verify if tool is currently calibrated (warn if warning or expired)
    const targetEq = equipmentList.find(eq => eq.id === selectedEqId);
    if (targetEq && targetEq.status === 'expired' && !agreeToExpired) {
      setShowError('Alat ini telah melewati batas kalibrasi! Anda harus menyetujui peringatan risiko untuk melanjutkan.');
      return;
    }

    onStartUsage(selectedEqId, operator, purpose, notes);
    
    // Reset state
    setSelectedEqId('');
    setOperator('');
    setPurpose('');
    setNotes('');
    setAgreeToExpired(false);
    setShowError(null);
    setShowStartForm(false);
  };

  // Handle end session submit
  const handleEndSubmit = (e: React.FormEvent, logId: string) => {
    e.preventDefault();
    onEndUsage(logId, endNotes || 'Alat dikembalikan dalam kondisi bersih dan berfungsi.');
    setEndNotes('');
    setShowEndFormId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Log Aktivitas Penggunaan Alat</h1>
          <p className="text-xs text-slate-500">
            Pencatatan sirkulasi penggunaan instrumen laboratorium secara real-time untuk pembukuan logbook administratif.
          </p>
        </div>
        <button
          onClick={() => setShowStartForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
        >
          <Play size={15} />
          <span>Mulai Pemakaian Alat</span>
        </button>
      </div>

      {/* Grid: Active Sesi (Top) vs Past History (Bottom) */}
      <div className="space-y-6">
        
        {/* Active Sessions */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Activity className="text-indigo-600 animate-pulse" size={18} />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Aktivitas Lab Berlangsung ({activeLogs.length})</h2>
          </div>

          {activeLogs.length === 0 ? (
            <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
              Tidak ada aktivitas penggunaan alat sampling yang aktif saat ini. Alat siap digunakan.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeLogs.map((log) => {
                const isEnding = showEndFormId === log.id;
                const eqItem = equipmentList.find(e => e.id === log.equipmentId);

                return (
                  <div key={log.id} className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 flex flex-col justify-between hover:shadow-xs transition">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[9px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded uppercase font-mono" title={`ID: ${log.equipmentId}`}>
                            No. Inv: {eqItem?.inventoryNumber || log.equipmentId}
                          </span>
                          <h4 className="text-sm font-bold text-slate-800 mt-1.5 line-clamp-1">{log.equipmentName}</h4>
                        </div>
                        <span className="bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full font-semibold animate-pulse">
                          Sedang Dipakai
                        </span>
                      </div>

                      {eqItem?.status === 'expired' && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-800 text-[10px] p-2 rounded-lg flex items-start space-x-1 font-medium">
                          <AlertCircle size={14} className="text-rose-600 shrink-0 mt-0.5" />
                          <span>Alat ini kadaluarsa kalibrasinya! Gunakan dengan hati-hati.</span>
                        </div>
                      )}

                      <div className="space-y-1 text-xs text-slate-600">
                        <p className="flex items-center">
                          <User size={13} className="mr-1.5 text-slate-400" />
                          Operator: <span className="font-semibold text-slate-800 ml-1">{log.operator}</span>
                        </p>
                        <p className="flex items-center">
                          <Clock size={13} className="mr-1.5 text-slate-400" />
                          Mulai: <span className="font-medium text-slate-800 ml-1">{log.startTime} WIB ({formatDateIndo(log.startDate)})</span>
                        </p>
                        <p className="text-[11px] text-slate-500 italic mt-1 bg-white/60 p-2 rounded-md border border-slate-100">
                          "{log.purpose}"
                        </p>
                      </div>
                    </div>

                    {/* Selesaikan form inline */}
                    <div className="mt-4 pt-4 border-t border-indigo-100/50">
                      {isEnding ? (
                        <form onSubmit={(e) => handleEndSubmit(e, log.id)} className="space-y-2">
                          <textarea
                            required
                            rows={2}
                            placeholder="Tuliskan catatan akhir penggunaan (kondisi alat, kendala, dll)..."
                            value={endNotes}
                            onChange={(e) => setEndNotes(e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white focus:ring-1 focus:ring-indigo-500"
                          />
                          <div className="flex space-x-1 justify-end">
                            <button
                              type="button"
                              onClick={() => setShowEndFormId(null)}
                              className="px-2.5 py-1 text-slate-500 hover:bg-slate-100 text-[10px] font-semibold rounded cursor-pointer"
                            >
                              Batal
                            </button>
                            <button
                              type="submit"
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded flex items-center space-x-1 cursor-pointer"
                            >
                              <Check size={12} />
                              <span>Selesaikan Sesi</span>
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => {
                            setShowEndFormId(log.id);
                            setEndNotes('Selesai digunakan. Kondisi alat bersih, steril, dan berfungsi normal.');
                          }}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer"
                        >
                          <CheckCircle size={14} />
                          <span>Selesaikan Pemakaian</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* History Logbook */}
        <div className="space-y-3 bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Arsip Logbook Administratif</h2>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Cari arsip log..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                  <th className="p-3">ID & Nama Alat</th>
                  <th className="p-3">Operator</th>
                  <th className="p-3">Waktu Pemakaian</th>
                  <th className="p-3">Tujuan Analisis</th>
                  <th className="p-3">Catatan Akhir</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPastLogs.map((log) => {
                  const eq = equipmentList.find(e => e.id === log.equipmentId);
                  const invNumber = eq?.inventoryNumber || log.equipmentId;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-xs">{log.equipmentName}</span>
                          <span className="text-[10px] text-indigo-600 font-bold font-mono">
                            No. Inv: {invNumber}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 font-medium text-slate-700">
                        {log.operator}
                      </td>
                      <td className="p-3 text-slate-500 space-y-0.5">
                        <p>{formatDateIndo(log.startDate)}</p>
                        <p className="text-[10px] text-slate-400">{log.startTime} - {log.endTime} WIB</p>
                      </td>
                      <td className="p-3 max-w-[200px] truncate text-slate-600" title={log.purpose}>
                        {log.purpose}
                      </td>
                      <td className="p-3 text-slate-500 max-w-[200px] truncate" title={log.notes}>
                        {log.notes}
                      </td>
                      <td className="p-3">
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Selesai
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filteredPastLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      {search ? 'Tidak ada arsip logbook yang cocok dengan pencarian.' : 'Belum ada arsip riwayat penggunaan alat.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Start New Usage Modal (Overlay) */}
      <AnimatePresence>
        {showStartForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-4 bg-indigo-950 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold">Mulai Sesi Pemakaian Alat</h3>
                  <p className="text-[10px] text-slate-400">Catat pemakaian untuk kepatuhan administrasi lab</p>
                </div>
                <button
                  onClick={() => setShowStartForm(false)}
                  className="p-1 hover:bg-indigo-900 rounded text-slate-300 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleStartSubmit} className="p-5 space-y-4">
                
                {showError && (
                  <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium animate-in fade-in duration-200">
                    {showError}
                  </div>
                )}

                {selectedEqId && equipmentList.find(eq => eq.id === selectedEqId)?.status === 'expired' && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg space-y-2 text-[11.5px] text-rose-800 animate-in fade-in duration-200">
                    <p className="font-semibold flex items-center space-x-1 text-rose-900 text-xs">
                      <span>⚠️ PERINGATAN KALIBRASI KEDALUWARSA</span>
                    </p>
                    <p className="text-slate-600 leading-normal text-[11px]">
                      Alat ini telah melewati batas waktu kalibrasi periodik yang ditentukan. Penggunaan alat kedaluwarsa berisiko menghasilkan data pengukuran yang tidak valid / ditolak audit eksternal.
                    </p>
                    <label className="flex items-start space-x-2 mt-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreeToExpired}
                        onChange={(e) => {
                          setAgreeToExpired(e.target.checked);
                          setShowError(null);
                        }}
                        className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span className="font-medium text-rose-700 leading-snug text-[11px]">Saya memahami risiko ini dan menyetujui penggunaan alat kedaluwarsa ini.</span>
                    </label>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Pilih Alat Sampling *</label>
                  <select
                    required
                    value={selectedEqId}
                    onChange={(e) => {
                      setSelectedEqId(e.target.value);
                      setAgreeToExpired(false);
                      setShowError(null);
                    }}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="">-- Pilih Alat --</option>
                    {equipmentList
                      .filter(eq => eq.status !== 'calibrating') // Don't list if calibrating
                      .map(eq => {
                        const inUse = activeLogs.some(log => log.equipmentId === eq.id);
                        return (
                          <option key={eq.id} value={eq.id} disabled={inUse}>
                            {eq.name} ({eq.inventoryNumber || eq.id}) {inUse ? '(Sedang Digunakan)' : ''}
                          </option>
                        );
                      })
                    }
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Nama Petugas / Operator *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Rian Hidayat"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Tujuan / Deskripsi Analisis *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Uji kadar pH limbah cair industri tekstil"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Catatan Kondisi Awal Alat (Opsional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g., Kondisi alat terkalibrasi, lampu deuterium menyala sempurna..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowStartForm(false)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded shadow-xs transition cursor-pointer"
                  >
                    Mulai Sesi
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
