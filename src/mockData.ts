/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Equipment, MaintenanceRecord, UsageLog, SystemNotification } from './types';

// Let's assume today is 2026-07-14 based on the system metadata
export const TODAY_STR = '2026-07-14';

export const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: 'EQ-001',
    name: 'Spektrofotometer UV-Vis Shimadzu',
    category: 'Spektrofotometer',
    model: 'UV-1900i',
    serialNumber: 'SS-1900-84729',
    location: 'Laboratorium Kimia Analitik',
    responsiblePerson: 'Dr. Hendra Wijaya',
    responsibleEmail: 'hendra.wijaya@lab.id',
    calibrationInterval: 6, // 6 months
    lastCalibrationDate: '2026-01-15',
    nextCalibrationDate: '2026-07-15', // Expires in 1 day! (Warning status)
    status: 'warning',
    certificateName: 'CERT-UV1900-2026.pdf',
    certificateData: 'MOCK_BASE64_PDF_DATA',
    certificateUploadDate: '2026-01-16',
    description: 'Digunakan untuk analisis kuantitatif senyawa kimia menggunakan absorpsi cahaya ultraviolet dan tampak.',
    createdAt: '2024-05-10',
    inventoryNumber: 'INV/2026/001',
    calibrationPoints: '220 nm, 340 nm, 500 nm, 800 nm',
  },
  {
    id: 'EQ-002',
    name: 'Timbangan Analitik Mettler Toledo',
    category: 'Timbangan',
    model: 'XS204',
    serialNumber: 'MT-XS204-90123',
    location: 'Laboratorium Formulasi',
    responsiblePerson: 'Siti Rahma, S.Si.',
    responsibleEmail: 'siti.rahma@lab.id',
    calibrationInterval: 12, // 12 months
    lastCalibrationDate: '2025-07-10',
    nextCalibrationDate: '2026-07-10', // Already expired! (Expired status)
    status: 'expired',
    certificateName: 'CERT-MTXS204-2025.pdf',
    certificateData: 'MOCK_BASE64_PDF_DATA',
    certificateUploadDate: '2025-07-11',
    description: 'Timbangan analitik tingkat ketelitian tinggi hingga 0.1 mg untuk formulasi sampel sensitif.',
    createdAt: '2024-06-15',
    inventoryNumber: 'INV/2026/002',
    calibrationPoints: '50 g, 100 g, 150 g, 200 g',
  },
  {
    id: 'EQ-003',
    name: 'pH Meter Digital Ohaus',
    category: 'pH Meter',
    model: 'Starter 3100',
    serialNumber: 'OH-ST31-44512',
    location: 'Laboratorium Biokimia',
    responsiblePerson: 'Budi Santoso, M.Sc.',
    responsibleEmail: 'budi.santoso@lab.id',
    calibrationInterval: 3, // 3 months
    lastCalibrationDate: '2026-06-10',
    nextCalibrationDate: '2026-09-10', // Calibration valid
    status: 'valid',
    certificateName: 'CERT-PH3100-0626.pdf',
    certificateData: 'MOCK_BASE64_PDF_DATA',
    certificateUploadDate: '2026-06-11',
    description: 'Alat ukur derajat keasaman larutan sampel biologis dengan kompensasi suhu otomatis.',
    createdAt: '2025-01-20',
    inventoryNumber: 'INV/2025/003',
    calibrationPoints: 'pH 4.01, pH 7.00, pH 10.01',
  },
  {
    id: 'EQ-004',
    name: 'Mikropipet Eppendorf Research Plus',
    category: 'Pipet',
    model: '100-1000 µL',
    serialNumber: 'EP-RP-99881',
    location: 'Laboratorium Mikrobiologi',
    responsiblePerson: 'Ahmad Fauzi',
    responsibleEmail: 'ahmad.fauzi@lab.id',
    calibrationInterval: 6, // 6 months
    lastCalibrationDate: '2026-04-05',
    nextCalibrationDate: '2026-10-05', // Calibration valid
    status: 'valid',
    certificateName: 'CERT-PIP-0426.pdf',
    certificateData: 'MOCK_BASE64_PDF_DATA',
    certificateUploadDate: '2026-04-06',
    description: 'Pipet piston berkinerja tinggi untuk memindahkan cairan sampel dalam volume mikro secara presisi.',
    createdAt: '2025-02-15',
    inventoryNumber: 'INV/2025/004',
    calibrationPoints: '100 µL, 500 µL, 1000 µL',
  },
  {
    id: 'EQ-005',
    name: 'HPLC Agilent Technologies',
    category: 'Kromatografi',
    model: 'Infinity II 1260',
    serialNumber: 'AG-1260-31294',
    location: 'Laboratorium Kimia Analitik',
    responsiblePerson: 'Dr. Hendra Wijaya',
    responsibleEmail: 'hendra.wijaya@lab.id',
    calibrationInterval: 12, // 12 months
    lastCalibrationDate: '2025-08-01',
    nextCalibrationDate: '2026-08-01', // Warning status (Expires in ~18 days)
    status: 'warning',
    certificateName: 'CERT-HPLC-2025.pdf',
    certificateData: 'MOCK_BASE64_PDF_DATA',
    certificateUploadDate: '2025-08-02',
    description: 'High Performance Liquid Chromatography untuk pemisahan, identifikasi, dan kuantifikasi komponen dalam campuran larutan.',
    createdAt: '2023-11-12',
    inventoryNumber: 'INV/2023/005',
    calibrationPoints: 'Laju Alir 1.0 mL/min, Detektor UV 254 nm',
  },
  {
    id: 'EQ-006',
    name: 'Autoclave Hirayama',
    category: 'Sterilisasi',
    model: 'HVE-50',
    serialNumber: 'HR-HVE50-0871',
    location: 'Laboratorium Mikrobiologi',
    responsiblePerson: 'Ahmad Fauzi',
    responsibleEmail: 'ahmad.fauzi@lab.id',
    calibrationInterval: 12, // 12 months
    lastCalibrationDate: '2026-07-02',
    nextCalibrationDate: '2027-07-02', // Valid
    status: 'calibrating', // Currently undergoing special calibration cycle
    certificateName: null,
    certificateData: null,
    certificateUploadDate: null,
    description: 'Sterilisator uap bertekanan tinggi untuk mensterilkan media kultur mikroba dan alat gelas lab.',
    createdAt: '2024-02-01',
    inventoryNumber: 'INV/2024/006',
    calibrationPoints: 'Suhu 121°C, Tekanan 1.2 bar',
  }
];

