/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Plus, 
  SlidersHorizontal, 
  X, 
  QrCode, 
  Calendar, 
  MapPin, 
  User, 
  Mail, 
  FileText, 
  FileUp, 
  Wrench, 
  Trash2, 
  Check, 
  Printer, 
  AlertTriangle, 
  Activity,
  ChevronRight,
  ExternalLink,
  LayoutGrid,
  List,
  Pencil,
  FileSpreadsheet,
  Download,
  Upload,
  Settings,
  Tag
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { TODAY_STR } from '../mockData';
import { Equipment, MaintenanceRecord, UsageLog, MaintenanceType, CalibrationStatus } from '../types';
import { formatDateIndo, determineStatus, generateMockCertificateHtml, getDaysRemaining } from '../utils/helpers';

interface EquipmentViewProps {
  equipmentList: Equipment[];
  maintenanceRecords: MaintenanceRecord[];
  usageLogs: UsageLog[];
  selectedEquipmentId: string | null;
  onSelectEquipment: (id: string | null) => void;
  onAddEquipment: (newEq: Omit<Equipment, 'id' | 'status' | 'createdAt'>) => void;
  onAddEquipmentBatch?: (newEqs: Omit<Equipment, 'id' | 'status' | 'createdAt'>[]) => void;
  onUpdateEquipment: (id: string, updatedEq: Omit<Equipment, 'id' | 'status' | 'createdAt'> & { status?: CalibrationStatus }) => void;
  onDeleteEquipment: (id: string) => void;
  onAddMaintenance: (record: Omit<MaintenanceRecord, 'id' | 'equipmentName'>) => void;
  onUploadCertificate: (id: string, name: string, base64: string) => void;
}

