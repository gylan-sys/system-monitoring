/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ClipboardCheck, 
  Download,
  Calendar
} from 'lucide-react';
import { Equipment, MaintenanceRecord, UsageLog } from '../types';
import { formatDateIndo, exportToCSV } from '../utils/helpers';

interface AuditViewProps {
  equipmentList: Equipment[];
  maintenanceRecords: MaintenanceRecord[];
  usageLogs: UsageLog[];
}

export default function AuditView({
  equipmentList,
  maintenanceRecords,
  usageLogs,
}: AuditViewProps) {
  const [selectedMonth, setSelectedMonth] = useState('07'); // Default July
  const [selectedYear, setSelectedYear] = useState('2026');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set(equipmentList.map(e => e.category)))];

  // Filtering equipment for audit
  const filteredEq = equipmentList.filter(item => {
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  // Calculate audit stats
  const totalAlat = filteredEq.length;
  const validAlat = filteredEq.filter(e => e.status === 'valid').length;
  const warningAlat = filteredEq.filter(e => e.status === 'warning').length;
  const expiredAlat = filteredEq.filter(e => e.status === 'expired').length;
  const calibratingAlat = filteredEq.filter(e => e.status === 'calibrating').length;
  const maintenanceAlat = filteredEq.filter(e => e.status === 'maintenance').length;

  const precentValid = totalAlat > 0 ? Math.round((validAlat / totalAlat) * 100) : 100;

  // Handle Export CSV (Excel format)
  const handleExportCSV = () => {
    const headers = [
      'ID Alat', 
      'Nama Alat', 
      'Kategori', 
      'Merek/Model', 
      'Nomor Seri S/N', 
      'Lokasi Penyimpanan', 
      'Penanggung Jawab', 
      'Email PJ', 
      'Interval (Bulan)', 
      'Kalibrasi Terakhir', 
      'Jatuh Tempo Kalibrasi', 
      'Status Kalibrasi'
    ];

    const keys = [
      'id',
      'name',
      'category',
      'model',
      'serialNumber',
      'location',
      'responsiblePerson',
      'responsibleEmail',
      'calibrationInterval',
      'lastCalibrationDate',
      'nextCalibrationDate',
      'status'
    ];

    // Map status into readable indonesian text
    const exportData = filteredEq.map(eq => ({
      ...eq,
      status: eq.status === 'valid' ? 'VALID (AKURAT)' :
              eq.status === 'warning' ? 'PERINGATAN (DEKAT JATUH TEMPO)' :
              eq.status === 'expired' ? 'KADALUARSA (TIDAK BOLEH PAKAI)' :
              'SEDANG DIKALIBRASI'
    }));

    exportToCSV(exportData, headers, keys, `Audit_Kalibrasi_Lab_Bulan_${selectedMonth}_${selectedYear}`);
  };

  // Handle Printable PDF Report (Opens customized clean page for printing)
  const handlePrintAuditPDF = () => {
    const appName = localStorage.getItem('cfg_app_name') || 'LabCalib';
    const labName = localStorage.getItem('cfg_lab_name') || 'Laboratorium Metrologi Kimia & Fisika';
    const defaultPic = localStorage.getItem('cfg_default_pic') || 'Dr. Hendra Wijaya';

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const rowsHtml = filteredEq.map(eq => `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
          <td style="padding: 10px; font-family: monospace; font-weight: bold;">${eq.id}</td>
          <td style="padding: 10px;">
            <div style="font-weight: bold; color: #1e293b;">${eq.name}</div>
            <div style="font-size: 10px; color: #64748b;">S/N: ${eq.serialNumber}</div>
          </td>
          <td style="padding: 10px;">${eq.category}</td>
          <td style="padding: 10px;">${eq.location}</td>
          <td style="padding: 10px;">${formatDateIndo(eq.lastCalibrationDate)}</td>
          <td style="padding: 10px; font-weight: bold; color: ${eq.status === 'expired' ? '#dc2626' : eq.status === 'warning' ? '#d97706' : '#16a34a'}">
            ${formatDateIndo(eq.nextCalibrationDate)}
          </td>
          <td style="padding: 10px; font-weight: bold;">
            <span style="
              padding: 3px 8px; 
              border-radius: 9999px; 
              font-size: 9px;
              border: 1px solid;
              background-color: ${eq.status === 'valid' ? '#f0fdf4' : eq.status === 'warning' ? '#fffbeb' : '#fef2f2'};
              color: ${eq.status === 'valid' ? '#16a34a' : eq.status === 'warning' ? '#d97706' : '#dc2626'};
              border-color: ${eq.status === 'valid' ? '#bbf7d0' : eq.status === 'warning' ? '#fde68a' : '#fca5a5'};
            ">
              ${eq.status === 'valid' ? 'VALID' : eq.status === 'warning' ? 'WARN' : 'KADALUARSA'}
            </span>
          </td>
        </tr>
      `).join('');

      const monthName = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ][parseInt(selectedMonth, 10) - 1];

      printWindow.document.write(`
        <html>
          <head>
            <title>Laporan Audit Bulanan Kalibrasi - ${monthName} ${selectedYear}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; background: #fff; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { background-color: #f8fafc; color: #475569; font-weight: bold; font-size: 11px; text-transform: uppercase; padding: 12px 10px; border-bottom: 2px solid #e2e8f0; text-align: left; }
              @media print {
                body { padding: 0; }
                button { display: none; }
              }
            </style>
          </head>
          <body onload="window.print()">
            <!-- Cover Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 25px;">
              <div>
                <h1 style="margin: 0; font-size: 20px; color: #1e3a8a;">LAPORAN AUDIT BULANAN KALIBRASI ALAT</h1>
                <p style="margin: 5px 0 0; font-size: 12px; color: #475569;">Bulan Audit: <strong>${monthName} ${selectedYear}</strong> • Periode Pelaporan Laboratorium</p>
              </div>
              <div style="text-align: right;">
                <h3 style="margin: 0; font-size: 14px; color: #0f172a; text-transform: uppercase;">${labName}</h3>
                <p style="margin: 3px 0 0; font-size: 10px; color: #64748b;">Dokumen Kepatuhan Standar ISO/IEC 17025</p>
              </div>
            </div>

            <!-- Stats grid -->
            <div style="display: grid; grid-template-cols: repeat(5, 1fr); gap: 10px; margin-bottom: 25px;">
              <div style="border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px;">
                <span style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Total Alat</span>
                <h3 style="margin: 5px 0 0; font-size: 18px; color: #1e293b;">${totalAlat} Unit</h3>
              </div>
              <div style="border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; border-left: 4px solid #10b981;">
                <span style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Kalibrasi Valid</span>
                <h3 style="margin: 5px 0 0; font-size: 18px; color: #10b981;">${validAlat} Unit</h3>
              </div>
              <div style="border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; border-left: 4px solid #f59e0b;">
                <span style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Mendekati Limit</span>
                <h3 style="margin: 5px 0 0; font-size: 18px; color: #f59e0b;">${warningAlat} Unit</h3>
              </div>
              <div style="border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; border-left: 4px solid #ef4444;">
                <span style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Kadaluarsa</span>
                <h3 style="margin: 5px 0 0; font-size: 18px; color: #ef4444;">${expiredAlat} Unit</h3>
              </div>
              <div style="border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; border-left: 4px solid #a855f7;">
                <span style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Maintenance</span>
                <h3 style="margin: 5px 0 0; font-size: 18px; color: #a855f7;">${maintenanceAlat} Unit</h3>
              </div>
            </div>

            <!-- Main Inventory list -->
            <h3 style="color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin: 0;">DAFTAR REKAPITULASI KONDISI INSTRUMEN</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama & S/N Alat</th>
                  <th>Kategori</th>
                  <th>Lokasi Penempatan</th>
                  <th>Uji Terakhir</th>
                  <th>Jatuh Tempo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>

            <!-- Signatures -->
            <div style="margin-top: 50px; display: flex; justify-content: space-between; font-size: 12px;">
              <div style="width: 250px; text-align: center;">
                <p style="margin-bottom: 60px;">Disiapkan Oleh,<br/><strong>Penanggung Jawab Inventaris Lab</strong></p>
                <p style="margin: 0; text-decoration: underline;">.................................................</p>
                <p style="margin: 3px 0 0 0; font-size: 10px; color: #64748b;">NIP / ID Petugas</p>
              </div>
              <div style="width: 250px; text-align: center;">
                <p style="margin-bottom: 60px;">Disetujui Oleh,<br/><strong>Kepala Laboratorium Utama</strong></p>
                <p style="margin: 0; text-decoration: underline; font-weight: bold;">${defaultPic}</p>
                <p style="margin: 3px 0 0 0; font-size: 10px; color: #64748b;">Pimpinan / Kepala Lab Utama</p>
              </div>
            </div>
            
            <div style="text-align: center; font-size: 10px; color: #94a3b8; margin-top: 60px; border-top: 1px dashed #e2e8f0; padding-top: 15px;">
              Dokumen ini diterbitkan oleh Sistem Digital ${appName} secara otomatis pada tanggal ${formatDateIndo('2026-07-14')}.
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Block */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 font-sans">Laporan Audit & Ekspor Bulanan</h1>
          <p className="text-xs text-slate-500">
            Ekspor rekapitulasi data inventaris alat sampling laboratorium untuk keperluan audit instansi KAN atau pelaporan berkala pimpinan.
          </p>
        </div>

        {/* Filters Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
          {/* Month picker */}
          <div className="space-y-1">
            <label className="font-bold text-slate-600">Bulan Audit</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white focus:outline-none"
            >
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maret</option>
              <option value="04">April</option>
              <option value="05">Mei</option>
              <option value="06">Juni</option>
              <option value="07">Juli</option>
              <option value="08">Agustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>

          {/* Year picker */}
          <div className="space-y-1">
            <label className="font-bold text-slate-600">Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white focus:outline-none"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="font-bold text-slate-600">Saring Kategori</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white focus:outline-none"
            >
              <option value="All">Semua Kategori</option>
              {categories.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="font-bold text-slate-600">Saring Status Kalibrasi</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white focus:outline-none"
            >
              <option value="All">Semua Status</option>
              <option value="valid">✅ Valid</option>
              <option value="warning">⚠️ Warning</option>
              <option value="expired">❌ Kadaluarsa</option>
              <option value="calibrating">⚙️ Sedang Kalibrasi</option>
              <option value="maintenance">🛠️ Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Export action card */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg inline-block">
              <FileSpreadsheet size={20} />
            </span>
            <h3 className="font-bold text-slate-800 text-sm">Ekspor ke Excel / CSV</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unduh spreadsheet penuh berisi rekapitulasi data seluruh alat sampling laboratorium yang disaring, nomor seri, tanggal kalibrasi terakhir, PIC, dan status kelayakan pakai.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <Download size={14} />
            <span>Unduh File Excel (.CSV)</span>
          </button>
        </div>

        {/* PDF printable report action card */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg inline-block">
              <Printer size={20} />
            </span>
            <h3 className="font-bold text-slate-800 text-sm">Cetak Laporan Audit Resmi (PDF)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Membuka jendela cetak khusus yang diformat secara formal dengan kop dinas, tanda tangan digital PJ, ringkasan statistika kelayakan, dan lembar tabel kelayakan alat.
            </p>
          </div>

          <button
            onClick={handlePrintAuditPDF}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <Printer size={14} />
            <span>Cetak Laporan Bulanan (PDF)</span>
          </button>
        </div>

        {/* Audit health card */}
        <div className="bg-gradient-to-br from-indigo-950 to-slate-900 p-6 rounded-xl text-white flex flex-col justify-between shadow-xs">
          <div className="space-y-2">
            <span className="p-2 bg-white/10 text-indigo-300 rounded-lg inline-block">
              <ClipboardCheck size={20} />
            </span>
            <h3 className="font-bold text-sm">Nilai Kelayakan Kepatuhan Alat</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Persentase alat sampling aktif yang memiliki sertifikasi kalibrasi valid dan sah untuk operasional laboratorium hari ini.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-white">{precentValid}%</h2>
              <p className="text-[10px] text-slate-400 uppercase mt-0.5 font-bold">Kepatuhan Audit</p>
            </div>
            
            <div className="text-right text-[11px] text-slate-300 space-y-0.5">
              <p>• Valid: <span className="text-emerald-400 font-bold">{validAlat}</span></p>
              <p>• Warning: <span className="text-amber-400 font-bold">{warningAlat}</span></p>
              <p>• Expired: <span className="text-rose-400 font-bold">{expiredAlat}</span></p>
              <p>• Maint: <span className="text-purple-400 font-bold">{maintenanceAlat}</span></p>
            </div>
          </div>
        </div>

      </div>

      {/* Log list preview */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="text-indigo-600" size={16} />
            <h3 className="text-sm font-bold text-slate-800">Daftar Inventaris Dalam Laporan Audit</h3>
          </div>
          <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
            {totalAlat} Alat Sesuai Filter
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                <th className="p-3">ID Alat</th>
                <th className="p-3">Nama Alat Sampling</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Lokasi</th>
                <th className="p-3">Kalibrasi Terakhir</th>
                <th className="p-3">Jatuh Tempo</th>
                <th className="p-3">Kelayakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEq.map((eq) => (
                <tr key={eq.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-mono font-bold text-slate-600">{eq.id}</td>
                  <td className="p-3">
                    <p className="font-semibold text-slate-800">{eq.name}</p>
                    <p className="text-[10px] text-slate-400">S/N: {eq.serialNumber}</p>
                  </td>
                  <td className="p-3 text-slate-500">{eq.category}</td>
                  <td className="p-3 text-slate-500">{eq.location}</td>
                  <td className="p-3 text-slate-500">{formatDateIndo(eq.lastCalibrationDate)}</td>
                  <td className="p-3 font-medium text-slate-700">{formatDateIndo(eq.nextCalibrationDate)}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      eq.status === 'valid' ? 'bg-emerald-50 text-emerald-700' :
                      eq.status === 'warning' ? 'bg-amber-50 text-amber-700' :
                      eq.status === 'expired' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {eq.status === 'valid' ? 'LAYAK PAKAI' :
                       eq.status === 'warning' ? 'JATUH TEMPO' :
                       eq.status === 'expired' ? 'DILARANG PAKAI' : 'SEDANG UJI'}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredEq.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Tidak ada alat yang cocok dengan filter untuk laporan audit ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