export const INITIAL_MAINTENANCE: MaintenanceRecord[] = [
  {
    id: 'MNT-101',
    equipmentId: 'EQ-001',
    equipmentName: 'Spektrofotometer UV-Vis Shimadzu',
    date: '2026-04-12',
    type: 'Pembersihan',
    operator: 'Rian Hidayat',
    notes: 'Pembersihan ruang kompartemen sampel dan lensa optik dari debu halus. Kalibrasi panjang gelombang internal berhasil.',
    status: 'Selesai'
  },
  {
    id: 'MNT-102',
    equipmentId: 'EQ-002',
    equipmentName: 'Timbangan Analitik Mettler Toledo',
    date: '2026-05-20',
    type: 'Pengecekan Rutin',
    operator: 'Siti Rahma, S.Si.',
    notes: 'Pengecekan level waterpass dan pembersihan piringan timbang. Terdapat deviasi minor sebesar +0.2 mg pada beban uji 100g.',
    status: 'Butuh Tindak Lanjut'
  },
  {
    id: 'MNT-103',
    equipmentId: 'EQ-003',
    equipmentName: 'pH Meter Digital Ohaus',
    date: '2026-06-10',
    type: 'Kalibrasi',
    operator: 'Andi Wijaya (Teknisi Eksternal)',
    notes: 'Kalibrasi berkala menggunakan larutan buffer standar pH 4.01, 7.00, dan 10.01. Kalibrasi diterima dengan sertifikat baru.',
    status: 'Selesai'
  },
  {
    id: 'MNT-104',
    equipmentId: 'EQ-004',
    equipmentName: 'Mikropipet Eppendorf Research Plus',
    date: '2026-07-01',
    type: 'Perbaikan',
    operator: 'Siti Rahma, S.Si.',
    notes: 'Penggantian seal karet piston yang aus karena korosi pelarut organik ringan. Penyetelan ulang volume akurasi.',
    status: 'Selesai'
  }
];

