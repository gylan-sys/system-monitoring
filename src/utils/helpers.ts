/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CalibrationStatus } from '../types';

/**
 * Calculates the difference in days between today and a target date.
 */
export function getDaysRemaining(targetDateStr: string, baseDateStr: string = '2026-07-14'): number {
  const target = new Date(targetDateStr);
  const base = new Date(baseDateStr);
  const diffTime = target.getTime() - base.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Determines calibration status based on dates.
 */
export function determineStatus(
  nextCalibDateStr: string,
  baseDateStr: string = '2026-07-14',
  currentStatus?: CalibrationStatus
): CalibrationStatus {
  if (currentStatus === 'calibrating') return 'calibrating';
  if (currentStatus === 'maintenance') return 'maintenance';
  
  const daysRemaining = getDaysRemaining(nextCalibDateStr, baseDateStr);
  
  if (daysRemaining < 0) {
    return 'expired';
  } else if (daysRemaining <= 30) {
    return 'warning';
  } else {
    return 'valid';
  }
}

/**
 * Formats a date string (YYYY-MM-DD) into Indonesian human-readable format.
 */
export function formatDateIndo(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    return `${day} ${months[monthIndex]} ${year}`;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Generates and downloads a CSV file from data objects.
 */
export function exportToCSV(data: any[], headers: string[], keys: string[], filename: string) {
  // Build row headers
  let csvContent = headers.join(',') + '\n';
  
  // Build rows
  data.forEach(item => {
    const row = keys.map(key => {
      let val = item[key];
      if (val === null || val === undefined) {
        val = '';
      } else {
        // Escape quotes
        val = String(val).replace(/"/g, '""');
        // Wrap in quotes if it contains commas or newlines
        if (val.includes(',') || val.includes('\n') || val.includes('"')) {
          val = `"${val}"`;
        }
      }
      return val;
    });
    csvContent += row.join(',') + '\n';
  });
  
  // Download trigger
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Simulates a beautiful official-looking certificate PDF layout for printing/viewing.
 */
export function generateMockCertificateHtml(equipment: any, certNum: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; border: 4px double #1e3a8a; padding: 40px; background: #fff; color: #1e293b; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px;">
        <h2 style="margin: 0; color: #1e3a8a; font-size: 26px; text-transform: uppercase; letter-spacing: 1px;">KEMENTERIAN RISET DAN TEKNOLOGI</h2>
        <h3 style="margin: 5px 0; font-size: 18px; color: #3b82f6;">BALAI KALIBRASI NASIONAL & LABORATORIUM UTAMA</h3>
        <p style="margin: 5px 0 0; font-size: 12px; color: #64748b; font-style: italic;">Jl. Sains Laboratorium No. 101, Kompleks Penelitian Sains & Inovasi, Jakarta</p>
      </div>
      
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 22px; color: #0f172a; text-decoration: underline; text-underline-offset: 4px;">SERTIFIKAT KALIBRASI</h1>
        <p style="margin: 5px 0 0; font-size: 14px; font-weight: bold; color: #475569;">NOMOR: ${certNum}</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <h3 style="color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 15px;">1. IDENTITAS ALAT (INSTRUMENT IDENTIFICATION)</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
          <tr>
            <td style="width: 40%; font-weight: bold; padding: 4px 0;">Nama Alat / Nama Spesifikasi:</td>
            <td>${equipment.name}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 4px 0;">Merek / Tipe Model:</td>
            <td>${equipment.model}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 4px 0;">Nomor Seri (Serial Number):</td>
            <td><code>${equipment.serialNumber}</code></td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 4px 0;">Kode Registrasi Lab:</td>
            <td><strong>${equipment.id}</strong></td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 4px 0;">Lokasi Penyimpanan:</td>
            <td>${equipment.location}</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 30px;">
        <h3 style="color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 15px;">2. METODE & STANDARD KALIBRASI</h3>
        <p style="font-size: 14px; line-height: 1.5; margin: 0 0 10px 0;">
          Kalibrasi dilakukan sesuai prosedur standar operasi laboratorium nasional <strong>SOP-KLB-${equipment.category ? equipment.category.toUpperCase().substring(0,4) : 'GEN'}-01</strong>. 
          Standard acuan yang digunakan tertelusur secara langsung ke sistem Satuan Internasional (SI) melalui Balai Pusat Standardisasi Fisika & Metrologi.
        </p>
      </div>

      <div style="margin-bottom: 30px;">
        <h3 style="color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 15px;">3. HASIL KALIBRASI (CALIBRATION RESULT)</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
          <thead>
            <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Titik Ukur / Nominal</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Penunjukan Alat</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Deviasi Aktual</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Ketidakpastian (U95%)</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Kesimpulan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">Titik Minimum Standar</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">Sesuai Standar</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">+0.01%</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">±0.02%</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1; color: green; font-weight: bold;">LOLOS</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">Titik Tengah Akurasi</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">Sesuai Standar</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">-0.02%</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">±0.02%</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1; color: green; font-weight: bold;">LOLOS</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">Titik Maksimum Kapasitas</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">Sesuai Standar</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">+0.03%</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">±0.03%</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1; color: green; font-weight: bold;">LOLOS</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="margin-bottom: 40px;">
        <table style="width: 100%; font-size: 14px;">
          <tr>
            <td style="width: 50%;">
              <p style="margin: 0 0 5px 0;"><strong>Tanggal Kalibrasi:</strong> ${formatDateIndo(equipment.lastCalibrationDate)}</p>
              <p style="margin: 0 0 5px 0; color: #dc2626;"><strong>Masa Kalibrasi Berlanjut:</strong> ${formatDateIndo(equipment.nextCalibrationDate)}</p>
              <p style="margin: 0;"><strong>Interval Uji:</strong> ${equipment.calibrationInterval} Bulan</p>
            </td>
            <td style="text-align: center; vertical-align: bottom;">
              <p style="margin: 0 0 70px 0;">Kepala Deputi Metrologi,</p>
              <p style="margin: 0; font-weight: bold; text-decoration: underline;">Dr. Ir. Wahyu Hidayat, M.T.</p>
              <p style="margin: 0; font-size: 11px; color: #64748b;">NIP. 19820412 200812 1 002</p>
            </td>
          </tr>
        </table>
      </div>
      
      <div style="text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 15px; font-size: 11px; color: #64748b;">
        <p style="margin: 0;">Dokumen ini sah secara hukum dan diterbitkan secara digital oleh Balai Kalibrasi Terakreditasi KAN.</p>
        <p style="margin: 5px 0 0 0;">Scan QR Code di fisik alat untuk memverifikasi keaslian dan status langsung di database lab.</p>
      </div>
    </div>
  `;
}
