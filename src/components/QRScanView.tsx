/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  QrCode, 
  Camera, 
  CameraOff, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Search, 
  ChevronRight, 
  Smartphone,
  Sparkles,
  Zap,
  RotateCcw
} from 'lucide-react';
import { Equipment } from '../types';
import { formatDateIndo, getDaysRemaining } from '../utils/helpers';

interface QRScanViewProps {
  equipmentList: Equipment[];
  onSelectEquipment: (id: string) => void;
  onNavigate: (tab: string) => void;
}

export default function QRScanView({
  equipmentList,
  onSelectEquipment,
  onNavigate
}: QRScanViewProps) {
  const [useCamera, setUseCamera] = useState(false);
  const [selectedSimId, setSelectedSimId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<Equipment | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedLink, setScannedLink] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  const handleCopyLink = () => {
    if (scannedLink) {
      navigator.clipboard.writeText(scannedLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (html5QrcodeRef.current) {
        html5QrcodeRef.current.stop().catch(err => {
          console.log('Error stopping html5Qrcode during cleanup:', err);
        });
      }
    };
  }, []);

  // Handle parsed decoded text
  const handleDecodedText = (decodedText: string) => {
    let eqId = '';
    let parsedLink = '';

    // If it's a URL, save the full link and extract eqId
    if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
      parsedLink = decodedText;
      try {
        const url = new URL(decodedText);
        eqId = url.searchParams.get('eqId') || '';
      } catch (e) {
        const match = decodedText.match(/eqId=(EQ-\d+)/i);
        if (match) eqId = match[1];
      }
    } else if (decodedText.startsWith('EQ-')) {
      eqId = decodedText.trim();
    } else {
      const match = decodedText.match(/EQ-\d+/i);
      if (match) eqId = match[0].toUpperCase();
    }

    if (eqId) {
      const matched = equipmentList.find(e => e.id.toUpperCase() === eqId.toUpperCase());
      if (matched) {
        // Play beep sound
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          oscillator.type = 'sine';
          oscillator.frequency.value = 880;
          gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.15);
        } catch (e) {
          console.log('Audio beep blocked:', e);
        }

        setScanResult(matched);
        setScannedLink(parsedLink || `${window.location.origin}${window.location.pathname}?eqId=${matched.id}`);
        setCameraError(null);
        // Automatically stop the camera once we successfully scan and identify an item
        stopCamera();
      } else {
        setCameraError(`Alat dengan ID "${eqId}" tidak ditemukan di database.`);
      }
    } else {
      setCameraError(`QR Code berhasil dipindai ("${decodedText}"), tetapi formatnya tidak didukung.`);
    }
  };

  // Handle Camera Switching
  const handleCameraChange = async (cameraId: string) => {
    setSelectedCameraId(cameraId);
    if (useCamera) {
      // Stop the current running scanner
      if (html5QrcodeRef.current) {
        try {
          if (html5QrcodeRef.current.isScanning) {
            await html5QrcodeRef.current.stop();
          }
        } catch (e) {
          console.error('Error stopping camera during transition:', e);
        }
        html5QrcodeRef.current = null;
      }

      setScanning(true);
      try {
        const html5Qrcode = new Html5Qrcode("qr-reader");
        html5QrcodeRef.current = html5Qrcode;
        await html5Qrcode.start(
          cameraId,
          {
            fps: 15,
            qrbox: (width, height) => {
              const size = Math.min(width, height) * 0.75;
              return { width: size, height: size };
            }
          },
          (decodedText) => {
            handleDecodedText(decodedText);
          },
          () => {}
        );
        setScanning(false);
      } catch (err) {
        console.error('Error switching camera:', err);
        setCameraError('Gagal beralih ke kamera yang dipilih.');
        setScanning(false);
      }
    }
  };

  // Access the camera
  const startCamera = async () => {
    setCameraError(null);
    setScanResult(null);
    setScannedLink(null);
    setScanning(true);
    setUseCamera(true); // Show camera viewport container immediately so DOM is active

    if (html5QrcodeRef.current) {
      try {
        if (html5QrcodeRef.current.isScanning) {
          await html5QrcodeRef.current.stop();
        }
      } catch (e) {
        console.log(e);
      }
      html5QrcodeRef.current = null;
    }

    try {
      // Fetch available camera devices
      let devices: any[] = [];
      try {
        devices = await Html5Qrcode.getCameras();
        setCameras(devices);
      } catch (e) {
        console.warn('Error fetching cameras list:', e);
      }

      // Delay slightly to ensure DOM node #qr-reader is mounted and visible
      setTimeout(async () => {
        try {
          const html5Qrcode = new Html5Qrcode("qr-reader");
          html5QrcodeRef.current = html5Qrcode;

          // Determine starting camera configuration
          let cameraConfig: any = { facingMode: "environment" };
          
          if (devices && devices.length > 0) {
            let targetId = selectedCameraId;
            if (!targetId || !devices.some(d => d.id === targetId)) {
              // Try to find a rear/back camera by label
              const backCam = devices.find(d => 
                d.label.toLowerCase().includes('back') || 
                d.label.toLowerCase().includes('rear') || 
                d.label.toLowerCase().includes('belakang')
              );
              targetId = backCam ? backCam.id : devices[0].id;
              setSelectedCameraId(targetId);
            }
            cameraConfig = targetId;
          }

          await html5Qrcode.start(
            cameraConfig,
            {
              fps: 15,
              qrbox: (width, height) => {
                const size = Math.min(width, height) * 0.75;
                return { width: size, height: size };
              }
            },
            (decodedText) => {
              handleDecodedText(decodedText);
            },
            () => {
              // Ignore frames with no barcode
            }
          );
          setScanning(false);
        } catch (err: any) {
          console.error('Camera start error inside timeout:', err);
          setCameraError('Gagal mengakses kamera perangkat Anda. Pastikan izin kamera diizinkan atau gunakan simulator cepat di bawah.');
          setUseCamera(false);
          setScanning(false);
        }
      }, 150);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Gagal mengakses kamera perangkat Anda. Pastikan izin kamera diizinkan.');
      setUseCamera(false);
      setScanning(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrcodeRef.current) {
      try {
        if (html5QrcodeRef.current.isScanning) {
          await html5QrcodeRef.current.stop();
        }
      } catch (e) {
        console.error('Failed to stop camera stream:', e);
      }
      html5QrcodeRef.current = null;
    }
    setUseCamera(false);
    setScanning(false);
  };

  // Trigger scan sequence
  const handleScanSimulation = (id: string) => {
    if (!id) return;
    setScanning(true);
    setScanResult(null);
    setScannedLink(null);

    // Audio context for the scanner "BEEP" sound
    const playBeep = () => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.value = 880; // High frequency beep
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15); // play for 150ms
      } catch (e) {
        console.log('Audio beep failed or blocked:', e);
      }
    };

    setTimeout(() => {
      const matched = equipmentList.find(e => e.id === id);
      if (matched) {
        setScanResult(matched);
        setScannedLink(`${window.location.origin}${window.location.pathname}?eqId=${matched.id}`);
        playBeep();
      }
      setScanning(false);
    }, 1200); // 1.2 second scanning transition
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Scan QR Code Alat Sampling</h1>
          <p className="text-xs text-slate-500">
            Akses instan riwayat dan status validitas kalibrasi alat dengan cepat di lapangan.
          </p>
        </div>
        <div className="flex space-x-2">
          {!useCamera ? (
            <button
              onClick={startCamera}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-2 transition cursor-pointer"
            >
              <Camera size={16} />
              <span>Aktifkan Kamera Scan</span>
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-2 transition cursor-pointer"
            >
              <CameraOff size={16} />
              <span>Matikan Kamera</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 5 Columns: Scanner Viewport */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Scanner Window */}
          <div className="bg-slate-950 rounded-2xl overflow-hidden aspect-square border-4 border-slate-900 shadow-xl relative flex flex-col items-center justify-center">
            
            <div 
              id="qr-reader" 
              className={`w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full [&_video]:rounded-2xl [&>div]:w-full [&>div]:h-full ${!useCamera ? 'hidden' : 'block'}`}
            />
            
            {!useCamera && (
              <div className="p-8 text-center text-slate-400 space-y-4">
                <QrCode className="mx-auto text-indigo-500 animate-pulse" size={64} />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">Kamera Belum Aktif</p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Gunakan tombol "Aktifkan Kamera" di kanan atas atau gunakan simulasi barcode di panel kanan.
                  </p>
                </div>
              </div>
            )}

            {/* Laser scanning line effect overlay */}
            {(useCamera || scanning) && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-12">
                {/* Visual frame corners */}
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-4 border-l-4 border-indigo-400" />
                  <div className="w-6 h-6 border-t-4 border-r-4 border-indigo-400" />
                </div>
                
                {/* Scanning line laser */}
                <div className="w-full h-1 bg-red-500 shadow-lg shadow-red-500 animate-[bounce_2s_infinite]" />
                
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-b-4 border-l-4 border-indigo-400" />
                  <div className="w-6 h-6 border-b-4 border-r-4 border-indigo-400" />
                </div>
              </div>
            )}

            {/* Processing state backdrop */}
            <AnimatePresence>
              {scanning && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center text-white"
                >
                  <Sparkles className="text-indigo-400 animate-spin mb-2" size={32} />
                  <p className="text-xs font-bold tracking-wider animate-pulse uppercase">Mengidentifikasi Kode QR...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Camera Selection Dropdown */}
          {cameras.length > 1 && useCamera && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 shadow-xs flex items-center space-x-3 text-xs">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] shrink-0">Sumber Kamera:</span>
              <select
                value={selectedCameraId}
                onChange={(e) => handleCameraChange(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {cameras.map(cam => (
                  <option key={cam.id} value={cam.id}>
                    {cam.label || `Kamera ${cam.id.substring(0, 5)}...`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {cameraError && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2 text-xs text-amber-800 leading-relaxed">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Quick Manual Code Finder */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Ketik Manual ID Alat</h3>
            <div className="flex space-x-2">
              <select
                value={selectedSimId}
                onChange={(e) => setSelectedSimId(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Pilih Alat Laboratorium --</option>
                {equipmentList.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.id} - {eq.name}</option>
                ))}
              </select>
              <button
                disabled={!selectedSimId || scanning}
                onClick={() => handleScanSimulation(selectedSimId)}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold px-4 py-2 rounded-lg transition shrink-0 cursor-pointer"
              >
                Simulasi Scan
              </button>
            </div>
          </div>

        </div>

        {/* Right 7 Columns: Scan Result Panel */}
        <div className="lg:col-span-7">
          
          <AnimatePresence mode="wait">
            {scanResult ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md space-y-6"
              >
                {/* Result Header */}
                <div className={`p-6 text-white flex items-center justify-between ${
                  scanResult.status === 'valid' ? 'bg-emerald-600' :
                  scanResult.status === 'warning' ? 'bg-amber-500' :
                  scanResult.status === 'expired' ? 'bg-rose-600' :
                  'bg-blue-600'
                }`}>
                  <div className="flex items-center space-x-3">
                    {scanResult.status === 'valid' ? (
                      <CheckCircle className="text-white shrink-0" size={32} />
                    ) : scanResult.status === 'warning' ? (
                      <AlertTriangle className="text-white shrink-0" size={32} />
                    ) : (
                      <XCircle className="text-white shrink-0" size={32} />
                    )}
                    <div>
                      <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded uppercase">
                        {scanResult.id}
                      </span>
                      <h2 className="text-lg font-bold mt-1 leading-tight">{scanResult.name}</h2>
                    </div>
                  </div>
                  
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                    {scanResult.status === 'valid' ? 'KALIBRASI VALID' :
                     scanResult.status === 'warning' ? 'BUTUH KALIBRASI' :
                     scanResult.status === 'expired' ? 'DILARANG PAKAI' : 'SEDANG DIKALIBRASI'}
                  </span>
                </div>

                {/* Result Details */}
                <div className="px-6 space-y-6">
                  
                  {/* Status Banner Text */}
                  <div className={`p-4 rounded-xl border ${
                    scanResult.status === 'valid' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                    scanResult.status === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                    'bg-rose-50 border-rose-100 text-rose-800'
                  }`}>
                    <p className="text-xs font-bold leading-relaxed">
                      {scanResult.status === 'valid' ? '✅ Alat terkalibrasi sempurna dengan deviasi di batas aman. Layak digunakan untuk sampling.' :
                       scanResult.status === 'warning' ? '⚠️ Alat masih sah digunakan, namun masa berlaku hampir berakhir. Hubungi penanggung jawab segera.' :
                       '❌ PERINGATAN: Alat ini tidak boleh digunakan karena sertifikat kalibrasinya telah kadaluarsa! Hasil sampling terancam tidak valid.'}
                    </p>
                  </div>

                  {/* Identification Card */}
                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Merek / Model</p>
                      <p className="text-slate-800 font-semibold text-sm mt-0.5">{scanResult.model}</p>
                      <p className="text-slate-500 font-mono text-[10px] mt-0.5">S/N: {scanResult.serialNumber}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Lokasi Penempatan</p>
                      <p className="text-slate-800 font-semibold text-sm mt-0.5">{scanResult.location}</p>
                    </div>

                    {scanResult.inventoryNumber && (
                      <div className="pt-3 border-t border-slate-200/50">
                        <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">No. Inventaris Alat</p>
                        <p className="text-indigo-600 font-bold text-sm mt-0.5">{scanResult.inventoryNumber}</p>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-200/50">
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Titik Kalibrasi</p>
                      <p className="text-slate-700 font-semibold mt-0.5">{scanResult.calibrationPoints || 'Default Setpoint'}</p>
                    </div>

                    <div className="col-span-2 pt-3 border-t border-slate-200/50">
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Penanggung Jawab Alat (PIC)</p>
                      <p className="text-slate-800 font-semibold mt-0.5">{scanResult.responsiblePerson}</p>
                      <p className="text-slate-500">{scanResult.responsibleEmail}</p>
                    </div>
                    <div className="pt-3 border-t border-slate-200/50">
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Tgl Kalibrasi Terakhir</p>
                      <p className="text-slate-800 font-semibold mt-0.5">{formatDateIndo(scanResult.lastCalibrationDate)}</p>
                    </div>
                    <div className="pt-3 border-t border-slate-200/50">
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Jatuh Tempo Kalibrasi</p>
                      <p className="text-rose-600 font-bold mt-0.5">{formatDateIndo(scanResult.nextCalibrationDate)}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">
                        ({getDaysRemaining(scanResult.nextCalibrationDate) < 0 ? 'Kadaluarsa' : `${getDaysRemaining(scanResult.nextCalibrationDate)} hari lagi`})
                      </p>
                    </div>

                    {/* Direct link segment */}
                    {scannedLink && (
                      <div className="col-span-2 pt-3 border-t border-slate-200/50">
                        <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-1">Tautan Akses Langsung (Direct URL)</p>
                        <div className="flex items-center space-x-2 bg-white px-2 py-1.5 rounded-lg border border-slate-200/60 font-mono text-[10px] text-slate-600 overflow-hidden">
                          <span className="truncate flex-1">{scannedLink}</span>
                          <button
                            onClick={handleCopyLink}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition shrink-0 cursor-pointer ${
                              copySuccess 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {copySuccess ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Quick actions inside card */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      onSelectEquipment(scanResult.id);
                      onNavigate('alat');
                    }}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    <Smartphone size={15} />
                    <span>Lihat Riwayat & Sertifikat Alat</span>
                  </button>
                  <button
                    onClick={() => onNavigate('penggunaan')}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    <Clock size={15} />
                    <span>Mulai Pakai Alat Ini</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400 space-y-4">
                <Smartphone className="mx-auto text-slate-300" size={48} />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">Menunggu Pemindaian QR Code</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Arahkan kamera ke QR Code di fisik alat sampling, atau pilih alat pada menu drop-down di sebelah kiri untuk menyimulasikan akses lapangan secara instan.
                  </p>
                </div>
                
                {/* Visual guide steps */}
                <div className="grid grid-cols-3 gap-2 pt-6 max-w-md mx-auto text-[10px] font-semibold text-slate-500">
                  <div className="space-y-1">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">1</div>
                    <p>Dekati Alat</p>
                  </div>
                  <div className="space-y-1">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">2</div>
                    <p>Scan Label QR</p>
                  </div>
                  <div className="space-y-1">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">3</div>
                    <p>Status Valid Muncul</p>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