export const INITIAL_USAGE_LOGS: UsageLog[] = [
  {
    id: 'LOG-501',
    equipmentId: 'EQ-001',
    equipmentName: 'Spektrofotometer UV-Vis Shimadzu',
    operator: 'Siti Rahma, S.Si.',
    startDate: '2026-07-13',
    startTime: '09:15',
    endDate: '2026-07-13',
    endTime: '11:45',
    purpose: 'Analisis kadar kafein dalam sampel minuman energi merek X.',
    notes: 'Kondisi lampu deuterium stabil, hasil absorbansi tercatat dengan baik.',
    status: 'Selesai'
  },
  {
    id: 'LOG-502',
    equipmentId: 'EQ-003',
    equipmentName: 'pH Meter Digital Ohaus',
    operator: 'Rian Hidayat',
    startDate: '2026-07-14',
    startTime: '08:00',
    endDate: '2026-07-14',
    endTime: '08:30',
    purpose: 'Pengukuran pH buffer fosfat untuk kultur bakteri Lactobacillus.',
    notes: 'Nilai pH akhir tercapai pada 6.82 pada suhu ruang 25C.',
    status: 'Selesai'
  },
  {
    id: 'LOG-503',
    equipmentId: 'EQ-005',
    equipmentName: 'HPLC Agilent Technologies',
    operator: 'Dr. Hendra Wijaya',
    startDate: '2026-07-14',
    startTime: '09:00',
    endDate: null,
    endTime: null,
    purpose: 'Pemisahan fraksi aktif ekstrak daun kelor (Moringa oleifera).',
    notes: 'Kolom C18 baru dipasang, laju alir 1.0 mL/menit, elusi gradien.',
    status: 'Sedang Digunakan'
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'NOT-001',
    equipmentId: 'EQ-002',
    title: 'Masa Berlaku Kalibrasi Habis!',
    message: 'Alat "Timbangan Analitik Mettler Toledo" (EQ-002) telah melewati tanggal batas kalibrasi (2026-07-10). Segera lakukan kalibrasi ulang untuk menjamin validitas hasil ukur.',
    type: 'danger',
    date: '2026-07-10 08:00',
    isRead: false
  },
  {
    id: 'NOT-002',
    equipmentId: 'EQ-001',
    title: 'Peringatan Kalibrasi Mendekati Batas Akhir',
    message: 'Alat "Spektrofotometer UV-Vis Shimadzu" (EQ-001) akan kadaluarsa besok pada tanggal 2026-07-15. Harap koordinasikan jadwal dengan teknisi kalibrasi eksternal.',
    type: 'warning',
    date: '2026-07-13 08:00',
    isRead: false
  },
  {
    id: 'NOT-003',
    equipmentId: 'EQ-005',
    title: 'Pengingat Kalibrasi Alat',
    message: 'Alat "HPLC Agilent Technologies" (EQ-005) memiliki sisa masa aktif kalibrasi kurang dari 20 hari (kadaluarsa 2026-08-01).',
    type: 'info',
    date: '2026-07-12 12:00',
    isRead: true
  }
];
