/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  LayoutDashboard, 
  QrCode, 
  ClipboardCheck, 
  FileText, 
  Bell, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Database,
  Search,
  User,
  Power,
  ChevronRight,
  Menu,
  X,
  Settings,
  Download,
  Share2
} from 'lucide-react';

import { Equipment, MaintenanceRecord, UsageLog, SystemNotification, CalibrationStatus } from './types';
import { 
  INITIAL_EQUIPMENT, 
  INITIAL_MAINTENANCE, 
  INITIAL_USAGE_LOGS, 
  INITIAL_NOTIFICATIONS,
  TODAY_STR 
} from './mockData';
import { determineStatus, formatDateIndo } from './utils/helpers';

// Subcomponents
import DashboardView from './components/DashboardView';
import EquipmentView from './components/EquipmentView';
import QRScanView from './components/QRScanView';
import UsageLogsView from './components/UsageLogsView';
import AuditView from './components/AuditView';
import SettingsView from './components/SettingsView';

export default function App() {
  // Global persistent states (using localStorage)
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem('lab_equipment');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_EQUIPMENT;
  });

  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(() => {
    const saved = localStorage.getItem('lab_maintenance');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_MAINTENANCE;
  });

  const [usageLogs, setUsageLogs] = useState<UsageLog[]>(() => {
    const saved = localStorage.getItem('lab_usage');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USAGE_LOGS;
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem('lab_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // App navigation tabs
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedEqId, setSelectedEqId] = useState<string | null>(null);

  // Branding & Design States
  const [appName, setAppName] = useState(() => localStorage.getItem('cfg_app_name') || 'LabCalib');
  const [appSubtitle, setAppSubtitle] = useState(() => localStorage.getItem('cfg_app_subtitle') || 'Metrologi Lab');
  const [appLogo, setAppLogo] = useState(() => localStorage.getItem('cfg_app_logo') || '🔧');
  const [sidebarBg, setSidebarBg] = useState(() => localStorage.getItem('cfg_sidebar_bg') || 'midnight');
  const [sidebarOpacity, setSidebarOpacity] = useState(() => localStorage.getItem('cfg_sidebar_opacity') || '85');
  const [sidebarBlur, setSidebarBlur] = useState(() => localStorage.getItem('cfg_sidebar_blur') || 'md');

  // Synchronization with server-side database
  const syncState = async (updates: {
    equipment?: Equipment[];
    maintenance?: MaintenanceRecord[];
    usageLogs?: UsageLog[];
    notifications?: SystemNotification[];
    settings?: any;
  }) => {
    try {
      await fetch('/api/save-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error('Failed to sync state to server:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        if (response.ok) {
          const db = await response.json();
          if (db.equipment !== undefined) setEquipmentList(db.equipment);
          if (db.maintenance !== undefined) setMaintenanceRecords(db.maintenance);
          if (db.usageLogs !== undefined) setUsageLogs(db.usageLogs);
          if (db.notifications !== undefined) setNotifications(db.notifications);
          if (db.settings !== undefined) {
            const s = db.settings;
            if (s.appName !== undefined) { setAppName(s.appName); localStorage.setItem('cfg_app_name', s.appName); }
            if (s.appSubtitle !== undefined) { setAppSubtitle(s.appSubtitle); localStorage.setItem('cfg_app_subtitle', s.appSubtitle); }
            if (s.appLogo !== undefined) { setAppLogo(s.appLogo); localStorage.setItem('cfg_app_logo', s.appLogo); }
            if (s.sidebarBg !== undefined) { setSidebarBg(s.sidebarBg); localStorage.setItem('cfg_sidebar_bg', s.sidebarBg); }
            if (s.sidebarOpacity !== undefined) { setSidebarOpacity(s.sidebarOpacity); localStorage.setItem('cfg_sidebar_opacity', s.sidebarOpacity); }
            if (s.sidebarBlur !== undefined) { setSidebarBlur(s.sidebarBlur); localStorage.setItem('cfg_sidebar_blur', s.sidebarBlur); }
            
            if (s.labName !== undefined) localStorage.setItem('cfg_lab_name', s.labName);
            if (s.warningDays !== undefined) localStorage.setItem('cfg_warning_days', String(s.warningDays));
            if (s.defaultPic !== undefined) localStorage.setItem('cfg_default_pic', s.defaultPic);
            if (s.soundEnabled !== undefined) localStorage.setItem('cfg_sound_enabled', String(s.soundEnabled));
            if (s.autoOpenScan !== undefined) localStorage.setItem('cfg_auto_open_scan', String(s.autoOpenScan));

            window.dispatchEvent(new Event('lab_settings_updated'));
          }
        }
      } catch (err) {
        console.error('Failed to fetch initial state from server:', err);
      }
    };

    fetchData();

    // Setup WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    let socket = new WebSocket(wsUrl);

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'STATE_UPDATED') {
          const { equipment, maintenance, usageLogs, notifications: notifs, settings } = message.data;
          if (equipment !== undefined) setEquipmentList(equipment);
          if (maintenance !== undefined) setMaintenanceRecords(maintenance);
          if (usageLogs !== undefined) setUsageLogs(usageLogs);
          if (notifs !== undefined) setNotifications(notifs);
          if (settings !== undefined) {
            const s = settings;
            if (s.appName !== undefined) { setAppName(s.appName); localStorage.setItem('cfg_app_name', s.appName); }
            if (s.appSubtitle !== undefined) { setAppSubtitle(s.appSubtitle); localStorage.setItem('cfg_app_subtitle', s.appSubtitle); }
            if (s.appLogo !== undefined) { setAppLogo(s.appLogo); localStorage.setItem('cfg_app_logo', s.appLogo); }
            if (s.sidebarBg !== undefined) { setSidebarBg(s.sidebarBg); localStorage.setItem('cfg_sidebar_bg', s.sidebarBg); }
            if (s.sidebarOpacity !== undefined) { setSidebarOpacity(s.sidebarOpacity); localStorage.setItem('cfg_sidebar_opacity', s.sidebarOpacity); }
            if (s.sidebarBlur !== undefined) { setSidebarBlur(s.sidebarBlur); localStorage.setItem('cfg_sidebar_blur', s.sidebarBlur); }
            
            if (s.labName !== undefined) localStorage.setItem('cfg_lab_name', s.labName);
            if (s.warningDays !== undefined) localStorage.setItem('cfg_warning_days', String(s.warningDays));
            if (s.defaultPic !== undefined) localStorage.setItem('cfg_default_pic', s.defaultPic);
            if (s.soundEnabled !== undefined) localStorage.setItem('cfg_sound_enabled', String(s.soundEnabled));
            if (s.autoOpenScan !== undefined) localStorage.setItem('cfg_auto_open_scan', String(s.autoOpenScan));

            window.dispatchEvent(new Event('lab_settings_updated'));
          }
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    };

    socket.onmessage = handleMessage;

    const handleClose = () => {
      console.log('WS disconnected, retrying in 3 seconds...');
      setTimeout(() => {
        socket = new WebSocket(wsUrl);
        socket.onmessage = handleMessage;
        socket.onclose = handleClose;
      }, 3000);
    };
    socket.onclose = handleClose;

    return () => {
      socket.close();
    };
  }, []);

  // PWA & Connection States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  useEffect(() => {
    const handleBrandingUpdate = () => {
      setAppName(localStorage.getItem('cfg_app_name') || 'LabCalib');
      setAppSubtitle(localStorage.getItem('cfg_app_subtitle') || 'Metrologi Lab');
      setAppLogo(localStorage.getItem('cfg_app_logo') || '🔧');
      setSidebarBg(localStorage.getItem('cfg_sidebar_bg') || 'midnight');
      setSidebarOpacity(localStorage.getItem('cfg_sidebar_opacity') || '85');
      setSidebarBlur(localStorage.getItem('cfg_sidebar_blur') || 'md');
    };
    window.addEventListener('lab_settings_updated', handleBrandingUpdate);
    return () => {
      window.removeEventListener('lab_settings_updated', handleBrandingUpdate);
    };
  }, []);

  // Layout states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Save states to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('lab_equipment', JSON.stringify(equipmentList));
  }, [equipmentList]);

  useEffect(() => {
    localStorage.setItem('lab_maintenance', JSON.stringify(maintenanceRecords));
  }, [maintenanceRecords]);

  useEffect(() => {
    localStorage.setItem('lab_usage', JSON.stringify(usageLogs));
  }, [usageLogs]);

  useEffect(() => {
    localStorage.setItem('lab_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Real-time dynamic clock (Indonesian WIB format)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      setCurrentTime(now.toLocaleDateString('id-ID', options) + ' WIB');
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Recalculate calibration status warning on load based on current system date
  useEffect(() => {
    setEquipmentList(prevList => {
      let updated = false;
      const newList = prevList.map(eq => {
        const calculatedStatus = determineStatus(eq.nextCalibrationDate, TODAY_STR, eq.status);
        if (calculatedStatus !== eq.status) {
          updated = true;
          return { ...eq, status: calculatedStatus };
        }
        return eq;
      });
      return updated ? newList : prevList;
    });
  }, []);

  // Listen to URL search parameters for direct deep-linking from camera QR scan
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eqId = params.get('eqId');
    if (eqId) {
      // Find if this equipment exists
      const exists = equipmentList.some(eq => eq.id === eqId);
      if (exists) {
        setSelectedEqId(eqId);
        setActiveTab('alat');
        // Clean up the URL search params so it doesn't trigger repeatedly on tab transitions
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [equipmentList]);

  // Core functions to interact with the database

  // 1. Add/Register New Equipment
  const handleAddEquipment = (newEq: Omit<Equipment, 'id' | 'status' | 'createdAt'>) => {
    const nextId = `EQ-0${equipmentList.length + 1}`;
    const calculatedStatus = determineStatus(newEq.nextCalibrationDate, TODAY_STR);

    const fullEq: Equipment = {
      ...newEq,
      id: nextId,
      status: calculatedStatus,
      createdAt: TODAY_STR
    };

    const nextList = [fullEq, ...equipmentList];
    setEquipmentList(nextList);

    // Add logging notification
    const newNotif: SystemNotification = {
      id: `NOT-${Date.now()}`,
      equipmentId: nextId,
      title: 'Registrasi Alat Baru Berhasil',
      message: `Alat "${newEq.name}" dengan S/N ${newEq.serialNumber} berhasil didaftarkan di ${newEq.location}.`,
      type: 'success',
      date: '2026-07-14 01:00',
      isRead: false
    };
    const nextNotifs = [newNotif, ...notifications];
    setNotifications(nextNotifs);
    syncState({ equipment: nextList, notifications: nextNotifs });
  };

  // 1a. Batch Add/Register New Equipment (Excel Import)
  const handleAddEquipmentBatch = (newEqs: Omit<Equipment, 'id' | 'status' | 'createdAt'>[]) => {
    let maxNum = 0;
    equipmentList.forEach(eq => {
      const match = eq.id.match(/EQ-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });

    const fullEqs: Equipment[] = newEqs.map((newEq, index) => {
      const nextNum = maxNum + 1 + index;
      const nextId = `EQ-${String(nextNum).padStart(3, '0')}`;
      const calculatedStatus = determineStatus(newEq.nextCalibrationDate, TODAY_STR);
      return {
        ...newEq,
        id: nextId,
        status: calculatedStatus,
        createdAt: TODAY_STR
      };
    });

    const nextList = [...fullEqs, ...equipmentList];
    setEquipmentList(nextList);

    const newNotif: SystemNotification = {
      id: `NOT-${Date.now()}`,
      title: 'Import Alat Massal Berhasil',
      message: `${newEqs.length} alat sampling berhasil didaftarkan ke sistem melalui import Excel.`,
      type: 'success',
      date: '2026-07-15 18:00',
      isRead: false
    };
    const nextNotifs = [newNotif, ...notifications];
    setNotifications(nextNotifs);
    syncState({ equipment: nextList, notifications: nextNotifs });
  };

  // 1b. Update Existing Equipment
  const handleUpdateEquipment = (id: string, updatedFields: Omit<Equipment, 'id' | 'status' | 'createdAt'> & { status?: CalibrationStatus }) => {
    const nextList = equipmentList.map(eq => {
      if (eq.id === id) {
        const calculatedStatus = updatedFields.status !== undefined
          ? updatedFields.status
          : determineStatus(updatedFields.nextCalibrationDate, TODAY_STR, eq.status);
        return {
          ...eq,
          ...updatedFields,
          status: calculatedStatus,
        };
      }
      return eq;
    });
    setEquipmentList(nextList);

    // Add logging notification
    const newNotif: SystemNotification = {
      id: `NOT-${Date.now()}`,
      equipmentId: id,
      title: 'Update Informasi Alat',
      message: `Informasi alat "${updatedFields.name}" berhasil diperbarui.`,
      type: 'info',
      date: '2026-07-14 01:00',
      isRead: false
    };
    const nextNotifs = [newNotif, ...notifications];
    setNotifications(nextNotifs);
    syncState({ equipment: nextList, notifications: nextNotifs });
  };

  // 2. Delete Equipment
  const handleDeleteEquipment = (id: string) => {
    const nextEq = equipmentList.filter(eq => eq.id !== id);
    const nextMaint = maintenanceRecords.filter(rec => rec.equipmentId !== id);
    const nextLogs = usageLogs.filter(log => log.equipmentId !== id);

    setEquipmentList(nextEq);
    setMaintenanceRecords(nextMaint);
    setUsageLogs(nextLogs);
    setSelectedEqId(null);
    syncState({ equipment: nextEq, maintenance: nextMaint, usageLogs: nextLogs });
  };

  // 3. Add Maintenance record
  const handleAddMaintenance = (record: Omit<MaintenanceRecord, 'id' | 'equipmentName'>) => {
    const targetEq = equipmentList.find(e => e.id === record.equipmentId);
    if (!targetEq) return;

    const recordId = `MNT-${Date.now()}`;
    const newRecord: MaintenanceRecord = {
      ...record,
      id: recordId,
      equipmentName: targetEq.name,
    };

    const nextMaint = [newRecord, ...maintenanceRecords];
    setMaintenanceRecords(nextMaint);

    let nextEq = equipmentList;
    let nextNotifs = notifications;

    // IMPORTANT LOGIC: If maintenance type is "Kalibrasi", we automatically renew the last/next calibration dates!
    if (record.type === 'Kalibrasi') {
      nextEq = equipmentList.map(eq => {
        if (eq.id === record.equipmentId) {
          // Compute next date based on months interval
          const lastDate = new Date(record.date);
          lastDate.setMonth(lastDate.getMonth() + eq.calibrationInterval);
          const nextDateStr = lastDate.toISOString().split('T')[0];
          
          return {
            ...eq,
            lastCalibrationDate: record.date,
            nextCalibrationDate: nextDateStr,
            status: 'valid', // Reset to valid
            certificateName: `CERT-NEW-${eq.id}.pdf`,
            certificateData: 'MOCK_RENEWED_DATA_BASE64',
            certificateUploadDate: record.date
          };
        }
        return eq;
      });
      setEquipmentList(nextEq);

      // Fire a nice notification
      const newNotif: SystemNotification = {
        id: `NOT-${Date.now()}`,
        equipmentId: record.equipmentId,
        title: 'Pembaharuan Kalibrasi Berhasil!',
        message: `Status "${targetEq.name}" diupdate menjadi VALID. Sertifikat baru telah digenerate secara otomatis.`,
        type: 'success',
        date: '2026-07-14 01:00',
        isRead: false
      };
      nextNotifs = [newNotif, ...notifications];
      setNotifications(nextNotifs);
    } else {
      // General service log notification
      const newNotif: SystemNotification = {
        id: `NOT-${Date.now()}`,
        equipmentId: record.equipmentId,
        title: 'Pemeliharaan Dicatat',
        message: `Aktivitas "${record.type}" berhasil didokumentasikan untuk alat "${targetEq.name}".`,
        type: 'info',
        date: '2026-07-14 01:00',
        isRead: false
      };
      nextNotifs = [newNotif, ...notifications];
      setNotifications(nextNotifs);
    }
    syncState({ equipment: nextEq, maintenance: nextMaint, notifications: nextNotifs });
  };

  // 4. Upload Certificate for existing equipment
  const handleUploadCertificate = (id: string, name: string, base64: string) => {
    const nextList = equipmentList.map(eq => {
      if (eq.id === id) {
        return {
          ...eq,
          certificateName: name,
          certificateData: base64,
          certificateUploadDate: TODAY_STR
        };
      }
      return eq;
    });
    setEquipmentList(nextList);

    // Trigger notification
    const matched = equipmentList.find(e => e.id === id);
    const newNotif: SystemNotification = {
      id: `NOT-${Date.now()}`,
      equipmentId: id,
      title: 'Sertifikat Kalibrasi Diunggah',
      message: `Sertifikat "${name}" berhasil dilampirkan secara sah untuk alat "${matched?.name || id}".`,
      type: 'success',
      date: '2026-07-14 01:00',
      isRead: false
    };
    const nextNotifs = [newNotif, ...notifications];
    setNotifications(nextNotifs);
    syncState({ equipment: nextList, notifications: nextNotifs });
  };

  // 5. Start Usage log session (Check-out)
  const handleStartUsage = (eqId: string, operator: string, purpose: string, notes: string) => {
    const targetEq = equipmentList.find(e => e.id === eqId);
    if (!targetEq) return;

    const logId = `LOG-${Date.now()}`;
    const newLog: UsageLog = {
      id: logId,
      equipmentId: eqId,
      equipmentName: targetEq.name,
      operator,
      startDate: TODAY_STR,
      startTime: '10:00', // Mock start time based on current
      endDate: null,
      endTime: null,
      purpose,
      notes,
      status: 'Sedang Digunakan'
    };

    const nextLogs = [newLog, ...usageLogs];
    setUsageLogs(nextLogs);

    // Add system notification for administrative logbook tracking
    const newNotif: SystemNotification = {
      id: `NOT-LOG-${Date.now()}`,
      equipmentId: eqId,
      title: 'Sesi Pemakaian Dimulai',
      message: `${operator} mulai menggunakan alat "${targetEq.name}" untuk "${purpose}".`,
      type: 'info',
      date: '2026-07-14 01:00',
      isRead: false
    };
    const nextNotifs = [newNotif, ...notifications];
    setNotifications(nextNotifs);
    syncState({ usageLogs: nextLogs, notifications: nextNotifs });
  };

  // 6. End Usage log session (Check-in)
  const handleEndUsage = (logId: string, notes: string) => {
    const nextLogs = usageLogs.map(log => {
      if (log.id === logId) {
        return {
          ...log,
          endDate: TODAY_STR,
          endTime: '11:30', // Mock checkout time
          notes,
          status: 'Selesai'
        };
      }
      return log;
    });
    setUsageLogs(nextLogs);

    // Add completion notification
    const matchedLog = usageLogs.find(l => l.id === logId);
    const newNotif: SystemNotification = {
      id: `NOT-LOG-END-${Date.now()}`,
      equipmentId: matchedLog?.equipmentId,
      title: 'Sesi Pemakaian Selesai',
      message: `${matchedLog?.operator || 'Petugas'} mengembalikan alat "${matchedLog?.equipmentName || 'Alat'}" ke status standby.`,
      type: 'info',
      date: '2026-07-14 01:00',
      isRead: false
    };
    const nextNotifs = [newNotif, ...notifications];
    setNotifications(nextNotifs);
    syncState({ usageLogs: nextLogs, notifications: nextNotifs });
  };

  // Mark all alerts read
  const handleMarkAllNotificationsRead = () => {
    const nextNotifs = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(nextNotifs);
    syncState({ notifications: nextNotifs });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Render navigation-specific view
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            equipment={equipmentList}
            usageLogs={usageLogs}
            notifications={notifications}
            onNavigate={(tab) => {
              setActiveTab(tab);
              setSelectedEqId(null);
            }}
            onSelectEquipment={(id) => {
              setSelectedEqId(id);
              setActiveTab('alat');
            }}
            onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          />
        );
      case 'alat':
        return (
          <EquipmentView
            equipmentList={equipmentList}
            maintenanceRecords={maintenanceRecords}
            usageLogs={usageLogs}
            selectedEquipmentId={selectedEqId}
            onSelectEquipment={setSelectedEqId}
            onAddEquipment={handleAddEquipment}
            onAddEquipmentBatch={handleAddEquipmentBatch}
            onUpdateEquipment={handleUpdateEquipment}
            onDeleteEquipment={handleDeleteEquipment}
            onAddMaintenance={handleAddMaintenance}
            onUploadCertificate={handleUploadCertificate}
          />
        );
      case 'scan':
        return (
          <QRScanView
            equipmentList={equipmentList}
            onSelectEquipment={(id) => {
              setSelectedEqId(id);
            }}
            onNavigate={(tab) => {
              setActiveTab(tab);
            }}
          />
        );
      case 'penggunaan':
        return (
          <UsageLogsView
            usageLogs={usageLogs}
            equipmentList={equipmentList}
            onStartUsage={handleStartUsage}
            onEndUsage={handleEndUsage}
          />
        );
      case 'laporan':
        return (
          <AuditView
            equipmentList={equipmentList}
            maintenanceRecords={maintenanceRecords}
            usageLogs={usageLogs}
          />
        );
      case 'pengaturan':
        return (
          <SettingsView onSaveSettings={(settings) => syncState({ settings })} />
        );
      default:
        return <div className="text-center py-12">Halaman tidak ditemukan.</div>;
    }
  };

  const getSidebarStyle = () => {
    const opacityDecimal = Number(sidebarOpacity) / 100;
    let bgStyle = 'rgba(2, 6, 23, 0.85)';
    let blurStyle = 'blur(12px)';

    if (sidebarBg === 'midnight') {
      bgStyle = `rgba(2, 6, 23, ${opacityDecimal})`;
    } else if (sidebarBg === 'glass') {
      bgStyle = `rgba(15, 23, 42, ${opacityDecimal})`;
    } else if (sidebarBg === 'nebula') {
      bgStyle = `rgba(49, 46, 129, ${opacityDecimal})`;
    } else if (sidebarBg === 'obsidian') {
      bgStyle = `rgba(0, 0, 0, ${opacityDecimal})`;
    } else if (sidebarBg === 'charcoal') {
      bgStyle = `rgba(9, 9, 11, ${opacityDecimal})`;
    }

    if (sidebarBlur === 'none') blurStyle = 'none';
    else if (sidebarBlur === 'xs') blurStyle = 'blur(2px)';
    else if (sidebarBlur === 'sm') blurStyle = 'blur(4px)';
    else if (sidebarBlur === 'md') blurStyle = 'blur(12px)';
    else if (sidebarBlur === 'lg') blurStyle = 'blur(24px)';
    else if (sidebarBlur === 'xl') blurStyle = 'blur(40px)';

    return {
      backgroundColor: bgStyle,
      backdropFilter: blurStyle,
      WebkitBackdropFilter: blurStyle
    };
  };

  const getSidebarBorderClass = () => {
    if (sidebarBg === 'midnight') return 'border-white/10';
    if (sidebarBg === 'glass') return 'border-white/5';
    if (sidebarBg === 'nebula') return 'border-indigo-500/20';
    if (sidebarBg === 'obsidian') return 'border-zinc-800/60';
    if (sidebarBg === 'charcoal') return 'border-zinc-800/40';
    return 'border-white/5';
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* 1. Desktop Side Navigation Sidebar */}
      <aside 
        style={getSidebarStyle()} 
        className={`hidden lg:flex flex-col w-64 text-white shrink-0 justify-between border-r ${getSidebarBorderClass()} transition-all duration-300`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Sidebar Brand header */}
          <div className="flex items-center space-x-3 px-6 py-6 border-b border-slate-800/60 shrink-0">
            <div className={`w-14 h-14 flex items-center justify-center text-2xl shrink-0 overflow-hidden ${
              appLogo.startsWith('data:image/') || appLogo.startsWith('http') ? '' : 'bg-indigo-600/15 border border-indigo-500/20 rounded-xl'
            }`}>
              {appLogo.startsWith('data:image/') || appLogo.startsWith('http') ? (
                <img src={appLogo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                appLogo
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold tracking-tight truncate leading-snug">{appName}</h2>
              <p className="text-[10px] text-indigo-300 font-semibold uppercase tracking-wider truncate mt-0.5">{appSubtitle}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1 text-xs">
            {/* Dashboard */}
            <button
              onClick={() => { setActiveTab('dashboard'); setSelectedEqId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg font-bold transition duration-150 cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard Analitis</span>
            </button>

            {/* Equipment Register */}
            <button
              onClick={() => { setActiveTab('alat'); setSelectedEqId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg font-bold transition duration-150 cursor-pointer ${
                activeTab === 'alat' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <ClipboardCheck size={16} />
              <span>Daftar Alat Sampling</span>
            </button>

            {/* Scan QR */}
            <button
              onClick={() => { setActiveTab('scan'); setSelectedEqId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg font-bold transition duration-150 cursor-pointer ${
                activeTab === 'scan' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <QrCode size={16} />
              <span>Scan QR Code Alat</span>
            </button>

            {/* Log Pemakaian */}
            <button
              onClick={() => { setActiveTab('penggunaan'); setSelectedEqId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg font-bold transition duration-150 cursor-pointer ${
                activeTab === 'penggunaan' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Clock size={16} />
              <span>Log Penggunaan Alat</span>
            </button>

            {/* Laporan Audit */}
            <button
              onClick={() => { setActiveTab('laporan'); setSelectedEqId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg font-bold transition duration-150 cursor-pointer ${
                activeTab === 'laporan' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <FileText size={16} />
              <span>Laporan & Ekspor Audit</span>
            </button>

            {/* Pengaturan */}
            <button
              onClick={() => { setActiveTab('pengaturan'); setSelectedEqId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg font-bold transition duration-150 cursor-pointer ${
                activeTab === 'pengaturan' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Settings size={16} />
              <span>Pengaturan & Panduan</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer info */}
        <div className="p-4 border-t border-slate-800/60 space-y-3">
          {/* PWA Install Button inside sidebar */}
          {isInstallable && (
            <button
              onClick={handleInstallApp}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl p-2.5 flex items-center justify-center space-x-2 border border-indigo-500 shadow-md transition-all duration-200 cursor-pointer animate-pulse"
            >
              <Download size={14} />
              <span className="text-[10px] font-bold">Pasang Aplikasi HP</span>
            </button>
          )}

          {/* Database offline status */}
          <div className="bg-slate-800/50 rounded-xl p-3 flex items-center space-x-2.5 border border-slate-800">
            <Database className={`${isOffline ? 'text-amber-400' : 'text-emerald-400'} shrink-0`} size={14} />
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-slate-300">Database Lokal</p>
              <p className={`text-[9px] ${isOffline ? 'text-amber-400' : 'text-emerald-400'} truncate`}>
                {isOffline ? 'Mode Offline - Cache Aktif' : 'Persistent Offline Secure'}
              </p>
            </div>
          </div>

          {/* User Email block */}
          <div className="flex items-center space-x-2 px-2 py-1">
            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[11px] font-bold text-indigo-400 border border-slate-700">
              GK
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-slate-200 truncate">gkrismantara@gmail.com</p>
              <p className="text-[9px] text-slate-500">Staf Pengawas Lab</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Frame (Header + Body Container) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Main Content Header */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0 relative z-30 shadow-xs">
          {/* Mobile hamburger menu toggle */}
          <div className="flex items-center space-x-3 lg:space-x-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 hover:bg-slate-100 rounded-lg lg:hidden transition cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <div className="flex items-center space-x-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse hidden sm:block`} />
              <p className="text-[11px] text-slate-500 font-semibold hidden sm:block">
                {isOffline ? 'Mode Offline Aktif (Menggunakan Cache Lokal)' : 'Status Operasional Lab: Aman'}
              </p>
            </div>
          </div>

          {/* Right Header items: clock & notifications */}
          <div className="flex items-center space-x-4">
            
            {/* Real-time Clock display */}
            <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
              <Clock size={13} className="text-slate-400" />
              <span>{currentTime || 'Memuat...'}</span>
            </div>

            {/* Notification alert icon bell with badge */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition relative cursor-pointer"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-600 rounded-full border-2 border-white animate-pulse" />
                )}
              </button>

              {/* Notification dropdown box panel */}
              <AnimatePresence>
                {showNotificationDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotificationDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden text-xs"
                    >
                      <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between font-bold">
                        <span className="text-slate-800">Pemberitahuan Sistem ({unreadCount})</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => {
                              handleMarkAllNotificationsRead();
                              setShowNotificationDropdown(false);
                            }}
                            className="text-[10px] text-indigo-600 hover:underline font-semibold"
                          >
                            Tandai semua dibaca
                          </button>
                        )}
                      </div>

                      <div className="divide-y divide-slate-100 max-h-[280px] overflow-y-auto">
                        {notifications.map((n) => (
                          <div 
                            key={n.id} 
                            className={`p-3 space-y-1 transition hover:bg-slate-50/50 ${!n.isRead ? 'bg-indigo-50/20' : ''}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">{n.title}</span>
                              <span className="text-[9px] text-slate-400">{n.date.split(' ')[1]} WIB</span>
                            </div>
                            <p className="text-slate-500 text-[11px] leading-relaxed">{n.message}</p>
                          </div>
                        ))}

                        {notifications.length === 0 && (
                          <div className="text-center py-8 text-slate-400">
                            Tidak ada notifikasi sistem aktif.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* Dynamic Navigation Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (selectedEqId ? `-${selectedEqId}` : '')}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="h-full space-y-6"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* 3. Mobile Slide Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Sidebar drawer sheet */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              style={getSidebarStyle()}
              className={`fixed inset-y-0 left-0 w-64 text-white z-50 p-5 flex flex-col justify-between shadow-2xl border-r ${getSidebarBorderClass()} transition-all duration-300`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-6">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-12 h-12 flex items-center justify-center text-lg shrink-0 overflow-hidden ${
                      appLogo.startsWith('data:image/') || appLogo.startsWith('http') ? '' : 'bg-indigo-600/15 border border-indigo-500/20 rounded-lg'
                    }`}>
                      {appLogo.startsWith('data:image/') || appLogo.startsWith('http') ? (
                        <img src={appLogo} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        appLogo
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-extrabold tracking-tight truncate leading-snug">{appName}</h2>
                      <p className="text-[9px] text-indigo-300 font-semibold uppercase tracking-wider truncate mt-0.5">{appSubtitle}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 hover:bg-slate-800 rounded cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <nav className="space-y-1.5 text-xs font-bold text-slate-400">
                  <button
                    onClick={() => { setActiveTab('dashboard'); setSelectedEqId(null); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition ${
                      activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <LayoutDashboard size={16} />
                    <span>Dashboard Analitis</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('alat'); setSelectedEqId(null); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition ${
                      activeTab === 'alat' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <ClipboardCheck size={16} />
                    <span>Daftar Alat Sampling</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('scan'); setSelectedEqId(null); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition ${
                      activeTab === 'scan' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <QrCode size={16} />
                    <span>Scan QR Code Alat</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('penggunaan'); setSelectedEqId(null); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition ${
                      activeTab === 'penggunaan' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <Clock size={16} />
                    <span>Log Penggunaan Alat</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('laporan'); setSelectedEqId(null); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition ${
                      activeTab === 'laporan' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <FileText size={16} />
                    <span>Laporan & Ekspor Audit</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('pengaturan'); setSelectedEqId(null); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition ${
                      activeTab === 'pengaturan' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <Settings size={16} />
                    <span>Pengaturan & Panduan</span>
                  </button>
                </nav>
              </div>

              {/* Mobile Footer profile */}
              <div className="border-t border-slate-800/60 pt-4 text-xs space-y-3">
                {isInstallable && (
                  <button
                    onClick={handleInstallApp}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 flex items-center justify-center space-x-2 border border-indigo-500 shadow-sm transition duration-150 cursor-pointer text-[10px] font-bold"
                  >
                    <Download size={12} />
                    <span>Pasang Aplikasi HP</span>
                  </button>
                )}
                <div className="bg-slate-800/40 rounded-lg p-2.5 flex items-center space-x-2 border border-slate-800 text-[10px]">
                  <Database className={`${isOffline ? 'text-amber-400' : 'text-emerald-400'} shrink-0`} size={12} />
                  <div>
                    <p className="font-bold text-slate-300 leading-tight">Database Lokal</p>
                    <p className={`text-[8px] ${isOffline ? 'text-amber-400' : 'text-emerald-400'} mt-0.5`}>
                      {isOffline ? 'Mode Offline (Cache Aktif)' : 'Persistent Offline Secure'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-slate-300">gkrismantara@gmail.com</p>
                  <p className="text-[10px] text-slate-500">Staf Pengawas Lab</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
