/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CalibrationStatus = 'valid' | 'warning' | 'expired' | 'calibrating' | 'maintenance';

export interface Equipment {
  id: string; // e.g., "EQ-2026-001"
  name: string;
  category: string; // e.g., "Pipet", "Spektrofotometer", "pH Meter"
  model: string;
  serialNumber: string;
  location: string;
  responsiblePerson: string;
  responsibleEmail: string;
  calibrationInterval: number; // in months
  lastCalibrationDate: string; // YYYY-MM-DD
  nextCalibrationDate: string; // YYYY-MM-DD
  status: CalibrationStatus;
  certificateName: string | null;
  certificateData: string | null; // Base64 data or mock link
  certificateUploadDate: string | null;
  description: string;
  createdAt: string;
  inventoryNumber?: string;
  calibrationPoints?: string;
}

export type MaintenanceType = 'Pembersihan' | 'Kalibrasi' | 'Perbaikan' | 'Pengecekan Rutin';

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  date: string;
  type: MaintenanceType;
  operator: string;
  notes: string;
  status: 'Selesai' | 'Dalam Proses' | 'Butuh Tindak Lanjut';
}

export interface UsageLog {
  id: string;
  equipmentId: string;
  equipmentName: string;
  operator: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endDate: string | null;
  endTime: string | null;
  purpose: string;
  notes: string;
  status: 'Sedang Digunakan' | 'Selesai';
}

export interface SystemNotification {
  id: string;
  equipmentId?: string;
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  date: string; // YYYY-MM-DD HH:MM
  isRead: boolean;
}