export default function EquipmentView({
  equipmentList,
  maintenanceRecords,
  usageLogs,
  selectedEquipmentId,
  onSelectEquipment,
  onAddEquipment,
  onAddEquipmentBatch,
  onUpdateEquipment,
  onDeleteEquipment,
  onAddMaintenance,
  onUploadCertificate,
}: EquipmentViewProps) {
  // State for search and filter
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // State for forms
  const [showAddModal, setShowAddModal] = useState(false);
  const [regMode, setRegMode] = useState<'manual' | 'excel'>('manual');
  const [excelSuccessMessage, setExcelSuccessMessage] = useState<string | null>(null);
  const [showAddMaintModal, setShowAddMaintModal] = useState(false);
  const [showCertViewer, setShowCertViewer] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Form input states (New Equipment)
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Spektrofotometer');
  const [newModel, setNewModel] = useState('');
  const [newSerialNumber, setNewSerialNumber] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newPIC, setNewPIC] = useState('');
  const [newPICEmail, setNewPICEmail] = useState('');
  const [newInterval, setNewInterval] = useState(12);
  const [newLastCalibDate, setNewLastCalibDate] = useState('2026-01-01');
  const [newDescription, setNewDescription] = useState('');
  const [newInventoryNumber, setNewInventoryNumber] = useState('');
  const [newCalibrationPoints, setNewCalibrationPoints] = useState('');

  // Form input states (New Maintenance)
  const [maintType, setMaintType] = useState<MaintenanceType>('Pengecekan Rutin');
  const [maintOperator, setMaintOperator] = useState('');
  const [maintNotes, setMaintNotes] = useState('');
  const [maintStatus, setMaintStatus] = useState<'Selesai' | 'Dalam Proses' | 'Butuh Tindak Lanjut'>('Selesai');
  const [maintDate, setMaintDate] = useState('2026-07-14');

  // Form input states (Edit Equipment)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('Spektrofotometer');
  const [editModel, setEditModel] = useState('');
  const [editSerialNumber, setEditSerialNumber] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editPIC, setEditPIC] = useState('');
  const [editPICEmail, setEditPICEmail] = useState('');
  const [editInterval, setEditInterval] = useState(12);
  const [editLastCalibDate, setEditLastCalibDate] = useState('2026-01-01');
  const [editDescription, setEditDescription] = useState('');
  const [editInventoryNumber, setEditInventoryNumber] = useState('');
  const [editCalibrationPoints, setEditCalibrationPoints] = useState('');
  const [editStatus, setEditStatus] = useState<CalibrationStatus>('valid');

  // States for dynamic/custom categories
  const [newCategoryCustom, setNewCategoryCustom] = useState('');
  const [editCategoryCustom, setEditCategoryCustom] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('lab_custom_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return ['pH Meter', 'Spektrofotometer', 'Timbangan', 'Pipet', 'Kromatografi', 'Sterilisasi', 'Lainnya'];
  });

  React.useEffect(() => {
    localStorage.setItem('lab_custom_categories', JSON.stringify(customCategories));
  }, [customCategories]);

  const handleStartEdit = (eq: Equipment) => {
    setEditName(eq.name);
    setEditCategory(eq.category);
    setEditCategoryCustom('');
    setEditModel(eq.model);
    setEditSerialNumber(eq.serialNumber);
    setEditLocation(eq.location);
    setEditPIC(eq.responsiblePerson);
    setEditPICEmail(eq.responsibleEmail);
    setEditInterval(eq.calibrationInterval);
    setEditLastCalibDate(eq.lastCalibrationDate);
    setEditDescription(eq.description);
    setEditInventoryNumber(eq.inventoryNumber || '');
    setEditCalibrationPoints(eq.calibrationPoints || '');
    setEditStatus(eq.status);
    setShowEditModal(true);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get active selected equipment
  const activeEq = equipmentList.find(e => e.id === selectedEquipmentId);

  // Get specific logs & records for active equipment
  const eqMaintenance = maintenanceRecords.filter(r => r.equipmentId === selectedEquipmentId);
  const eqUsage = usageLogs.filter(l => l.equipmentId === selectedEquipmentId);

  // Unique categories list for filters & options
  const allKnownCategories = Array.from(new Set([
    ...customCategories,
    ...equipmentList.map(e => e.category)
  ])).filter(Boolean);

  const categories = ['All', ...allKnownCategories];

  const handleCreateCategory = (catName: string) => {
    const trimmed = catName.trim();
    if (!trimmed) return;
    setCategoryError(null);
    if (customCategories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setCategoryError('Kategori ini sudah ada!');
      return;
    }
    setCustomCategories([...customCategories, trimmed]);
  };

  const handleDeleteCategory = (catToDelete: string) => {
    setCategoryError(null);
    if (catToDelete === 'Lainnya') {
      setCategoryError('Kategori "Lainnya" adalah kategori sistem default dan tidak dapat dihapus.');
      return;
    }
    setCategoryToDelete(catToDelete);
  };

  const executeDeleteCategory = (catToDelete: string) => {
    // 1. Remove from customCategories list
    const updated = customCategories.filter(c => c !== catToDelete);
    setCustomCategories(updated);
    
    // 2. Update any equipment currently using this category to "Lainnya"
    equipmentList.forEach(eq => {
      if (eq.category === catToDelete) {
        onUpdateEquipment(eq.id, {
          name: eq.name,
          category: 'Lainnya',
          model: eq.model,
          serialNumber: eq.serialNumber,
          location: eq.location,
          responsiblePerson: eq.responsiblePerson,
          responsibleEmail: eq.responsibleEmail,
          calibrationInterval: eq.calibrationInterval,
          lastCalibrationDate: eq.lastCalibrationDate,
          nextCalibrationDate: eq.nextCalibrationDate,
          description: eq.description,
          inventoryNumber: eq.inventoryNumber,
          calibrationPoints: eq.calibrationPoints,
          certificateName: eq.certificateName,
          certificateData: eq.certificateData,
          certificateUploadDate: eq.certificateUploadDate,
        });
      }
    });
  };

  const downloadExcelTemplate = () => {
    const headers = [
      'Nama Alat *',
      'Kategori *',
      'Tipe/Model *',
      'Nomor Seri *',
      'Lokasi *',
      'Penanggung Jawab *',
      'Email Penanggung Jawab *',
      'Interval Kalibrasi (Bulan) *',
      'Tanggal Kalibrasi Terakhir (YYYY-MM-DD) *',
      'No. Inventaris',
      'Titik Kalibrasi (Pisahkan dengan koma)',
      'Deskripsi Alat'
    ];

    const sampleData = [
      [
        'Timbangan Analitik Mettler Toledo',
        'Timbangan',
        'XS204',
        'MT-XS204-90123',
        'Laboratorium Formulasi',
        'Siti Rahma, S.Si.',
        'siti.rahma@lab.id',
        '12',
        '2025-07-10',
        'INV/2026/002',
        '50 g, 100 g, 150 g, 200 g',
        'Timbangan analitik tingkat ketelitian tinggi hingga 0.1 mg untuk formulasi sampel sensitif.'
      ],
      [
        'pH Meter Digital Ohaus',
        'pH Meter',
        'Starter 3100',
        'OH-ST31-44512',
        'Laboratorium Biokimia',
        'Budi Santoso, M.Sc.',
        'budi.santoso@lab.id',
        '3',
        '2026-06-10',
        'INV/2025/003',
        'pH 4.01, pH 7.00, pH 10.01',
        'Alat ukur derajat keasaman larutan sampel biologis dengan kompensasi suhu otomatis.'
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    ws['!cols'] = [
      { wch: 35 }, // Nama Alat
      { wch: 15 }, // Kategori
      { wch: 15 }, // Tipe/Model
      { wch: 18 }, // Nomor Seri
      { wch: 25 }, // Lokasi
      { wch: 20 }, // Penanggung Jawab
      { wch: 25 }, // Email Penanggung Jawab
      { wch: 25 }, // Interval Kalibrasi (Bulan)
      { wch: 35 }, // Tanggal Kalibrasi Terakhir (YYYY-MM-DD)
      { wch: 18 }, // No. Inventaris
      { wch: 35 }, // Titik Kalibrasi
      { wch: 40 }  // Deskripsi Alat
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Registrasi Alat');
    XLSX.writeFile(wb, 'Template_Registrasi_Alat.xlsx');
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processExcelFile(file);
  };

  const handleExcelDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processExcelFile(file);
  };

  const processExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        
        if (rows.length <= 1) {
          setFormError('File Excel kosong atau hanya berisi header.');
          return;
        }

        const parsedEquipments: Omit<Equipment, 'id' | 'status' | 'createdAt'>[] = [];
        const importErrors: string[] = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i] as any[];
          if (!row || row.length === 0 || row.every(val => val === undefined || val === null || val === '')) {
            continue;
          }

          const name = row[0]?.toString().trim() || '';
          const category = row[1]?.toString().trim() || 'Lain-lain';
          const model = row[2]?.toString().trim() || '';
          const serialNumber = row[3]?.toString().trim() || '';
          const location = row[4]?.toString().trim() || '';
          const responsiblePerson = row[5]?.toString().trim() || '';
          const responsibleEmail = row[6]?.toString().trim() || '';
          const intervalRaw = row[7];
          const lastCalibDateRaw = row[8];
          const inventoryNumber = row[9]?.toString().trim() || '';
          const calibrationPoints = row[10]?.toString().trim() || '';
          const description = row[11]?.toString().trim() || '';

          const rowNum = i + 1;
          if (!name) {
            importErrors.push(`Baris ${rowNum}: Nama Alat kosong.`);
            continue;
          }
          if (!model) {
            importErrors.push(`Baris ${rowNum}: Tipe/Model kosong.`);
            continue;
          }
          if (!serialNumber) {
            importErrors.push(`Baris ${rowNum}: Nomor Seri kosong.`);
            continue;
          }

          let calibrationInterval = parseInt(intervalRaw, 10);
          if (isNaN(calibrationInterval) || calibrationInterval <= 0) {
            calibrationInterval = 12;
          }

          let lastCalibrationDate = '';
          if (lastCalibDateRaw) {
            if (typeof lastCalibDateRaw === 'number') {
              const dateObj = XLSX.SSF.parse_date_code(lastCalibDateRaw);
              const y = dateObj.y;
              const m = String(dateObj.m).padStart(2, '0');
              const d = String(dateObj.d).padStart(2, '0');
              lastCalibrationDate = `${y}-${m}-${d}`;
            } else {
              const dateStr = lastCalibDateRaw.toString().trim();
              const matchYmd = dateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
              if (matchYmd) {
                lastCalibrationDate = `${matchYmd[1]}-${String(matchYmd[2]).padStart(2, '0')}-${String(matchYmd[3]).padStart(2, '0')}`;
              } else {
                const dateObj = new Date(dateStr);
                if (!isNaN(dateObj.getTime())) {
                  const y = dateObj.getFullYear();
                  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
                  const d = String(dateObj.getDate()).padStart(2, '0');
                  lastCalibrationDate = `${y}-${m}-${d}`;
                } else {
                  importErrors.push(`Baris ${rowNum}: Format Tanggal Kalibrasi Terakhir "${dateStr}" tidak valid (gunakan YYYY-MM-DD).`);
                  continue;
                }
              }
            }
          } else {
            lastCalibrationDate = TODAY_STR;
          }

          const lastDate = new Date(lastCalibrationDate);
          if (isNaN(lastDate.getTime())) {
            importErrors.push(`Baris ${rowNum}: Tanggal Kalibrasi Terakhir tidak valid.`);
            continue;
          }
          lastDate.setMonth(lastDate.getMonth() + calibrationInterval);
          const nextCalibrationDate = lastDate.toISOString().split('T')[0];

          parsedEquipments.push({
            name,
            category,
            model,
            serialNumber,
            location: location || 'Laboratorium Utama',
            responsiblePerson: responsiblePerson || 'Staff Laboratorium',
            responsibleEmail: responsibleEmail || 'admin@lab.id',
            calibrationInterval,
            lastCalibrationDate,
            nextCalibrationDate,
            description: description || 'Alat diimport secara massal.',
            certificateName: null,
            certificateData: null,
            certificateUploadDate: null,
            inventoryNumber,
            calibrationPoints
          });
        }

        if (importErrors.length > 0) {
          setFormError(`Gagal mengimpor karena terdapat kesalahan:\n` + importErrors.slice(0, 5).join('\n') + (importErrors.length > 5 ? `\n...dan ${importErrors.length - 5} kesalahan lainnya.` : ''));
          return;
        }

        if (parsedEquipments.length === 0) {
          setFormError('Tidak ada data alat valid yang dapat diimpor.');
          return;
        }

        if (onAddEquipmentBatch) {
          onAddEquipmentBatch(parsedEquipments);
          setExcelSuccessMessage(`Berhasil mengimpor ${parsedEquipments.length} alat sampling baru secara massal! 🎉`);
          setTimeout(() => {
            setExcelSuccessMessage(null);
            setShowAddModal(false);
            setRegMode('manual');
          }, 3000);
        } else {
          parsedEquipments.forEach(eq => onAddEquipment(eq));
          setExcelSuccessMessage(`Berhasil mengimpor ${parsedEquipments.length} alat sampling baru! 🎉`);
          setTimeout(() => {
            setExcelSuccessMessage(null);
            setShowAddModal(false);
            setRegMode('manual');
          }, 3000);
        }

      } catch (err) {
        console.error(err);
        setFormError('Gagal membaca file Excel. Pastikan file dalam format xlsx atau xls yang valid.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Filter list
  const filteredList = equipmentList.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.responsiblePerson.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handle Equipment Submit
  const handleAddEqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newModel || !newSerialNumber) {
      setFormError('Mohon isi nama, tipe model, dan nomor seri alat!');
      return;
    }

    const finalCategory = newCategory === 'CUSTOM' ? newCategoryCustom.trim() : newCategory;
    if (!finalCategory) {
      setFormError('Mohon isi atau pilih kategori alat!');
      return;
    }

    setFormError(null);

    // Calculate next calibration date automatically
    const lastDate = new Date(newLastCalibDate);
    lastDate.setMonth(lastDate.getMonth() + Number(newInterval));
    const nextCalibStr = lastDate.toISOString().split('T')[0];

    onAddEquipment({
      name: newName,
      category: finalCategory,
      model: newModel,
      serialNumber: newSerialNumber,
      location: newLocation || 'Laboratorium Pusat',
      responsiblePerson: newPIC || 'Petugas Laboratorium',
      responsibleEmail: newPICEmail || 'lab@lab.id',
      calibrationInterval: Number(newInterval),
      lastCalibrationDate: newLastCalibDate,
      nextCalibrationDate: nextCalibStr,
      certificateName: uploadedFile ? uploadedFile.name : null,
      certificateData: uploadedFile ? 'MOCK_UPLOADED_DATA' : null,
      certificateUploadDate: uploadedFile ? '2026-07-14' : null,
      description: newDescription,
      inventoryNumber: newInventoryNumber || `INV/${newLastCalibDate.split('-')[0] || '2026'}/${newSerialNumber.slice(-3).toUpperCase() || 'NEW'}`,
      calibrationPoints: newCalibrationPoints || 'Default Setpoint',
    });

    // Reset inputs
    setNewName('');
    setNewCategory('pH Meter');
    setNewCategoryCustom('');
    setNewModel('');
    setNewSerialNumber('');
    setNewLocation('');
    setNewPIC('');
    setNewPICEmail('');
    setNewDescription('');
    setNewInventoryNumber('');
    setNewCalibrationPoints('');
    setUploadedFile(null);
    setFormError(null);
    setShowAddModal(false);
  };

  // Handle Edit Equipment Submit
  const handleEditEqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEq) return;
    if (!editName || !editModel || !editSerialNumber) {
      setFormError('Mohon isi nama, tipe model, dan nomor seri alat!');
      return;
    }

    const finalCategory = editCategory === 'CUSTOM' ? editCategoryCustom.trim() : editCategory;
    if (!finalCategory) {
      setFormError('Mohon isi atau pilih kategori alat!');
      return;
    }

    setFormError(null);

    // Calculate next calibration date automatically
    const lastDate = new Date(editLastCalibDate);
    lastDate.setMonth(lastDate.getMonth() + Number(editInterval));
    const nextCalibStr = lastDate.toISOString().split('T')[0];

    onUpdateEquipment(activeEq.id, {
      name: editName,
      category: finalCategory,
      model: editModel,
      serialNumber: editSerialNumber,
      location: editLocation || 'Laboratorium Pusat',
      responsiblePerson: editPIC || 'Petugas Laboratorium',
      responsibleEmail: editPICEmail || 'lab@lab.id',
      calibrationInterval: Number(editInterval),
      lastCalibrationDate: editLastCalibDate,
      nextCalibrationDate: nextCalibStr,
      description: editDescription,
      inventoryNumber: editInventoryNumber,
      calibrationPoints: editCalibrationPoints,
      certificateName: activeEq.certificateName,
      certificateData: activeEq.certificateData,
      certificateUploadDate: activeEq.certificateUploadDate,
      status: editStatus,
    });

    setFormError(null);
    setEditCategoryCustom('');
    setShowEditModal(false);
  };

  // Handle Maintenance Submit
  const handleAddMaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipmentId || !maintOperator || !maintNotes) {
      setFormError('Mohon isi nama operator dan catatan pemeliharaan!');
      return;
    }
    setFormError(null);

    onAddMaintenance({
      equipmentId: selectedEquipmentId,
      date: maintDate,
      type: maintType,
      operator: maintOperator,
      notes: maintNotes,
      status: maintStatus,
    });

    setMaintOperator('');
    setMaintNotes('');
    setMaintStatus('Selesai');
    setFormError(null);
    setShowAddMaintModal(false);
  };

  // Handle Certificate Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeEq) {
      // Trigger update
      onUploadCertificate(activeEq.id, file.name, 'MOCK_UPLOADED_BASE64_STRING');
    }
  };

  // Print Labels Function
  const handlePrintLabel = (eq: Equipment) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const qrDataUrl = `${window.location.origin}${window.location.pathname}?eqId=${eq.id}`;
      printWindow.document.write(`
        <html>
          <head>
            <title>Label QR - ${eq.id}</title>
            <style>
              body { font-family: 'Courier New', Courier, monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #fff; }
              .label-card { border: 2px solid #000; padding: 20px; width: 320px; text-align: center; border-radius: 8px; box-shadow: none; }
              .header { font-size: 16px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 5px; }
              .qr-img { width: 150px; height: 150px; margin: 15px auto; display: block; }
              .id-code { font-size: 18px; font-weight: bold; background: #000; color: #fff; padding: 3px 8px; display: inline-block; margin-bottom: 10px; }
              .details { font-size: 11px; text-align: left; line-height: 1.4; margin-top: 10px; border-top: 1px dashed #000; padding-top: 8px; }
            </style>
          </head>
          <body onload="window.print()">
            <div class="label-card">
              <div class="header">LAB UTAMA SAMPLING</div>
              <img class="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrDataUrl)}" alt="QR Code" />
              <div class="id-code">${eq.id}</div>
              <div class="details">
                <strong>Alat:</strong> ${eq.name}<br/>
                ${eq.inventoryNumber ? `<strong>No. Inv:</strong> ${eq.inventoryNumber}<br/>` : ''}
                ${eq.calibrationPoints ? `<strong>Titik Kalib:</strong> ${eq.calibrationPoints}<br/>` : ''}
                <strong>Model:</strong> ${eq.model}<br/>
                <strong>S/N:</strong> ${eq.serialNumber}<br/>
                <strong>PIC:</strong> ${eq.responsiblePerson}
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Print official calibration certificate HTML simulation
  const handlePrintCertificate = () => {
    if (!activeEq) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Sertifikat Kalibrasi - ${activeEq.id}</title>
            <style>
              body { background-color: #f8fafc; padding: 40px; margin: 0; }
              @media print {
                body { background-color: #fff; padding: 0; }
              }
            </style>
          </head>
          <body onload="window.print()">
            ${generateMockCertificateHtml(activeEq, `SK-LAB-${activeEq.id}-2026`)}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
        
        {/* Left: Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari alat (Nama, ID, S/N, atau PIC)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/* Filters and Add Button */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Category Filter */}
          <div className="flex items-center gap-1">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">Semua Kategori</option>
              {categories.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="px-2 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 hover:bg-slate-100 font-medium text-slate-500 hover:text-slate-800 transition flex items-center gap-1 cursor-pointer"
              title="Kelola Kategori"
            >
              <Tag size={12} />
              <span>Kelola</span>
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">Semua Status</option>
            <option value="valid">✅ Valid</option>
            <option value="warning">⚠️ Warning</option>
            <option value="expired">❌ Kadaluarsa</option>
            <option value="calibrating">⚙️ Sedang Kalibrasi</option>
            <option value="maintenance">🛠️ Maintenance</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/40">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition cursor-pointer ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Tampilan Grid"
              type="button"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition cursor-pointer ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Tampilan List"
              type="button"
            >
              <List size={15} />
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
          >
            <Plus size={16} />
            <span>Registrasi Alat</span>
          </button>
        </div>
      </div>

      {/* Main View Area (Grid vs List) */}
      {filteredList.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-dashed border-slate-200 shadow-xs">
          <SlidersHorizontal className="mx-auto text-slate-300 mb-3" size={32} />
          <p className="text-slate-500 font-medium text-sm">Tidak ada alat sampling yang sesuai kriteria pencarian.</p>
          <button 
            onClick={() => { setSearch(''); setCategoryFilter('All'); setStatusFilter('All'); }} 
            className="text-xs text-indigo-600 font-semibold mt-2 hover:underline cursor-pointer"
          >
            Reset Filter Pencarian
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((item) => {
            let statusBadge = '';
            let statusText = '';
            let borderClass = 'border-slate-100 hover:border-indigo-100';

            switch (item.status) {
              case 'valid':
                statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                statusText = 'Kalibrasi Valid';
                break;
              case 'warning':
                statusBadge = 'bg-amber-50 text-amber-700 border-amber-100';
                statusText = 'Butuh Kalibrasi';
                borderClass = 'border-amber-200 shadow-sm shadow-amber-50';
                break;
              case 'expired':
                statusBadge = 'bg-rose-50 text-rose-700 border-rose-100';
                statusText = 'Kadaluarsa';
                borderClass = 'border-rose-200 shadow-sm shadow-rose-50';
                break;
              case 'calibrating':
                statusBadge = 'bg-blue-50 text-blue-700 border-blue-100';
                statusText = 'Uji Kalibrasi';
                break;
              case 'maintenance':
                statusBadge = 'bg-purple-50 text-purple-700 border-purple-100';
                statusText = 'Maintenance';
                borderClass = 'border-purple-200 shadow-sm shadow-purple-50';
                break;
            }

            const daysLeft = getDaysRemaining(item.nextCalibrationDate);

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                whileHover={{ y: -5, scale: 1.015, boxShadow: '0 12px 24px -10px rgba(0, 0, 0, 0.08)' }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                onClick={() => onSelectEquipment(item.id)}
                className={`bg-white rounded-xl border p-5 cursor-pointer transition flex flex-col justify-between hover:shadow-md ${borderClass}`}
              >
                <div>
                  {/* Header info */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">
                      {item.category}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                      {statusText}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-800 mt-2.5 line-clamp-2">{item.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mt-1">
                    <span>ID: <span className="font-mono font-medium text-slate-700">{item.id}</span></span>
                    {item.inventoryNumber && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span>No. Inv: <span className="font-mono font-semibold text-indigo-600">{item.inventoryNumber}</span></span>
                      </>
                    )}
                  </div>

                  {/* Specs */}
                  <div className="mt-4 space-y-2 border-t border-slate-50 pt-3">
                    <div className="flex items-center text-xs text-slate-500">
                      <MapPin size={14} className="mr-1.5 text-slate-400" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-500">
                      <Calendar size={14} className="mr-1.5 text-slate-400" />
                      <span>Batas: {formatDateIndo(item.nextCalibrationDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer status text */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center">
                    <User size={12} className="mr-1" />
                    {item.responsiblePerson}
                  </span>
                  {item.status !== 'calibrating' && item.status !== 'maintenance' && (
                    <span className={`text-[10px] font-bold ${daysLeft < 0 ? 'text-rose-600' : daysLeft <= 30 ? 'text-amber-600' : 'text-slate-400'}`}>
                      {daysLeft < 0 ? 'Kritis!' : `${daysLeft} hari lagi`}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5">Nama Alat / ID</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Lokasi</th>
                  <th className="py-3.5 px-4">PIC</th>
                  <th className="py-3.5 px-4">Batas Kalibrasi</th>
                  <th className="py-3.5 px-5 text-right">Status / Sisa Hari</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {filteredList.map((item) => {
                  let statusBadge = '';
                  let statusText = '';

                  switch (item.status) {
                    case 'valid':
                      statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                      statusText = 'Kalibrasi Valid';
                      break;
                    case 'warning':
                      statusBadge = 'bg-amber-50 text-amber-700 border-amber-100';
                      statusText = 'Butuh Kalibrasi';
                      break;
                    case 'expired':
                      statusBadge = 'bg-rose-50 text-rose-700 border-rose-100';
                      statusText = 'Kadaluarsa';
                      break;
                    case 'calibrating':
                      statusBadge = 'bg-blue-50 text-blue-700 border-blue-100';
                      statusText = 'Uji Kalibrasi';
                      break;
                    case 'maintenance':
                      statusBadge = 'bg-purple-50 text-purple-700 border-purple-100';
                      statusText = 'Maintenance';
                      break;
                  }

                  const daysLeft = getDaysRemaining(item.nextCalibrationDate);

                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => onSelectEquipment(item.id)}
                      className="hover:bg-slate-50/80 cursor-pointer transition text-sm group"
                    >
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-800 group-hover:text-indigo-600 transition line-clamp-1">{item.name}</div>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                          <span>ID: <span className="font-mono font-medium text-slate-600">{item.id}</span></span>
                          {item.inventoryNumber && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span>No. Inv: <span className="font-mono font-semibold text-indigo-600/90">{item.inventoryNumber}</span></span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded uppercase">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        <div className="flex items-center text-xs">
                          <MapPin size={13} className="mr-1 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{item.location}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        <div className="flex items-center text-xs">
                          <User size={13} className="mr-1 text-slate-400 shrink-0" />
                          <span>{item.responsiblePerson}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        <div className="flex items-center text-xs">
                          <Calendar size={13} className="mr-1 text-slate-400 shrink-0" />
                          <span>{formatDateIndo(item.nextCalibrationDate)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                            {statusText}
                          </span>
                          {item.status !== 'calibrating' && item.status !== 'maintenance' && (
                            <span className={`text-[10px] font-bold ${daysLeft < 0 ? 'text-rose-600' : daysLeft <= 30 ? 'text-amber-600' : 'text-slate-400'}`}>
                              {daysLeft < 0 ? 'Kritis!' : `${daysLeft} hari lagi`}
                            </span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Equipment Detail Modal (Overlay) */}
      <AnimatePresence>
        {activeEq && (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-end z-50 cursor-pointer"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onSelectEquipment(null);
              }
            }}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between overflow-hidden cursor-default"
            >
              {/* Detail Header */}
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">{activeEq.category}</span>
                  <h2 className="text-lg font-bold mt-0.5">{activeEq.name}</h2>
                  <p className="text-xs text-slate-400">ID Alat: <span className="font-mono">{activeEq.id}</span></p>
                </div>
                <button
                  onClick={() => onSelectEquipment(null)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg transition text-slate-300 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Detail Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Calibration Status Banner */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  activeEq.status === 'valid' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                  activeEq.status === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                  activeEq.status === 'expired' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                  activeEq.status === 'maintenance' ? 'bg-purple-50 border-purple-100 text-purple-800' :
                  'bg-blue-50 border-blue-100 text-blue-800'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      activeEq.status === 'maintenance' ? '' : 'animate-pulse'
                    } ${
                      activeEq.status === 'valid' ? 'bg-emerald-500' :
                      activeEq.status === 'warning' ? 'bg-amber-500' :
                      activeEq.status === 'expired' ? 'bg-rose-500' :
                      activeEq.status === 'maintenance' ? 'bg-purple-500' :
                      'bg-blue-500'
                    }`} />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider">
                        STATUS: {
                          activeEq.status === 'valid' ? 'KALIBRASI VALID' :
                          activeEq.status === 'warning' ? 'KALIBRASI SEGERA JATUH TEMPO' :
                          activeEq.status === 'expired' ? 'KALIBRASI KADALUARSA (STOP PENGGUNAAN)' :
                          activeEq.status === 'maintenance' ? 'DALAM PEMELIHARAAN (MAINTENANCE)' :
                          'SEDANG DALAM PROSES KALIBRASI'
                        }
                      </p>
                      <p className="text-[11px] opacity-80 mt-0.5">
                        {activeEq.status === 'expired' 
                          ? 'Dilarang keras memakai alat ini untuk keperluan sampling resmi.' 
                          : activeEq.status === 'maintenance'
                          ? 'Alat sedang dinonaktifkan sementara untuk pengerjaan perbaikan/perawatan.'
                          : `Sertifikat aktif hingga ${formatDateIndo(activeEq.nextCalibrationDate)}.`
                        }
                      </p>
                    </div>
                  </div>
                  
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-white border border-slate-200 shadow-xs">
                    {activeEq.status === 'maintenance'
                      ? 'Maint'
                      : activeEq.status === 'calibrating'
                      ? 'Calib'
                      : getDaysRemaining(activeEq.nextCalibrationDate) < 0 
                      ? 'Expired' 
                      : `${getDaysRemaining(activeEq.nextCalibrationDate)} Hari`
                    }
                  </span>
                </div>

                {/* Identity and Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Model / Seri</span>
                    <p className="text-sm font-semibold text-slate-800">{activeEq.model}</p>
                    <p className="text-xs text-slate-500 font-mono">S/N: {activeEq.serialNumber}</p>
                    {activeEq.inventoryNumber && (
                      <p className="text-xs text-indigo-600 font-bold mt-1">No. Inv: {activeEq.inventoryNumber}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Lokasi Lab</span>
                    <p className="text-sm font-semibold text-slate-800 flex items-center">
                      <MapPin size={14} className="mr-1 text-slate-400" />
                      {activeEq.location}
                    </p>
                  </div>
                  <div className="space-y-1 pt-3 border-t border-slate-200/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Penanggung Jawab Alat</span>
                    <p className="text-sm font-semibold text-slate-800 flex items-center">
                      <User size={14} className="mr-1 text-slate-400" />
                      {activeEq.responsiblePerson}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center">
                      <Mail size={12} className="mr-1 text-slate-400" />
                      {activeEq.responsibleEmail}
                    </p>
                  </div>
                  <div className="space-y-1 pt-3 border-t border-slate-200/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Interval Kalibrasi</span>
                    <p className="text-sm font-semibold text-slate-800 flex items-center">
                      <Calendar size={14} className="mr-1 text-slate-400" />
                      Setiap {activeEq.calibrationInterval} Bulan
                    </p>
                    <p className="text-xs text-slate-500">Terakhir: {formatDateIndo(activeEq.lastCalibrationDate)}</p>
                  </div>
                  <div className="col-span-1 sm:col-span-2 space-y-1 pt-3 border-t border-slate-200/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Titik Kalibrasi (Calibration Setpoints)</span>
                    <p className="text-xs font-semibold text-indigo-700 bg-indigo-50/50 px-3 py-2 rounded-lg border border-indigo-100/50 leading-relaxed">
                      {activeEq.calibrationPoints || 'Tidak ditentukan (Default setpoint)'}
                    </p>
                  </div>
                  <div className="col-span-1 sm:col-span-2 space-y-1 pt-3 border-t border-slate-200/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Deskripsi / Kegunaan</span>
                    <p className="text-xs text-slate-600 leading-relaxed">{activeEq.description || 'Tidak ada spesifikasi tambahan.'}</p>
                  </div>
                </div>

                {/* QR Code and Calibration Certificate Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* QR Card */}
                  <div className="border border-slate-200 p-5 rounded-xl flex flex-col justify-between items-center text-center bg-white shadow-xs">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Label QR Fisik Alat</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Tempelkan QR ini di badan alat untuk kemudahan scan status</p>
                    </div>
                    <div className="my-4 p-2 border border-slate-100 rounded-lg bg-slate-50">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${window.location.origin}${window.location.pathname}?eqId=${activeEq.id}`)}`}
                        alt="Equipment QR Code"
                        className="w-32 h-32"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          if (!img.dataset.errorTriggered) {
                            img.dataset.errorTriggered = 'true';
                            img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="10" fill="%2364748b">QR CODES CANNOT LOAD</text></svg>';
                          }
                        }}
                      />
                    </div>
                    <button
                      onClick={() => handlePrintLabel(activeEq)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer"
                    >
                      <Printer size={14} />
                      <span>Cetak Label QR</span>
                    </button>
                  </div>

                  {/* Calibration Certificate PDF Upload & View */}
                  <div className="border border-slate-200 p-5 rounded-xl flex flex-col justify-between bg-white shadow-xs">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Sertifikat Kalibrasi Resmi</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Upload dan simpan dokumen sertifikat hasil kalibrasi laboratorium</p>
                    </div>

                    {activeEq.certificateName ? (
                      <div className="my-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg space-y-2">
                        <div className="flex items-start space-x-2">
                          <FileText className="text-indigo-600 shrink-0 mt-0.5" size={18} />
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-indigo-950 truncate">{activeEq.certificateName}</p>
                            <p className="text-[10px] text-indigo-400">Diunggah: {activeEq.certificateUploadDate}</p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => setShowCertViewer(true)}
                            className="flex-1 bg-white hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold py-1.5 border border-indigo-200 rounded transition flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <ExternalLink size={12} />
                            <span>Buka Preview PDF</span>
                          </button>
                          <button
                            onClick={handlePrintCertificate}
                            className="p-1.5 bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded transition cursor-pointer"
                            title="Cetak Sertifikat Resmi"
                          >
                            <Printer size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="my-4 py-6 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center">
                        <FileUp className="text-slate-300 mb-1" size={24} />
                        <span className="text-[10px] text-slate-400">Belum ada sertifikat</span>
                      </div>
                    )}

                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".pdf"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold py-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer"
                      >
                        <FileUp size={14} />
                        <span>{activeEq.certificateName ? 'Unggah Ulang Sertifikat' : 'Unggah Sertifikat (PDF)'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Maintenance Log specific for this Equipment */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Riwayat Pemeliharaan & Kalibrasi</h3>
                    <button
                      onClick={() => setShowAddMaintModal(true)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Tambah Log Pemeliharaan</span>
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {eqMaintenance.map((record) => (
                      <div key={record.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-800 bg-slate-200/60 px-2 py-0.5 rounded">
                              {record.type}
                            </span>
                            <span className="text-[10px] text-slate-400">{formatDateIndo(record.date)}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            record.status === 'Selesai' ? 'bg-emerald-50 text-emerald-700' :
                            record.status === 'Dalam Proses' ? 'bg-blue-50 text-blue-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {record.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{record.notes}</p>
                        <p className="text-[10px] text-slate-400">Teknisi/Petugas: <span className="font-semibold">{record.operator}</span></p>
                      </div>
                    ))}

                    {eqMaintenance.length === 0 && (
                      <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                        Belum ada riwayat pemeliharaan terdaftar untuk alat ini.
                      </div>
                    )}
                  </div>
                </div>

                {/* Sesi Penggunaan specific for this Equipment */}
                <div className="space-y-3">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Riwayat Log Penggunaan Alat</h3>
                  </div>

                  <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                    {eqUsage.map((log) => (
                      <div key={log.id} className="p-3 bg-white border border-slate-100 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{log.purpose}</p>
                          <p className="text-[10px] text-slate-400">Operator: {log.operator} • Tgl: {formatDateIndo(log.startDate)}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            log.status === 'Selesai' ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-700 animate-pulse'
                          }`}>
                            {log.status}
                          </span>
                          <p className="text-[9px] text-slate-400 mt-1">{log.startTime} WIB {log.endTime ? `- ${log.endTime} WIB` : ''}</p>
                        </div>
                      </div>
                    ))}

                    {eqUsage.length === 0 && (
                      <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                        Belum ada riwayat aktivitas pemakaian untuk alat ini.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Detail Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleStartEdit(activeEq)}
                    className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition cursor-pointer border border-indigo-200/50"
                  >
                    <Pencil size={14} />
                    <span>Ubah Spesifikasi</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-3 py-2 text-rose-600 hover:text-rose-800 text-xs font-bold hover:bg-rose-50 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Trash2 size={15} />
                    <span>Hapus Alat</span>
                  </button>
                </div>
                <button
                  onClick={() => onSelectEquipment(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Tutup Panel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && activeEq && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[110] p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in duration-200"
            >
              <div className="p-5 bg-rose-50 text-rose-950 flex items-center space-x-3 border-b border-rose-100">
                <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                  <Trash2 size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Konfirmasi Hapus Alat</h3>
                  <p className="text-[11px] text-rose-700/80">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Apakah Anda yakin ingin menghapus data alat <strong className="text-slate-800 font-semibold">{activeEq.name}</strong> (ID: {activeEq.id}) beserta seluruh riwayat aktivitas pemakaian, pemeliharaan, dan sertifikat yang terkait?
                </p>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-[11px] text-slate-500">
                  ⚠️ Seluruh data logbooks dan sertifikat PDF digital akan dihapus secara permanen dari sistem ini.
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteEquipment(activeEq.id);
                    setShowDeleteConfirm(false);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-xs"
                >
                  Ya, Hapus Permanen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Official Certificate Simulated PDF Viewer (Overlay Modal) */}
      <AnimatePresence>
        {showCertViewer && activeEq && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center z-[100] p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 bg-indigo-900 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText size={18} />
                  <span className="text-sm font-bold">Dokumen Digital Sertifikat Kalibrasi</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrintCertificate}
                    className="p-1.5 hover:bg-indigo-800 rounded transition text-white flex items-center space-x-1 text-xs cursor-pointer"
                  >
                    <Printer size={16} />
                    <span className="hidden sm:inline">Cetak Dokumen</span>
                  </button>
                  <button
                    onClick={() => setShowCertViewer(false)}
                    className="p-1.5 hover:bg-indigo-800 rounded transition text-slate-300 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Simulated Certificate Display */}
              <div className="p-6 overflow-y-auto bg-slate-100 flex-1 flex justify-center">
                <div 
                  className="shadow-md bg-white p-8 w-full max-w-[800px] border border-slate-200 rounded"
                  dangerouslySetInnerHTML={{ __html: generateMockCertificateHtml(activeEq, `SK-LAB-${activeEq.id}-2026`) }}
                />
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setShowCertViewer(false)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Selesai Membaca
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add New Equipment Modal (Overlay) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-5 bg-indigo-950 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Registrasi Alat Sampling Baru</h2>
                  <p className="text-xs text-slate-400">Daftarkan dan jadwalkan kalibrasi instrumen laboratorium</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormError(null);
                  }}
                  className="p-1.5 hover:bg-indigo-900 rounded-lg transition text-slate-300 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex border-b border-slate-100 bg-slate-50">
                <button
                  type="button"
                  onClick={() => { setRegMode('manual'); setFormError(null); }}
                  className={`flex-1 py-3 text-center text-xs font-bold transition cursor-pointer border-b-2 ${regMode === 'manual' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  Form Input Manual
                </button>
                <button
                  type="button"
                  onClick={() => { setRegMode('excel'); setFormError(null); }}
                  className={`flex-1 py-3 text-center text-xs font-bold transition cursor-pointer border-b-2 ${regMode === 'excel' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  Import Excel Massal (.xlsx)
                </button>
              </div>

              {regMode === 'manual' ? (
                <form onSubmit={handleAddEqSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                  {formError && (
                    <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold animate-in fade-in duration-200">
                      {formError}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-700">Nama Alat Sampling *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., pH Meter Digital Ohaus, Mikropipet 100uL"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Kategori Alat</label>
                      <select
                        value={newCategory}
                        onChange={(e) => {
                          setNewCategory(e.target.value);
                          if (e.target.value !== 'CUSTOM') {
                            setNewCategoryCustom('');
                          }
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        {allKnownCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="CUSTOM">+ Tambah Kategori Baru...</option>
                      </select>
                    </div>

                    {newCategory === 'CUSTOM' && (
                      <div className="col-span-2 space-y-1 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/60 animate-in fade-in duration-200">
                        <label className="text-xs font-bold text-indigo-700 flex items-center">
                          <Plus size={14} className="mr-1" /> Tulis Kategori Kustom Baru *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Oven, Mikroskop, Desikator"
                          value={newCategoryCustom}
                          onChange={(e) => setNewCategoryCustom(e.target.value)}
                          className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Merek & Tipe Model *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Starter 3100"
                        value={newModel}
                        onChange={(e) => setNewModel(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Nomor Seri Fisik (S/N) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., SN-84920"
                        value={newSerialNumber}
                        onChange={(e) => setNewSerialNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">No. Inventaris Alat *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., INV/2026/007"
                        value={newInventoryNumber}
                        onChange={(e) => setNewInventoryNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Titik Kalibrasi *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., pH 4.01, 7.00, 10.01 atau 100g, 500g"
                        value={newCalibrationPoints}
                        onChange={(e) => setNewCalibrationPoints(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Lokasi Penyimpanan</label>
                      <input
                        type="text"
                        placeholder="e.g., Lab Mikrobiologi"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Nama Penanggung Jawab (PJ) *</label>
                      <input
                        type="text"
                        placeholder="e.g., Siti Rahma, S.Si."
                        value={newPIC}
                        onChange={(e) => setNewPIC(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Email Penanggung Jawab *</label>
                      <input
                        type="email"
                        placeholder="e.g., siti@lab.id"
                        value={newPICEmail}
                        onChange={(e) => setNewPICEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Interval Kalibrasi (Bulan)</label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={newInterval}
                        onChange={(e) => setNewInterval(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Tanggal Kalibrasi Terakhir</label>
                      <input
                        type="date"
                        value={newLastCalibDate}
                        onChange={(e) => setNewLastCalibDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Keterangan / Deskripsi Alat</label>
                    <textarea
                      rows={2}
                      placeholder="Tuliskan spesifikasi detail alat atau kegunaan spesifik di lab..."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Simulated Certificate Attachment */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Lampirkan Sertifikat Kalibrasi Awal (Opsional)</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                        className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 text-slate-500"
                      />
                    </div>
                    {uploadedFile && (
                      <p className="text-[10px] text-emerald-600 font-semibold flex items-center">
                        <Check size={12} className="mr-1" /> File "{uploadedFile.name}" terlampir.
                      </p>
                    )}
                  </div>

                  <div className="pt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setFormError(null);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
                    >
                      Simpan Registrasi Alat
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4 flex-1">
                    {formError && (
                      <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold animate-in fade-in duration-200 whitespace-pre-line">
                        {formError}
                      </div>
                    )}

                    {excelSuccessMessage && (
                      <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-200">
                        <span className="text-base">🎉</span>
                        <span>{excelSuccessMessage}</span>
                      </div>
                    )}

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-[11px] text-amber-900 leading-relaxed space-y-1.5">
                      <p className="font-bold flex items-center text-xs">
                        <FileSpreadsheet className="mr-1.5 text-amber-600 animate-bounce" size={16} />
                        Petunjuk Import Excel Massal (Lebih dari 1000 data):
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px]">
                        <li>Unduh template Excel resmi di bawah ini terlebih dahulu agar struktur kolom sesuai.</li>
                        <li>Kolom dengan tanda bintang (<strong className="text-rose-600">*</strong>) wajib diisi lengkap.</li>
                        <li>Tanggal kalibrasi terakhir diisi dengan format <strong className="text-slate-900 font-semibold">YYYY-MM-DD</strong> (misal: 2026-01-15).</li>
                        <li>Sistem otomatis memproses ribuan data secara cepat di sisi browser secara aman.</li>
                      </ul>
                    </div>

                    {/* Template download card */}
                    <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between bg-slate-50">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-800">Unduh Template Excel Resmi</h4>
                        <p className="text-[10px] text-slate-500">File .xlsx terformat rapi dengan data contoh siap edit</p>
                      </div>
                      <button
                        type="button"
                        onClick={downloadExcelTemplate}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg flex items-center space-x-1.5 transition cursor-pointer border border-indigo-200/50"
                      >
                        <Download size={14} />
                        <span>Unduh Template</span>
                      </button>
                    </div>

                    {/* Dropzone */}
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleExcelDrop}
                      className="min-h-[160px] border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl flex flex-col items-center justify-center p-6 text-center transition bg-slate-50 hover:bg-indigo-50/10 cursor-pointer relative"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleExcelUpload}
                        accept=".xlsx, .xls"
                        className="hidden"
                      />
                      <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full mb-2">
                        <Upload size={22} />
                      </div>
                      <p className="text-xs font-bold text-slate-700">Tarik & Lepas file Excel Anda ke sini</p>
                      <p className="text-[10px] text-slate-400 mt-1">atau klik untuk menelusuri file (.xlsx, .xls)</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setFormError(null);
                        setRegMode('manual');
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Equipment Modal (Overlay) */}
      <AnimatePresence>
        {showEditModal && activeEq && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-5 bg-indigo-950 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Ubah Spesifikasi Alat Sampling</h2>
                  <p className="text-xs text-slate-400">Edit data spesifikasi dan informasi penanggung jawab alat</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setFormError(null);
                  }}
                  className="p-1.5 hover:bg-indigo-900 rounded-lg transition text-slate-300 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEditEqSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold animate-in fade-in duration-200">
                    {formError}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nama Alat Sampling *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., pH Meter Digital Ohaus, Mikropipet 100uL"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Kategori Alat</label>
                    <select
                      value={editCategory}
                      onChange={(e) => {
                        setEditCategory(e.target.value);
                        if (e.target.value !== 'CUSTOM') {
                          setEditCategoryCustom('');
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      {allKnownCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="CUSTOM">+ Tambah Kategori Baru...</option>
                    </select>
                  </div>

                  {editCategory === 'CUSTOM' && (
                    <div className="col-span-2 space-y-1 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/60 animate-in fade-in duration-200">
                      <label className="text-xs font-bold text-indigo-700 flex items-center">
                        <Plus size={14} className="mr-1" /> Tulis Kategori Kustom Baru *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Oven, Mikroskop, Desikator"
                        value={editCategoryCustom}
                        onChange={(e) => setEditCategoryCustom(e.target.value)}
                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Merek & Tipe Model *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Starter 3100"
                      value={editModel}
                      onChange={(e) => setEditModel(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nomor Seri Fisik (S/N) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., SN-84920"
                      value={editSerialNumber}
                      onChange={(e) => setEditSerialNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">No. Inventaris Alat *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., INV/2026/007"
                      value={editInventoryNumber}
                      onChange={(e) => setEditInventoryNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Titik Kalibrasi *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., pH 4.01, 7.00, 10.01 atau 100g, 500g"
                      value={editCalibrationPoints}
                      onChange={(e) => setEditCalibrationPoints(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Lokasi Penyimpanan</label>
                    <input
                      type="text"
                      placeholder="e.g., Lab Mikrobiologi"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nama Penanggung Jawab (PJ) *</label>
                    <input
                      type="text"
                      placeholder="e.g., Siti Rahma, S.Si."
                      value={editPIC}
                      onChange={(e) => setEditPIC(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Email Penanggung Jawab *</label>
                    <input
                      type="email"
                      placeholder="e.g., siti@lab.id"
                      value={editPICEmail}
                      onChange={(e) => setEditPICEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Interval Kalibrasi (Bulan)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={editInterval}
                      onChange={(e) => setEditInterval(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tanggal Kalibrasi Terakhir</label>
                    <input
                      type="date"
                      value={editLastCalibDate}
                      onChange={(e) => setEditLastCalibDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Status Operasional Alat</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as CalibrationStatus)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="valid">✅ Valid (Kalibrasi Aktif)</option>
                      <option value="warning">⚠️ Warning (Butuh Kalibrasi)</option>
                      <option value="expired">❌ Kadaluarsa (Stop Penggunaan)</option>
                      <option value="calibrating">⚙️ Sedang Kalibrasi</option>
                      <option value="maintenance">🛠️ Maintenance (Dalam Pemeliharaan)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Keterangan / Deskripsi Alat</label>
                  <textarea
                    rows={2}
                    placeholder="Tuliskan spesifikasi detail alat atau kegunaan spesifik di lab..."
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setFormError(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add New Maintenance Log Modal (Overlay) */}
      <AnimatePresence>
        {showAddMaintModal && activeEq && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[60] p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-4 bg-indigo-950 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold">Tambah Log Pemeliharaan</h3>
                  <p className="text-[10px] text-slate-400">Mencatat aktivitas servis atau kalibrasi untuk {activeEq.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMaintModal(false);
                    setFormError(null);
                  }}
                  className="p-1 hover:bg-indigo-900 rounded text-slate-300 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddMaintSubmit} className="p-5 space-y-4">
                {formError && (
                  <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold animate-in fade-in duration-200">
                    {formError}
                  </div>
                )}
                
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Tanggal Kegiatan</label>
                  <input
                    type="date"
                    required
                    value={maintDate}
                    onChange={(e) => setMaintDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Kategori Tindakan</label>
                  <select
                    value={maintType}
                    onChange={(e) => setMaintType(e.target.value as MaintenanceType)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="Pengecekan Rutin">Pengecekan Rutin</option>
                    <option value="Pembersihan">Pembersihan</option>
                    <option value="Kalibrasi">Kalibrasi Ulang</option>
                    <option value="Perbaikan">Perbaikan Alat</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Petugas / Teknisi Pelaksana *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Andi Wijaya (Teknisi)"
                    value={maintOperator}
                    onChange={(e) => setMaintOperator(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Kondisi Alat Akhir</label>
                  <select
                    value={maintStatus}
                    onChange={(e) => setMaintStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="Selesai">Alat Berfungsi Sempurna (Selesai)</option>
                    <option value="Dalam Proses">Sedang Dikerjakan (Dalam Proses)</option>
                    <option value="Butuh Tindak Lanjut">Terdapat Kerusakan (Butuh Tindak Lanjut)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Catatan Detail Pemeliharaan *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Sebutkan komponen yang diservis, hasil akurasi timbang/ukur, dll..."
                    value={maintNotes}
                    onChange={(e) => setMaintNotes(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                {maintType === 'Kalibrasi' && (
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                    <p className="text-[10px] text-indigo-950 leading-relaxed font-semibold">
                      💡 Catatan: Karena Anda memilih kategori Kalibrasi, tanggal kalibrasi terakhir alat akan otomatis terupdate dan sertifikat baru akan digenerate otomatis!
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMaintModal(false);
                      setFormError(null);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded shadow-xs transition cursor-pointer"
                  >
                    Simpan Catatan
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manage Categories Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Tag className="text-indigo-400" size={18} />
                  <h3 className="font-bold text-sm text-white">Kelola Kategori Alat</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setNewCatInput('');
                    setCategoryError(null);
                    setCategoryToDelete(null);
                  }}
                  className="text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 text-left">
                {/* Inline Confirmation Alert */}
                {categoryToDelete && (
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-3.5 space-y-2.5 animate-in slide-in-from-top-2 duration-250">
                    <p className="text-xs text-rose-800 font-semibold leading-relaxed">
                      Apakah Anda yakin ingin menghapus kategori <span className="font-bold underline">"{categoryToDelete}"</span>? Semua alat dengan kategori ini akan dipindahkan ke kategori <span className="font-bold">"Lainnya"</span> secara otomatis.
                    </p>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setCategoryToDelete(null)}
                        className="px-2.5 py-1 bg-white border border-rose-200 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded-md transition cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          executeDeleteCategory(categoryToDelete);
                          setCategoryToDelete(null);
                        }}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-md transition cursor-pointer shadow-xs"
                      >
                        Ya, Hapus Kategori
                      </button>
                    </div>
                  </div>
                )}

                {/* Inline Error Messages */}
                {categoryError && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-center justify-between animate-in slide-in-from-top-1 duration-150">
                    <span>⚠️ {categoryError}</span>
                    <button 
                      type="button" 
                      onClick={() => setCategoryError(null)} 
                      className="text-amber-500 hover:text-amber-800 font-bold ml-2 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Form to Add New Category */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newCatInput.trim()) {
                      handleCreateCategory(newCatInput);
                      setNewCatInput('');
                    }
                  }}
                  className="space-y-2"
                >
                  <label className="text-xs font-bold text-slate-700 block">Tambah Kategori Baru</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Contoh: Oven, Inkubator, Desikator"
                      value={newCatInput}
                      onChange={(e) => setNewCatInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-800"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={14} />
                      Tambah
                    </button>
                  </div>
                </form>

                {/* Categories List */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Daftar Kategori Terdaftar</label>
                  <div className="border border-slate-100 rounded-lg divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {customCategories.map((cat) => {
                      const count = equipmentList.filter(e => e.category === cat).length;
                      return (
                        <div key={cat} className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 transition">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-slate-700">{cat}</span>
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full font-mono font-bold">
                              {count} alat
                            </span>
                          </div>
                          {cat !== 'Lainnya' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                              title={`Hapus kategori "${cat}"`}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  ⚠️ Menghapus kategori akan memindahkan seluruh alat di bawah kategori tersebut ke kategori <strong>"Lainnya"</strong> secara otomatis.
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setNewCatInput('');
                    setCategoryError(null);
                    setCategoryToDelete(null);
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Selesai
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
