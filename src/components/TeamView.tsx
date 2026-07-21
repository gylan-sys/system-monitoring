/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  User, 
  Wrench, 
  Share2, 
  Plus, 
  ArrowLeftRight, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal,
  BookmarkCheck,
  Building
} from 'lucide-react';
import { Equipment, CalibrationStatus, User as SystemUser } from '../types';

interface TeamViewProps {
  equipmentList: Equipment[];
  usersList: SystemUser[];
  teamsList: string[];
  onUpdateEquipment: (id: string, updatedFields: any) => void;
}

export default function TeamView({
  equipmentList,
  usersList,
  teamsList,
  onUpdateEquipment,
}: TeamViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [assigningEqId, setAssigningEqId] = useState<string | null>(null);
  const [targetTeamMap, setTargetTeamMap] = useState<{ [eqId: string]: string }>({});

  // Clean and prepare equipment list with helper fields if undefined
  const getEquipmentScopeAndTeam = (eq: Equipment) => {
    // If scope or team is not set, infer based on field existence or default to shared
    const scope = eq.scope || (eq.assignedTeam ? 'tim' : 'bersama');
    const assignedTeam = eq.assignedTeam || '';
    return { scope, assignedTeam };
  };

  // Stats calculation
  const totalTeams = teamsList.length;
  
  const teamEquipment = equipmentList.filter(e => {
    const { scope, assignedTeam } = getEquipmentScopeAndTeam(e);
    return scope === 'tim' && assignedTeam && teamsList.includes(assignedTeam);
  });

  const sharedEquipment = equipmentList.filter(e => {
    const { scope } = getEquipmentScopeAndTeam(e);
    return scope === 'bersama' || !e.assignedTeam;
  });

  const totalPersonnel = usersList.filter(u => u.role === 'petugas' && u.team).length;

  // Toggle expand/collapse team details
  const toggleTeamExpand = (teamName: string) => {
    if (expandedTeam === teamName) {
      setExpandedTeam(null);
    } else {
      setExpandedTeam(teamName);
    }
  };

  // Move equipment to shared (Alat Bersama)
  const handleReleaseToShared = (eq: Equipment) => {
    onUpdateEquipment(eq.id, {
      ...eq,
      scope: 'bersama',
      assignedTeam: ''
    });
  };

  // Assign or transfer equipment to a specific team
  const handleAssignToTeam = (eq: Equipment, teamName: string) => {
    if (!teamName) return;
    onUpdateEquipment(eq.id, {
      ...eq,
      scope: 'tim',
      assignedTeam: teamName
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="text-indigo-600" size={24} />
            Manajemen Tim & Penugasan Alat
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Pantau dan kelola aset alat sampling laboratorium berdasarkan divisi tim penanggung jawab (Alat Tim) maupun inventaris bersama (Alat Bersama).
          </p>
        </div>
        
        {/* Search Input Bar */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Cari alat atau divisi tim..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
          />
        </div>
      </div>

      {/* 2. Key Performance Metrics Widgets Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-4"
        >
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <Building size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Divisi Tim</p>
            <h3 className="text-xl font-black text-slate-800 mt-0.5">{totalTeams} <span className="text-xs font-normal text-slate-500">Grup</span></h3>
          </div>
        </motion.div>

        {/* Metric 2 */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-4"
        >
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <Wrench size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aset Dipegang Tim</p>
            <h3 className="text-xl font-black text-slate-800 mt-0.5">{teamEquipment.length} <span className="text-xs font-normal text-slate-500">Unit</span></h3>
          </div>
        </motion.div>

        {/* Metric 3 */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-4"
        >
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Share2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inventaris Bersama</p>
            <h3 className="text-xl font-black text-slate-800 mt-0.5">{sharedEquipment.length} <span className="text-xs font-normal text-slate-500">Unit</span></h3>
          </div>
        </motion.div>

        {/* Metric 4 */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-4"
        >
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <User size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Personel Aktif</p>
            <h3 className="text-xl font-black text-slate-800 mt-0.5">{totalPersonnel} <span className="text-xs font-normal text-slate-500">Staff</span></h3>
          </div>
        </motion.div>
      </div>

      {/* 3. Main Split View Grid (Teams List Left, Alat Bersama Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left / Main Section: Teams List Cards (bento structure) */}
        <div className="xl:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} className="text-slate-400" />
              Daftar Divisi Tim Kerja ({totalTeams})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamsList.map((teamName, index) => {
              // Color patterns based on index to make them visually premium
              const colors = [
                { border: 'hover:border-indigo-500', text: 'text-indigo-600', bg: 'bg-indigo-500', lightBg: 'bg-indigo-50/50' },
                { border: 'hover:border-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-500', lightBg: 'bg-emerald-50/50' },
                { border: 'hover:border-violet-500', text: 'text-violet-600', bg: 'bg-violet-500', lightBg: 'bg-violet-50/50' },
                { border: 'hover:border-amber-500', text: 'text-amber-600', bg: 'bg-amber-500', lightBg: 'bg-amber-50/50' },
              ];
              const theme = colors[index % colors.length];

              const teamMembers = usersList.filter(u => u.team === teamName);
              const assignedToThisTeam = equipmentList.filter(e => {
                const { scope, assignedTeam } = getEquipmentScopeAndTeam(e);
                return scope === 'tim' && assignedTeam === teamName;
              });

              // Status Summary inside Team
              const validInTeam = assignedToThisTeam.filter(e => e.status === 'valid').length;
              const warningInTeam = assignedToThisTeam.filter(e => e.status === 'warning').length;
              const expiredInTeam = assignedToThisTeam.filter(e => e.status === 'expired').length;
              const calibratingInTeam = assignedToThisTeam.filter(e => e.status === 'calibrating').length;
              const maintenanceInTeam = assignedToThisTeam.filter(e => e.status === 'maintenance').length;

              // Filter if query exists
              const isSearching = searchQuery.length > 0;
              const matchesSearch = teamName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                assignedToThisTeam.some(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.id.toLowerCase().includes(searchQuery.toLowerCase()));

              if (isSearching && !matchesSearch) return null;

              const isExpanded = expandedTeam === teamName;

              return (
                <motion.div
                  key={teamName}
                  layout="position"
                  className={`bg-white rounded-2xl border border-slate-100 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between ${theme.border}`}
                >
                  <div>
                    {/* Team Header */}
                    <div className="p-5 border-b border-slate-50 flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${theme.bg}`} />
                          <h3 className="text-sm font-black text-slate-800">{teamName}</h3>
                        </div>
                        <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                          <User size={12} />
                          {teamMembers.length > 0 
                            ? `${teamMembers.length} Anggota: ${teamMembers.map(m => m.name.split(' ')[0]).join(', ')}` 
                            : 'Belum ada anggota tim'
                          }
                        </p>
                      </div>

                      {/* Equipment count badge */}
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${theme.lightBg} ${theme.text}`}>
                        {assignedToThisTeam.length} Alat
                      </span>
                    </div>

                    {/* Team Status Counters Block */}
                    <div className="px-5 py-3.5 bg-slate-50/50 grid grid-cols-5 text-center gap-1 border-b border-slate-50">
                      <div>
                        <p className="text-[16px] font-black text-emerald-600">{validInTeam}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Aman</p>
                      </div>
                      <div>
                        <p className="text-[16px] font-black text-amber-500">{warningInTeam}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Warning</p>
                      </div>
                      <div>
                        <p className="text-[16px] font-black text-rose-500">{expiredInTeam}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Expired</p>
                      </div>
                      <div>
                        <p className="text-[16px] font-black text-indigo-500">{calibratingInTeam}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Uji</p>
                      </div>
                      <div>
                        <p className="text-[16px] font-black text-slate-500">{maintenanceInTeam}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Maint</p>
                      </div>
                    </div>

                    {/* Collapsible Equipment List Panel */}
                    <div className="px-5 py-3">
                      <button
                        onClick={() => toggleTeamExpand(teamName)}
                        className="w-full flex items-center justify-between text-[11px] text-slate-500 hover:text-slate-800 font-bold transition focus:outline-none"
                      >
                        <span>{isExpanded ? 'Sembunyikan Daftar Alat' : 'Tampilkan Detail Alat'}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 space-y-2 overflow-hidden"
                          >
                            {assignedToThisTeam.length === 0 ? (
                              <div className="py-6 text-center text-slate-400 text-[11px] bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                Belum ada alat khusus yang ditugaskan ke tim ini.
                              </div>
                            ) : (
                              assignedToThisTeam.map(eq => {
                                // Status styling helper
                                let statusColor = 'bg-emerald-500';
                                if (eq.status === 'warning') statusColor = 'bg-amber-500';
                                if (eq.status === 'expired') statusColor = 'bg-rose-500';
                                if (eq.status === 'calibrating') statusColor = 'bg-indigo-500';
                                if (eq.status === 'maintenance') statusColor = 'bg-slate-400';

                                return (
                                  <div
                                    key={eq.id}
                                    className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 flex items-center justify-between gap-2 transition"
                                  >
                                    <div className="min-w-0 flex items-center space-x-2.5">
                                      <span className={`w-2 h-2 rounded-full shrink-0 ${statusColor}`} />
                                      <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-700 truncate" title={eq.name}>{eq.name}</p>
                                        <p className="text-[9px] text-slate-400 font-semibold">ID: {eq.id} • {eq.category}</p>
                                      </div>
                                    </div>

                                    {/* Action items for assigned equipment */}
                                    <div className="flex items-center space-x-1">
                                      {/* Quick transfer to shared */}
                                      <button
                                        onClick={() => handleReleaseToShared(eq)}
                                        className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition cursor-pointer"
                                        title="Pindahkan ke Alat Bersama"
                                      >
                                        <MinusCircle size={13} />
                                      </button>
                                      
                                      {/* Transfer to another team selector */}
                                      <select
                                        value={teamName}
                                        onChange={(e) => handleAssignToTeam(eq, e.target.value)}
                                        className="text-[9px] font-bold bg-white border border-slate-200 px-1 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        title="Pindahkan ke Tim Lain"
                                      >
                                        <option disabled value={teamName}>Transfer...</option>
                                        {teamsList.filter(t => t !== teamName).map(t => (
                                          <option key={t} value={t}>{t}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Card Bottom: Quick Assign Selector */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto flex items-center space-x-2">
                    <select
                      value={targetTeamMap[teamName] || ''}
                      onChange={(e) => setTargetTeamMap({ ...targetTeamMap, [teamName]: e.target.value })}
                      className="flex-1 text-[11px] font-medium bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-slate-600"
                    >
                      <option value="">-- Pilih Alat Bersama --</option>
                      {sharedEquipment.map(eq => (
                        <option key={eq.id} value={eq.id}>
                          [{eq.id}] {eq.name.substring(0, 24)}...
                        </option>
                      ))}
                    </select>
                    <button
                      disabled={!targetTeamMap[teamName]}
                      onClick={() => {
                        const targetEqId = targetTeamMap[teamName];
                        const matchedEq = equipmentList.find(e => e.id === targetEqId);
                        if (matchedEq) {
                          handleAssignToTeam(matchedEq, teamName);
                          setTargetTeamMap({ ...targetTeamMap, [teamName]: '' });
                        }
                      }}
                      className={`p-2 rounded-lg text-white font-bold transition flex items-center justify-center cursor-pointer ${
                        targetTeamMap[teamName]
                          ? 'bg-indigo-600 hover:bg-indigo-700'
                          : 'bg-slate-200 cursor-not-allowed text-slate-400'
                      }`}
                      title="Tugaskan Alat ini"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Section: Alat Bersama / Shared Lab Equipment Panel */}
        <div className="xl:col-span-4 space-y-4">
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Share2 size={14} className="text-slate-400" />
              Alat Bersama (Shared Assets) ({sharedEquipment.length})
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
            <div className="p-3 bg-indigo-50/50 rounded-xl text-[11px] text-indigo-800 leading-relaxed font-semibold">
              ℹ️ Alat Bersama adalah inventaris laboratorium yang dapat dipinjam atau digunakan oleh semua divisi tanpa kepemilikan eksklusif.
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {sharedEquipment.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Tidak ada alat bersama yang tersedia saat ini.
                </div>
              ) : (
                sharedEquipment
                  .filter(eq => {
                    if (!searchQuery) return true;
                    return eq.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      eq.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      eq.category.toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map(eq => {
                    let statusColor = 'bg-emerald-500';
                    let statusLabel = 'Aman';
                    if (eq.status === 'warning') {
                      statusColor = 'bg-amber-500';
                      statusLabel = 'Warning';
                    } else if (eq.status === 'expired') {
                      statusColor = 'bg-rose-500';
                      statusLabel = 'Kritis';
                    } else if (eq.status === 'calibrating') {
                      statusColor = 'bg-indigo-500';
                      statusLabel = 'Uji';
                    } else if (eq.status === 'maintenance') {
                      statusColor = 'bg-slate-400';
                      statusLabel = 'Maint';
                    }

                    return (
                      <div
                        key={eq.id}
                        className="p-3 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-100 flex flex-col space-y-2.5 transition"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="min-w-0">
                            <h4 className="text-xs font-extrabold text-slate-800 truncate" title={eq.name}>{eq.name}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold">{eq.category} • {eq.id}</p>
                          </div>
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md text-white uppercase shrink-0 ${statusColor}`}>
                            {statusLabel}
                          </span>
                        </div>

                        {/* Assign to Team Selector row */}
                        <div className="flex items-center space-x-1.5 pt-1 border-t border-slate-200/50">
                          <span className="text-[9px] font-bold text-slate-400 uppercase shrink-0">Tugaskan:</span>
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssignToTeam(eq, e.target.value);
                                e.target.value = ''; // Reset
                              }
                            }}
                            className="flex-1 text-[9px] font-bold bg-white border border-slate-200 px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-600"
                          >
                            <option value="">Pilih Tim Penerima...</option>
                            {teamsList.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
