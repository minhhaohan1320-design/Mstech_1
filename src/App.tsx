/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { getAuth, onAuthStateChanged, signOut, User, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { db, auth } from './lib/firebase';

import { Activity, Droplets, ThermometerSun, Leaf, RefreshCw, QrCode, LogOut, CheckCircle2, Zap, Menu, X, Plus, Trash2, MapPin, Database, Bell, Search, Settings, Sliders, FileText, TrendingUp, Bluetooth, ChevronDown, ChevronUp, Calendar, Upload, ExternalLink, AlertCircle, Rocket, BookOpen, Shield, Flame, Monitor } from 'lucide-react';
import QrScannerLib from 'qr-scanner';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Markdown from 'react-markdown';

const CHIBI_POSITIONS = {
  bloodAngel: { x: '0%', y: '0%' },
  ultramarine: { x: '100%', y: '0%' },
  imperialFist: { x: '0%', y: '50%' },
  whiteScar: { x: '100%', y: '50%' },
  salamander: { x: '0%', y: '100%' },
  ironHand: { x: '100%', y: '100%' },
} as const;

type ChibiChapter = keyof typeof CHIBI_POSITIONS;

const FALLBACK_ICONS: Record<ChibiChapter, { icon: any, color: string, bg: string }> = {
  bloodAngel: { icon: Rocket, color: "text-red-500", bg: "bg-red-100" },
  ultramarine: { icon: BookOpen, color: "text-blue-500", bg: "bg-blue-100" },
  imperialFist: { icon: Shield, color: "text-yellow-500", bg: "bg-yellow-100" },
  whiteScar: { icon: Zap, color: "text-purple-500", bg: "bg-purple-100" },
  salamander: { icon: Flame, color: "text-green-500", bg: "bg-green-100" },
  ironHand: { icon: Monitor, color: "text-gray-600", bg: "bg-gray-200" }
};

const ChibiMarine = ({ chapter, className = "" }: { chapter: ChibiChapter, className?: string }) => {
  const [spriteUrl, setSpriteUrl] = useState<string | null>(null);

  useEffect(() => {
    setSpriteUrl(localStorage.getItem('chibiSprite'));
    const handleUpdate = () => setSpriteUrl(localStorage.getItem('chibiSprite'));
    window.addEventListener('chibiSpriteUpdated', handleUpdate);
    return () => window.removeEventListener('chibiSpriteUpdated', handleUpdate);
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        localStorage.setItem('chibiSprite', result);
        setSpriteUrl(result);
        window.dispatchEvent(new Event('chibiSpriteUpdated'));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!spriteUrl) {
    return (
      <div className={`w-full h-full bg-gray-50 flex flex-col items-center justify-center text-center p-1 rounded-full border-2 border-dashed border-gray-300 relative cursor-pointer hover:bg-gray-100 transition-colors ${className}`}>
        <Upload className="w-5 h-5 text-gray-400 mb-1" />
        <span className="text-[7px] font-bold text-gray-500 leading-tight">Bấm tải<br/>ảnh minh họa</span>
        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} />
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      title={`Warhammer 40k Chibi ${chapter}`}
    >
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${spriteUrl})`,
          backgroundSize: '200% 300%',
          backgroundPosition: `${CHIBI_POSITIONS[chapter].x} ${CHIBI_POSITIONS[chapter].y}`,
          backgroundRepeat: 'no-repeat'
        }}
      />
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const loggedInPhone = user?.phoneNumber || user?.email || null;
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isProcessingQR, setIsProcessingQR] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [manualInput, setManualInput] = useState('');

  // Auth States
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
        }
      })
      .catch((error) => {
        console.error("Redirect auth error:", error);
      });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    setPopupBlocked(false);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Google login error:", error);
      if (error.code === 'auth/popup-blocked') {
        setPopupBlocked(true);
        setAuthError("Trình duyệt đang chặn cửa sổ Popup đăng nhập. Bạn hãy bấm nút 'Mở trong Tab mới' bên dưới để đăng nhập.");
        if (typeof window !== 'undefined' && window.self === window.top) {
          try {
            await signInWithRedirect(auth, new GoogleAuthProvider());
            return;
          } catch (e) {
            console.error("Redirect fallback error:", e);
          }
        }
      } else if (error.code === 'auth/unauthorized-domain') {
        setAuthError("Domain chưa được cấp quyền trên Firebase. Vui lòng kiểm tra Authorized Domains trên Firebase Console.");
      } else {
        setAuthError(error.message || "Đăng nhập Google thất bại. Vui lòng thử lại.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRedirectLogin = async () => {
    setAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("Redirect login error:", error);
      setAuthError(error.message || "Không thể chuyển hướng đăng nhập.");
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setDeviceId(null);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Camera Scanner States
  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const qrScannerRef = React.useRef<any>(null);
  
  // Data States
  const [sensorData, setSensorData] = useState<any>(null);
  const [calibrationData, setCalibrationData] = useState<any>(null);
  const [ownerPhone, setOwnerPhone] = useState<string | null>(null);
  const [isCalibModalOpen, setIsCalibModalOpen] = useState(false);
  const [tempCalib, setTempCalib] = useState({ n: 0, p: 0, k: 0, moisture: 0, soilTemp: 0, ph: 0, waterTemp: 0 });
  const [isCommandingSoil, setIsCommandingSoil] = useState(false);
  const [isCommandingWater, setIsCommandingWater] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Connection State
  const [isConnected, setIsConnected] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // New UI States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeZone, setActiveZone] = useState('khu-vuon-a');
  const [inputTab, setInputTab] = useState('dat');
  const [showWifiModal, setShowWifiModal] = useState(false);
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [isUpdatingWifi, setIsUpdatingWifi] = useState(false);

  // Crop Information
  const [cropName, setCropName] = useState('');
  const [cropVariety, setCropVariety] = useState('');
  const [location, setLocation] = useState('Bắc Giang');

  // AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // SD Card State
  const [isSyncingSd, setIsSyncingSd] = useState(false);
  const [sdDataList, setSdDataList] = useState<any[]>([]);
  const [expandedSdDate, setExpandedSdDate] = useState<string | null>(null);
  const [loadedSdRecord, setLoadedSdRecord] = useState<any | null>(null);

  // Listen to Firebase when a device is selected
  useEffect(() => {
    if (!deviceId) {
      setSensorData(null);
      setIsConnected(false);
      setSdDataList([]);
      return;
    }

    const dataRef = ref(db, `/Stations/${deviceId}/Data`);
    const cmdSoilRef = ref(db, `/Stations/${deviceId}/Command/read_soil`);
    const cmdWaterRef = ref(db, `/Stations/${deviceId}/Command/read_water`);
    const cmdSdRef = ref(db, `/Stations/${deviceId}/Command/sync_sd`);
    const sdDataRef = ref(db, `/Stations/${deviceId}/SD_Data`);
    const calibRef = ref(db, `/Stations/${deviceId}/Calibration`);
    const ownerRef = ref(db, `/Stations/${deviceId}/OwnerPhone`);

    const unsubscribeCalib = onValue(calibRef, (snapshot) => {
      setCalibrationData(snapshot.val() || null);
    });
    const unsubscribeOwner = onValue(ownerRef, (snapshot) => {
      setOwnerPhone(snapshot.val() || null);
    });

    // Listen for data updates
    const unsubscribeData = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        setSensorData(snapshot.val());
        setLastUpdated(new Date());
        setIsConnected(true);
      } else {
        setSensorData(null);
        setIsConnected(false);
      }
    });

    // Listen to command status to turn off loading
    const unsubscribeCmdSoil = onValue(cmdSoilRef, (snapshot) => {
      if (snapshot.exists() && snapshot.val() === false) {
        setIsCommandingSoil(false);
      }
    });

    const unsubscribeCmdWater = onValue(cmdWaterRef, (snapshot) => {
      if (snapshot.exists() && snapshot.val() === false) {
        setIsCommandingWater(false);
      }
    });

    const unsubscribeCmdSd = onValue(cmdSdRef, (snapshot) => {
      if (snapshot.exists() && snapshot.val() === false) {
        setIsSyncingSd(false);
      }
    });

    const unsubscribeSdData = onValue(sdDataRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        // Convert object to array and reverse to show newest first
        const list = Object.keys(val).map(key => ({ id: key, ...val[key] })).reverse();
        setSdDataList(list);
      } else {
        setSdDataList([]);
      }
    });

    return () => {
      unsubscribeData();
      unsubscribeCmdSoil();
      unsubscribeCmdWater();
      unsubscribeCmdSd();
      unsubscribeSdData();
      unsubscribeCalib();
      unsubscribeOwner();
    };
  }, [deviceId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingQR(true);
    setLoginError(null);

    try {
      const result = await QrScannerLib.scanImage(file, { 
          returnDetailedScanResult: true,
          alsoTryWithoutScanRegion: true,
      });
      
      if (result && result.data) {
        const id = result.data.trim();
        if (/[.#$\[\]]/.test(id)) {
          setLoginError("Mã QR không hợp lệ. Vui lòng chỉ tải ảnh mã QR chứa Địa chỉ MAC (VD: AC51A9A5FC84)");
        } else {
          setDeviceId(id);
        }
      } else {
        setLoginError("Không tìm thấy mã QR trong ảnh. Vui lòng thử lại ảnh rõ nét hơn.");
      }
    } catch (err: any) {
      console.error(err);
      if (err === 'No QR code found') {
        setLoginError("Không tìm thấy mã QR. Vui lòng cắt gọn ảnh hoặc chụp rõ nét hơn.");
      } else {
        setLoginError("Lỗi đọc ảnh: " + err);
      }
    } finally {
      setIsProcessingQR(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // -------------------------------------------------------------
  // CAMERA SCANNER SETUP
  // -------------------------------------------------------------
  const stopCamera = () => {
    setIsScanningCamera(false);
  };

  const handleManualConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const id = manualInput.trim();
    if (id) {
      if (/[.#$\[\]]/.test(id)) {
        setLoginError("Mã trạm không được chứa các ký tự đặc biệt như: . # $ [ ]");
        return;
      }
      setLoginError(null);
      setDeviceId(id);
    }
  };

  const handleUpdateWifi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId || !wifiSsid) return;
    setIsUpdatingWifi(true);
    try {
      await set(ref(db, `/Stations/${deviceId}/Command/wifi_ssid`), wifiSsid.trim());
      await set(ref(db, `/Stations/${deviceId}/Command/wifi_pass`), wifiPass);
      await set(ref(db, `/Stations/${deviceId}/Command/update_wifi`), true);
      
      alert("Đã gửi lệnh đổi WiFi! Trạm sẽ khởi động lại và kết nối vào mạng mới.");
      setShowWifiModal(false);
      setWifiSsid('');
      setWifiPass('');
    } catch (error) {
      console.error("Lỗi cập nhật WiFi:", error);
      alert("Lỗi khi gửi lệnh.");
    } finally {
      setIsUpdatingWifi(false);
    }
  };

  const triggerReadSoil = async () => {
    if (!deviceId) return;
    setIsCommandingSoil(true);
    try {
      await set(ref(db, `/Stations/${deviceId}/Command/read_soil`), true);
    } catch (error) {
      console.error("Error sending command:", error);
      setIsCommandingSoil(false);
    }
  };

  const triggerReadWater = async () => {
    if (!deviceId) return;
    setIsCommandingWater(true);
    try {
      await set(ref(db, `/Stations/${deviceId}/Command/read_water`), true);
    } catch (error) {
      console.error("Error sending command:", error);
      setIsCommandingWater(false);
    }
  };

  const formatNumber = (num: any) => {
    if (num === null || num === undefined || isNaN(num)) return '--';
    return Number(num).toFixed(1);
  };

  const getAvg = (arr: any) => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return 0;
    const sum = arr.reduce((a, b) => a + (Number(b) || 0), 0);
    return sum / arr.length;
  };

  const isAdmin = ownerPhone ? loggedInPhone === ownerPhone : true;

  const processedData = React.useMemo(() => {
    const offsets = (isAdmin && calibrationData) ? calibrationData : { n: 0, p: 0, k: 0, moisture: 0, soilTemp: 0, ph: 0, waterTemp: 0 };
    
    if (loadedSdRecord) {
      return {
        n: (Number(loadedSdRecord.n) || 0) + (Number(offsets.n) || 0),
        p: (Number(loadedSdRecord.p) || 0) + (Number(offsets.p) || 0),
        k: (Number(loadedSdRecord.k) || 0) + (Number(offsets.k) || 0),
        moisture: (Number(loadedSdRecord.moisture) || 0) + (Number(offsets.moisture) || 0),
        soilTemp: (Number(loadedSdRecord.temp) || 0) + (Number(offsets.soilTemp) || 0),
        ph: (Number(loadedSdRecord.ph) || 0) + (Number(offsets.ph) || 0),
        waterTemp: 25 + (Number(offsets.waterTemp) || 0)
      };
    }

    if (!sensorData) return null;
    
    // 1. Calculate Averages from Raw Arrays
    const rawN = getAvg(sensorData.npk_data?.n);
    const rawP = getAvg(sensorData.npk_data?.p);
    const rawK = getAvg(sensorData.npk_data?.k);
    const rawMoist = getAvg(sensorData.do_am_dat);
    const rawSoilTemp = getAvg(sensorData.nhiet_do_dat);
    const rawPh = getAvg(sensorData.ph_data);
    const waterTemp = Number(sensorData.temp_nuoc) || 25; // Default 25C if missing
    
    // 2. Calibration Formulas (Original) + Offsets

    // Water Temp adjusts pH (-0.003 pH per degree C above 25)
    const phAdjusted = rawPh > 0 ? rawPh + 0.003 * (25 - waterTemp) : 0;
    
    // Soil Temp and Moisture adjusts NPK
    // Base conditions: 25C and 50% Moisture. If higher, sensor reads higher due to conductivity, so we compensate down.
    const tempComp = (25 - rawSoilTemp) * 0.01;
    const moistComp = (50 - rawMoist) * 0.005;
    const npkFactor = 1.0 + tempComp + moistComp;
    
    return {
      n: (rawN > 0 ? Math.max(0, rawN * npkFactor) : 0) + (Number(offsets.n) || 0),
      p: (rawP > 0 ? Math.max(0, rawP * npkFactor) : 0) + (Number(offsets.p) || 0),
      k: (rawK > 0 ? Math.max(0, rawK * npkFactor) : 0) + (Number(offsets.k) || 0),
      moisture: rawMoist + (Number(offsets.moisture) || 0),
      soilTemp: rawSoilTemp + (Number(offsets.soilTemp) || 0),
      ph: (phAdjusted > 0 ? Math.max(0, Math.min(14, phAdjusted)) : 0) + (Number(offsets.ph) || 0),
      waterTemp: waterTemp + (Number(offsets.waterTemp) || 0)
    };
  }, [sensorData, loadedSdRecord, calibrationData, isAdmin]);

  const [savedRecords, setSavedRecords] = useState<any[]>([]);

  const handleSaveData = () => {
    if (!processedData) {
      alert("Chưa có dữ liệu để lưu!");
      return;
    }
    
    const now = new Date();
    const dateStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    
    const newRecord = {
      name: dateStr,
      N: Number(processedData.n.toFixed(1)),
      P: Number(processedData.p.toFixed(1)),
      K: Number(processedData.k.toFixed(1)),
      Moisture: Number(processedData.moisture.toFixed(1)),
      Temp: Number(processedData.soilTemp.toFixed(1)),
      ph: Number(processedData.ph.toFixed(1)),
      waterTemp: Number(processedData.waterTemp.toFixed(1)),
    };
    
    setSavedRecords(prev => {
      const updated = [...prev, newRecord];
      if (updated.length > 12) return updated.slice(updated.length - 12);
      return updated;
    });
    
    alert("Đã lưu dữ liệu trung bình (đã tinh chỉnh) vào hệ thống biểu đồ!");
  };

  const handleAiAnalysis = async () => {
    if (!processedData) {
      alert("Chưa có dữ liệu cảm biến để phân tích!");
      return;
    }
    if (!cropName.trim()) {
      alert("Vui lòng nhập Tên cây trồng (ở Tầng 1) để AI có thể phân tích chính xác!");
      return;
    }

    setIsAnalyzing(true);
    setAiAnalysis(null);

    try {
      const fullCropName = cropVariety.trim() ? `${cropName} (${cropVariety})` : cropName;
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cropType: fullCropName,
          location: location,
          n: processedData.n.toFixed(1),
          p: processedData.p.toFixed(1),
          k: processedData.k.toFixed(1),
          moisture: processedData.moisture.toFixed(1),
          soilTemp: processedData.soilTemp.toFixed(1),
          ph: processedData.ph.toFixed(1),
          waterTemp: processedData.waterTemp.toFixed(1)
        })
      });

      const data = await response.json();
      if (response.ok) {
        setAiAnalysis(data.result);
      } else {
        alert(data.error || "Có lỗi xảy ra khi gọi AI.");
      }
    } catch (err) {
      console.error(err);
      alert("Không thể kết nối đến máy chủ AI.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSyncSd = () => {
    if (!deviceId) return;
    setIsSyncingSd(true);
    set(ref(db, `/Stations/${deviceId}/Command/sync_sd`), true);
  };

  const groupedSdData = React.useMemo(() => {
    return sdDataList.reduce((acc: any, curr: any) => {
      // Assuming timestamp is like "YYYY-MM-DD HH:MM:SS" or similar
      const date = curr.timestamp ? curr.timestamp.split('T')[0].split(' ')[0] : 'Unknown';
      if (!acc[date]) acc[date] = [];
      acc[date].push(curr);
      return acc;
    }, {});
  }, [sdDataList]);

  const handlePushToHistory = async (records: any[]) => {
    if (!deviceId || records.length === 0) return;
    try {
      const updates: any = {};
      const historyRef = ref(db, `/Stations/${deviceId}/History`);
      
      // We will push each record into History
      // Wait, firebase realtime database doesn't have a bulk push without replacing
      // The push() method generates a new key locally
      import('firebase/database').then(({ push, child, update }) => {
        records.forEach(r => {
          const newKey = push(child(ref(db), `Stations/${deviceId}/History`)).key;
          updates[`/Stations/${deviceId}/History/${newKey}`] = r;
        });
        update(ref(db), updates);
        alert(`Đã nạp ${records.length} bản ghi từ thẻ SD vào biểu đồ lịch sử!`);
        document.getElementById('tang4')?.scrollIntoView({behavior: 'smooth'});
      });
    } catch (e) {
      console.error(e);
      alert("Có lỗi xảy ra khi nạp vào lịch sử.");
    }
  };

  // -------------------------------------------------------------
  // LOGIN / CONNECT SCREEN
  // -------------------------------------------------------------
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-emerald-50/50 flex items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-emerald-50/50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100">
          <div className="bg-emerald-600 p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">M.S.Tech</h1>
            <p className="text-emerald-100">Hệ thống Quan trắc Nông nghiệp</p>
          </div>
          <div className="p-8 flex flex-col items-center">
            <p className="text-gray-600 text-center mb-6">Đăng nhập để kết nối với Trạm</p>

            {authError && (
              <div className="w-full mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-medium leading-relaxed">{authError}</p>
                  {popupBlocked && (
                    <p className="text-xs text-amber-800">
                      Mẹo: Hãy bấm nút <strong>"Mở trong Tab mới"</strong> bên dưới để mở ứng dụng ở cửa sổ riêng, popup Google sẽ không bị chặn.
                    </p>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-200 text-gray-700 font-bold py-4 px-6 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
            >
              {authLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 24c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 21.53 7.7 24 12 24z" />
                  <path fill="#FBBC05" d="M5.84 15.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V8.06H2.18C1.43 9.55 1 11.22 1 13s.43 3.45 1.18 4.94l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 4.8c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97 0 12 0 7.7 0 3.99 2.47 2.18 6.06l3.66 2.84c.87-2.6 3.3-4.1 6.16-4.1z" />
                </svg>
              )}
              <span>{authLoading ? "Đang xử lý..." : "Đăng nhập bằng Google"}</span>
            </button>

            {(isInIframe || popupBlocked) && (
              <a
                href={typeof window !== 'undefined' ? window.location.href : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-3 flex items-center justify-center space-x-2 bg-emerald-50 text-emerald-800 font-semibold py-3.5 px-6 rounded-2xl hover:bg-emerald-100 transition-colors border border-emerald-200 text-sm shadow-xs"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Mở trong Tab mới để đăng nhập</span>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!deviceId) {
    return (
      <div className="min-h-screen bg-emerald-50/50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100">
          <div className="bg-emerald-600 p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">M.S.Tech</h1>
            <p className="text-emerald-100">Hệ thống Quan trắc Nông nghiệp</p>
          </div>
          
          <div className="p-8">
            {isScanningCamera ? (
              <div className="mb-6 rounded-2xl overflow-hidden bg-black relative border-2 border-emerald-500 shadow-lg shadow-emerald-500/20">
                <Scanner
                  onScan={(detectedCodes) => {
                    if (detectedCodes && detectedCodes.length > 0) {
                      const id = detectedCodes[0].rawValue.trim();
                      if (/[.#$\[\]]/.test(id)) {
                        setLoginError("Mã QR không hợp lệ. Vui lòng quét mã chứa ID Trạm.");
                      } else {
                        setDeviceId(id);
                        stopCamera();
                      }
                    }
                  }}
                  onError={(error) => {
                    console.error("Camera Error:", error);
                    setLoginError("Không thể truy cập camera. Vui lòng kiểm tra quyền.");
                    stopCamera();
                  }}
                  constraints={{ facingMode: "environment" }}
                />
                <button 
                  onClick={stopCamera}
                  className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm font-medium bg-black/50 py-1 z-10">
                  Đưa mã QR vào khung hình
                </p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => { setLoginError(null); setIsScanningCamera(true); }}
                  className="w-full flex items-center justify-center space-x-3 bg-emerald-600 text-white font-semibold py-4 px-6 rounded-2xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20"
                >
                  <QrCode className="w-6 h-6" />
                  <span>Quét QR bằng Camera</span>
                </button>

                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingQR}
                  className="w-full flex items-center justify-center space-x-3 bg-emerald-50 text-emerald-700 font-semibold py-3 px-6 rounded-2xl hover:bg-emerald-100 transition-colors border border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingQR ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang xử lý ảnh...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5" />
                      <span>Tải ảnh QR từ thư viện</span>
                    </>
                  )}
                </button>
              </div>
            )}
            
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-emerald-200"></div>
              <span className="flex-shrink-0 mx-4 text-emerald-600/70 text-sm">Hoặc nhập thủ công</span>
              <div className="flex-grow border-t border-emerald-200"></div>
            </div>

            <form onSubmit={handleManualConnect} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-emerald-900 mb-1">Mã Trạm (Địa chỉ MAC)</label>
                <input
                  type="text"
                  placeholder="VD: AC51A9A5FC84"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
                />
              </div>
              
              {loginError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                  <p className="text-sm text-red-700">{loginError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!manualInput.trim()}
                className="w-full bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Kết nối
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // DASHBOARD SCREEN
  // -------------------------------------------------------------
  const chartData = savedRecords;

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans relative">
      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
      
      {/* Drawer Menu */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">M.S.Tech AI</h2>
          <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 flex-1 flex flex-col overflow-y-auto space-y-2">
          {loggedInPhone && (
            <div className="flex items-center space-x-3 p-4 mb-2 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">
                {loggedInPhone.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">Người dùng</p>
                <p className="text-xs text-gray-500 truncate">{loggedInPhone}</p>
              </div>
            </div>
          )}
          <button 
            onClick={() => { setInputTab('dat'); setIsDrawerOpen(false); document.getElementById('tang2')?.scrollIntoView({behavior: 'smooth'}); }}
            className={`w-full flex items-center space-x-3 p-4 rounded-2xl font-medium transition-colors ${inputTab === 'dat' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Leaf className={`w-5 h-5 ${inputTab === 'dat' ? 'text-emerald-500' : 'text-gray-400'}`} />
            <span>Phân tích Đất</span>
          </button>
          <button 
            onClick={() => { setInputTab('nuoc'); setIsDrawerOpen(false); document.getElementById('tang2')?.scrollIntoView({behavior: 'smooth'}); }}
            className={`w-full flex items-center space-x-3 p-4 rounded-2xl font-medium transition-colors ${inputTab === 'nuoc' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Droplets className={`w-5 h-5 ${inputTab === 'nuoc' ? 'text-emerald-500' : 'text-gray-400'}`} />
            <span>Phân tích Nước</span>
          </button>
          <button 
            onClick={() => { setIsDrawerOpen(false); document.getElementById('tang4')?.scrollIntoView({behavior: 'smooth'}); }}
            className="w-full flex items-center space-x-3 p-4 text-gray-600 hover:bg-gray-50 rounded-2xl font-medium transition-colors"
          >
            <Database className="w-5 h-5 text-gray-400" />
            <span>Dữ liệu lịch sử</span>
          </button>
          <button 
            onClick={() => { setIsDrawerOpen(false); alert('Tính năng Cảnh báo tự động đang được phát triển...'); }}
            className="w-full flex items-center space-x-3 p-4 text-gray-600 hover:bg-gray-50 rounded-2xl font-medium transition-colors"
          >
            <Bell className="w-5 h-5 text-red-400" />
            <span>Cảnh báo chỉ số</span>
          </button>
          <button 
            onClick={() => { setShowWifiModal(true); setIsDrawerOpen(false); }} 
            className="w-full flex items-center space-x-3 p-4 text-gray-600 hover:bg-gray-50 rounded-2xl font-medium transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-400" />
            <span>Cấu hình WiFi cho Trạm</span>
          </button>
          <button 
            onClick={() => { 
              setIsDrawerOpen(false); 
              setTempCalib(calibrationData || { n: 0, p: 0, k: 0, moisture: 0, soilTemp: 0, ph: 0, waterTemp: 0 });
              setIsCalibModalOpen(true);
            }} 
            className="w-full flex items-center space-x-3 p-4 text-gray-600 hover:bg-gray-50 rounded-2xl font-medium transition-colors"
          >
            <Sliders className="w-5 h-5 text-gray-400" />
            <span>Hiệu chỉnh cảm biến</span>
          </button>
          
          <div className="mt-auto pt-4 space-y-2">
            <button 
              onClick={() => { setDeviceId(null); setIsDrawerOpen(false); }} 
              className="w-full flex items-center space-x-3 p-4 text-orange-600 hover:bg-orange-50 rounded-2xl font-medium transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Đổi Trạm (Ngắt kết nối)</span>
            </button>
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center space-x-3 p-4 text-rose-600 hover:bg-rose-50 rounded-2xl font-medium transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Đăng xuất Tài khoản</span>
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white sticky top-0 z-30 px-4 py-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-900 text-white font-bold rounded-xl flex items-center justify-center text-lg">
            MS
          </div>
          <span className="text-xl font-bold text-gray-900">M.S.Tech</span>
        </div>
        <button onClick={() => setIsDrawerOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-6 mt-4">
        
        {/* Title Section */}
        <div className="text-center space-y-2 mb-8">
          <div className="flex items-center justify-center space-x-2 text-amber-600 font-semibold text-sm uppercase tracking-wider">
            <Leaf className="w-4 h-4" />
            <span>Mùa Thu - Bắc Giang</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Hệ Thống M.S.Tech 2.0</h1>
          <p className="text-gray-500">Trung tâm điều khiển nông nghiệp thông minh 4 tầng</p>
        </div>

        {/* TẦNG 1 */}
        <section className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center border border-emerald-200">
              1
            </div>
            <h2 className="text-lg font-bold text-emerald-600 uppercase tracking-wide">Tầng 1: Quản lý khu vực</h2>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-6">
            
            {/* Chibi Imperial Fist Illustration */}
            <div className="flex flex-col items-center justify-center py-2">
               <div className="w-24 h-24 bg-yellow-50 rounded-full border-4 border-yellow-200 flex items-center justify-center overflow-hidden relative shadow-sm">
                  <ChibiMarine chapter="imperialFist" className="w-[120%] h-[120%]" />
               </div>
               <div className="mt-2 text-[10px] text-gray-400 font-medium uppercase tracking-widest text-center px-4">
                 <span className="text-yellow-600 font-bold">Imperial Fist</span> đang thiết lập hàng phòng ngự (chọn khu vực)
               </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Chọn khu vực đang tác động</p>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setActiveZone('khu-vuon-a')}
                  className={`px-4 py-2 rounded-xl flex items-center space-x-2 font-medium transition-colors ${activeZone === 'khu-vuon-a' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}
                >
                  <Leaf className="w-4 h-4" />
                  <span>Khu Vườn A (Đất)</span>
                </button>
                <button 
                  onClick={() => setActiveZone('he-thong-tuoi')}
                  className={`px-4 py-2 rounded-xl flex items-center space-x-2 font-medium transition-colors ${activeZone === 'he-thong-tuoi' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}
                >
                  <Droplets className="w-4 h-4" />
                  <span>Hệ Thống Tưới (Nước)</span>
                </button>
                <button className="px-4 py-2 rounded-xl bg-gray-50 text-gray-600 border border-gray-200 font-medium flex items-center space-x-2">
                  <Leaf className="w-4 h-4 text-gray-400" />
                  <span>Khu đất mới 2</span>
                </button>
                <button className="w-10 h-10 rounded-xl bg-gray-50 text-emerald-600 border border-emerald-200 font-medium flex items-center justify-center hover:bg-emerald-50">
                  <Plus className="w-5 h-5" />
                </button>
                <button className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 font-medium flex items-center space-x-1">
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa</span>
                </button>
                <button className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-medium">
                  Reset Hết
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Thông tin canh tác</p>
              <div className="space-y-4">
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Vị trí ruộng (Vd: Bắc Giang, Đà Lạt...)" 
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-700" 
                />
                <input 
                  type="text" 
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder="Tên cây (Vd: Vải thiều)" 
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-700" 
                />
                <input 
                  type="text" 
                  value={cropVariety}
                  onChange={(e) => setCropVariety(e.target.value)}
                  placeholder="Giống (Vd: Thanh Hà)" 
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-700" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* TẦNG 2 */}
        <section id="tang2" className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center border border-emerald-200">
              2
            </div>
            <h2 className="text-lg font-bold text-emerald-600 uppercase tracking-wide">Tầng 2: Nhập liệu Đất & Nước</h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-6">
            
            {/* Chibi Salamander Illustration */}
            <div className="flex flex-col items-center justify-center py-2">
               <div className="w-24 h-24 bg-green-50 rounded-full border-4 border-emerald-100 flex items-center justify-center overflow-hidden relative shadow-sm">
                  <ChibiMarine chapter="salamander" className="w-20 h-20" />
               </div>
               <div className="mt-2 text-[10px] text-gray-400 font-medium uppercase tracking-widest text-center px-4">
                 <span className="text-emerald-600 font-bold">Salamander</span> đang ghi chép chỉ số
               </div>
            </div>

            {loadedSdRecord && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-amber-700">Đang xem dữ liệu SD nạp thủ công</p>
                  <p className="text-xs text-amber-600">Ngày giờ: {loadedSdRecord.timestamp}</p>
                </div>
                <button 
                  onClick={() => setLoadedSdRecord(null)}
                  className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-amber-200 transition-colors"
                >
                  HỦY NẠP
                </button>
              </div>
            )}

            {/* Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-2xl">
              <button 
                onClick={() => setInputTab('dat')}
                className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${inputTab === 'dat' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Đất
              </button>
              <button 
                onClick={() => setInputTab('nuoc')}
                className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${inputTab === 'nuoc' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Nước
              </button>
            </div>

            {/* Sensor Data Grid */}
            {inputTab === 'dat' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-2">ĐẠM (N)</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-black text-gray-900 flex items-center">
                      <span className="text-blue-600 mr-2 text-xl">N</span>
                      {formatNumber(processedData?.n)}
                    </span>
                    <span className="text-xs text-gray-400 font-medium mb-1">mg/kg</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-2">LÂN (P)</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-black text-gray-900 flex items-center">
                      <span className="text-orange-500 mr-2 text-xl">P</span>
                      {formatNumber(processedData?.p)}
                    </span>
                    <span className="text-xs text-gray-400 font-medium mb-1">mg/kg</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-2">KALI (K)</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-black text-gray-900 flex items-center">
                      <span className="text-purple-600 mr-2 text-xl">K</span>
                      {formatNumber(processedData?.k)}
                    </span>
                    <span className="text-xs text-gray-400 font-medium mb-1">mg/kg</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-2">ĐỘ ẨM</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-black text-gray-900 flex items-center">
                      <Droplets className="w-5 h-5 text-blue-400 mr-2" />
                      {formatNumber(processedData?.moisture)}
                    </span>
                    <span className="text-xs text-gray-400 font-medium mb-1">%</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 col-span-2 flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-500">NHIỆT ĐỘ ĐẤT</p>
                  <div className="flex items-end space-x-2">
                    <span className="text-2xl font-black text-gray-900 flex items-center">
                      <ThermometerSun className="w-5 h-5 text-amber-500 mr-2" />
                      {formatNumber(processedData?.soilTemp)}
                    </span>
                    <span className="text-xs text-gray-400 font-medium mb-1">°C</span>
                  </div>
                </div>
              </div>
            )}

            {inputTab === 'nuoc' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-2">ĐỘ pH NƯỚC</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-black text-gray-900 flex items-center">
                      <Activity className="w-5 h-5 text-emerald-500 mr-2" />
                      {formatNumber(processedData?.ph)}
                    </span>
                    <span className="text-xs text-gray-400 font-medium mb-1">pH</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-2">NHIỆT ĐỘ NƯỚC</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-black text-gray-900 flex items-center">
                      <ThermometerSun className="w-5 h-5 text-rose-500 mr-2" />
                      {formatNumber(processedData?.waterTemp)}
                    </span>
                    <span className="text-xs text-gray-400 font-medium mb-1">°C</span>
                  </div>
                </div>
              </div>
            )}

            {/* Sync Button */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={triggerReadSoil}
                disabled={isCommandingSoil}
                className={`w-full py-4 rounded-2xl font-bold flex flex-col items-center justify-center space-y-1 transition-all shadow-md ${
                  isCommandingSoil
                    ? 'bg-amber-100 text-amber-700 cursor-not-allowed'
                    : 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-600/20'
                }`}
              >
                <RefreshCw className={`w-5 h-5 ${isCommandingSoil ? 'animate-spin' : ''}`} />
                <span className="text-sm">{isCommandingSoil ? 'ĐANG GỬI...' : 'ĐO ĐẤT'}</span>
              </button>

              <button 
                onClick={triggerReadWater}
                disabled={isCommandingWater}
                className={`w-full py-4 rounded-2xl font-bold flex flex-col items-center justify-center space-y-1 transition-all shadow-md ${
                  isCommandingWater
                    ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20'
                }`}
              >
                <RefreshCw className={`w-5 h-5 ${isCommandingWater ? 'animate-spin' : ''}`} />
                <span className="text-sm">{isCommandingWater ? 'ĐANG GỬI...' : 'ĐO NƯỚC'}</span>
              </button>
            </div>
            
            <div className="flex justify-center items-center space-x-2 text-sm mt-4">
              <span className="relative flex h-3 w-3">
                {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
              </span>
              <span className={isConnected ? 'text-emerald-600 font-medium' : 'text-gray-400 font-medium'}>
                {isConnected ? 'Đã kết nối với Trạm' : 'Đang chờ Trạm phản hồi...'}
              </span>
            </div>

            {/* Info Fields */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 font-medium flex-1 text-sm italic">Đang lấy tọa độ...</span>
                <span className="text-xs text-gray-400 font-bold">GPS</span>
              </div>
              <div className="relative">
                <input type="text" placeholder={activeZone === 'khu-vuon-a' ? "Khu Vườn A (Đất)" : "Hệ Thống Tưới (Nước)"} className="w-full pl-4 pr-16 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium text-gray-700" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">TÊN</span>
              </div>
            </div>

            {/* Average Values Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">Giá trị trung bình (Đã tinh chỉnh)</p>
              
              {inputTab === 'dat' ? (
                <div className="grid grid-cols-2 gap-y-6">
                  <div>
                    <p className="text-xs text-gray-400 font-bold mb-1">N</p>
                    <p className="text-2xl font-black text-emerald-600">{formatNumber(processedData?.n)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold mb-1">P</p>
                    <p className="text-2xl font-black text-emerald-600">{formatNumber(processedData?.p)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold mb-1">K</p>
                    <p className="text-2xl font-black text-emerald-600">{formatNumber(processedData?.k)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold mb-1">MOISTURE</p>
                    <p className="text-2xl font-black text-emerald-600">{formatNumber(processedData?.moisture)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 font-bold mb-1">TEMP</p>
                    <p className="text-2xl font-black text-emerald-600">{formatNumber(processedData?.soilTemp)}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-y-6">
                  <div>
                    <p className="text-xs text-gray-400 font-bold mb-1">PH</p>
                    <p className="text-2xl font-black text-emerald-600">{formatNumber(processedData?.ph)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold mb-1">TEMP</p>
                    <p className="text-2xl font-black text-emerald-600">{formatNumber(processedData?.waterTemp)}</p>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={handleSaveData}
              className="w-full py-4 bg-emerald-100 text-emerald-700 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-emerald-200 transition-colors"
            >
              <Database className="w-5 h-5" />
              <span>LƯU DỮ LIỆU VÀO BIỂU ĐỒ</span>
            </button>
          </div>
        </section>

        {/* TẦNG 3 */}
        <section className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center border border-emerald-200">
              3
            </div>
            <h2 className="text-lg font-bold text-emerald-600 uppercase tracking-wide">Tầng 3: AI tổng hợp & xuất báo cáo</h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 space-y-6">
            
            {/* Chibi Ultramarine Illustration */}
            <div className="flex flex-col items-center justify-center py-2">
               <div className="w-24 h-24 bg-blue-50 rounded-full border-4 border-blue-100 flex items-center justify-center overflow-hidden relative shadow-sm">
                  <ChibiMarine chapter="ultramarine" className="w-20 h-20" />
               </div>
               <div className="mt-2 text-[10px] text-gray-400 font-medium uppercase tracking-widest text-center px-4">
                 <span className="text-blue-600 font-bold">Ultramarine</span> đang {isAnalyzing ? 'gõ báo cáo...' : 'chờ lệnh'}
               </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-700 max-w-[150px] leading-tight flex items-center gap-2">
                <Zap className="w-5 h-5 flex-shrink-0" />
                PHÂN TÍCH TỔNG HỢP ĐẤT-NƯỚC
              </h3>
              <button 
                onClick={handleAiAnalysis}
                disabled={isAnalyzing || !processedData}
                className="bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold text-sm shadow-md shadow-emerald-200 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    ĐANG XỬ LÝ...
                  </>
                ) : (
                  "PHÂN TÍCH NGAY"
                )}
              </button>
            </div>
            
            {aiAnalysis ? (
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 mt-4 text-sm text-gray-800">
                <div className="markdown-body prose prose-sm prose-emerald max-w-none">
                  <Markdown>{aiAnalysis}</Markdown>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Bấm "Phân tích ngay" để AI tổng hợp dữ liệu toàn vườn...</p>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Quản lý dữ liệu dài hạn</h3>
            <p className="text-sm text-gray-500">Hệ thống sẽ tổng hợp 12 tháng dữ liệu thành một file PDF chuyên nghiệp để lưu trữ hoặc gửi báo cáo.</p>
            
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">Số bản ghi hiện có:</span>
              <span className="text-xl font-black text-emerald-600">{savedRecords.length}/12</span>
            </div>
            
            <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-xl border border-gray-100">
              Lưu ý: Bạn nên lưu ít nhất 1 bản ghi mỗi tháng để có báo cáo chu kỳ 1 năm chính xác nhất.
            </p>

            <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors">
              <FileText className="w-5 h-5" />
              <span>XUẤT BÁO CÁO PDF (12 THÁNG)</span>
            </button>
          </div>
        </section>

        {/* TẦNG 4 */}
        <section id="tang4" className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center border border-emerald-200">
              4
            </div>
            <h2 className="text-lg font-bold text-emerald-600 uppercase tracking-wide">Tầng 4: Biểu đồ trực quan & AI chiến lược</h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-8">
            
            {/* Chibi Iron Hand Illustration */}
            <div className="flex flex-col items-center justify-center py-2">
               <div className="w-24 h-24 bg-gray-100 rounded-full border-4 border-gray-300 flex items-center justify-center overflow-hidden relative shadow-sm">
                  <ChibiMarine chapter="ironHand" className="w-[120%] h-[120%]" />
               </div>
               <div className="mt-2 text-[10px] text-gray-400 font-medium uppercase tracking-widest text-center px-4">
                 <span className="text-gray-700 font-bold">Iron Hand</span> đang giám sát biến động dữ liệu
               </div>
            </div>

            {/* Chart 1: NPK */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  BIỂU ĐỒ DINH DƯỠNG (N-P-K)
                </h3>
                <span className="text-xs text-gray-400 font-medium">Đơn vị: mg/kg</span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} dx={-10} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Line type="monotone" dataKey="N" stroke="#3B82F6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                    <Line type="monotone" dataKey="P" stroke="#F97316" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
                    <Line type="monotone" dataKey="K" stroke="#9333EA" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Temp */}
            <div className="border-t border-gray-100 pt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  TAM GIÁC NHIỆT (ĐẤT & NƯỚC)
                </h3>
                <span className="text-xs text-gray-400 font-medium">Đơn vị: °C</span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} dx={-10} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Line type="monotone" dataKey="Temp" name="Nhiệt độ Đất" stroke="#F43F5E" strokeWidth={3} dot={{r: 4, fill: '#fff', strokeWidth: 2}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Moisture & pH */}
            <div className="border-t border-gray-100 pt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  ĐỘ ẨM & ĐỘ pH
                </h3>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} dy={10} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} dx={-10} domain={['auto', 'auto']} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} dx={10} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Line yAxisId="left" type="monotone" dataKey="Moisture" name="Độ ẩm (%)" stroke="#10B981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
                    <Line yAxisId="right" type="monotone" dataKey="ph" name="pH" stroke="#6366F1" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-8 space-y-4">
              {/* Chibi Blood Angel Illustration */}
              <div className="flex flex-col items-center justify-center py-4">
                 <div className="w-24 h-24 bg-red-50 rounded-full border-4 border-red-200 flex items-center justify-center overflow-hidden relative shadow-sm">
                    <ChibiMarine chapter="bloodAngel" className="w-[120%] h-[120%]" />
                 </div>
                 <div className="mt-2 text-[10px] text-gray-400 font-medium uppercase tracking-widest text-center px-4">
                   <span className="text-red-600 font-bold">Blood Angel</span> sẵn sàng cất cánh lấy chiến lược
                 </div>
              </div>
              <button className="w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 border-2 border-orange-100 text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors">
                <TrendingUp className="w-5 h-5" />
                <span>PHÂN TÍCH XU HƯỚNG CẢI TẠO</span>
              </button>
              <p className="text-xs text-center text-gray-400 italic">
                Cần ít nhất 2 bản ghi (lịch sử) để phân tích xu hướng...
              </p>
            </div>

          </div>
        </section>

        {/* TẦNG 5: DỮ LIỆU NGOẠI TUYẾN (SD CARD) */}
        <section className="space-y-4 mb-12">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold flex items-center justify-center border border-purple-200">
              5
            </div>
            <h2 className="text-lg font-bold text-purple-600 uppercase tracking-wide">Tầng 5: Dữ liệu thẻ nhớ SD</h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-4">
            
            {/* Chibi White Scar Illustration */}
            <div className="flex flex-col items-center justify-center py-2">
               <div className="w-24 h-24 bg-gray-50 rounded-full border-4 border-purple-100 flex items-center justify-center overflow-hidden relative shadow-sm">
                  <ChibiMarine chapter="whiteScar" className="w-[120%] h-[120%]" />
               </div>
               <div className="mt-2 text-[10px] text-gray-400 font-medium uppercase tracking-widest text-center px-4">
                 <span className="text-purple-600 font-bold">White Scar</span> đang {isSyncingSd ? 'phóng xe chở dữ liệu...' : 'chờ lệnh giao thư'}
               </div>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Database className="w-5 h-5 flex-shrink-0 text-purple-500" />
                  ĐỌC LỊCH SỬ TỪ THẺ MICRO SD
                </h3>
                <p className="text-xs text-gray-500 mt-1">Sử dụng khi trạm vừa mất kết nối mạng và cần đồng bộ lại.</p>
              </div>
              <button 
                onClick={handleSyncSd}
                disabled={isSyncingSd}
                className="bg-purple-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md shadow-purple-200 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSyncingSd ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    ĐANG ĐỌC SD...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    ĐỒNG BỘ
                  </>
                )}
              </button>
            </div>

            {Object.keys(groupedSdData).length > 0 ? (
              <div className="space-y-3">
                {Object.keys(groupedSdData).sort().reverse().map((dateStr) => {
                  const records = groupedSdData[dateStr];
                  const isExpanded = expandedSdDate === dateStr;
                  return (
                    <div key={dateStr} className="border border-gray-100 rounded-2xl overflow-hidden">
                      <button 
                        onClick={() => setExpandedSdDate(isExpanded ? null : dateStr)}
                        className="w-full bg-gray-50 p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-purple-500" />
                          <span className="font-bold text-gray-700">Ngày {dateStr}</span>
                          <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs font-bold">{records.length} bản ghi</span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </button>
                      
                      {isExpanded && (
                        <div className="p-4 bg-white space-y-4">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handlePushToHistory(records)}
                              className="text-xs font-bold flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                            >
                              <TrendingUp className="w-4 h-4" /> Nạp loạt vào Biểu đồ
                            </button>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[500px]">
                              <thead>
                                <tr className="text-xs text-gray-400 border-b border-gray-100">
                                  <th className="pb-2 font-medium w-24">Giờ</th>
                                  <th className="pb-2 font-medium">N-P-K</th>
                                  <th className="pb-2 font-medium">Ẩm / Nhiệt</th>
                                  <th className="pb-2 font-medium">pH</th>
                                  <th className="pb-2 font-medium text-right">Thao tác</th>
                                </tr>
                              </thead>
                              <tbody>
                                {records.map((row: any) => {
                                  const timeStr = row.timestamp ? row.timestamp.split(' ')[1] : row.id;
                                  return (
                                    <tr key={row.id} className="text-sm text-gray-700 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                      <td className="py-3 pr-2 font-medium text-gray-500">{timeStr}</td>
                                      <td className="py-3 pr-2">
                                        {row.n || 0}-{row.p || 0}-{row.k || 0}
                                      </td>
                                      <td className="py-3 pr-2">
                                        {row.moisture || 0}% / {row.temp || 0}°C
                                      </td>
                                      <td className="py-3 pr-2">{row.ph || 0}</td>
                                      <td className="py-3 text-right">
                                        <button 
                                          onClick={() => {
                                            setLoadedSdRecord(row);
                                            document.getElementById('tang2')?.scrollIntoView({behavior: 'smooth'});
                                          }}
                                          className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                          NẠP
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Database className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Chưa có dữ liệu từ thẻ nhớ</p>
                <p className="text-xs text-gray-400">Bấm đồng bộ để yêu cầu ESP32 đọc thẻ Micro SD</p>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* WiFi Config Modal */}
      {showWifiModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-500" />
                Cấu hình WiFi cho Trạm
              </h3>
              <button onClick={() => setShowWifiModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpdateWifi} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tên WiFi (SSID) *</label>
                <input 
                  type="text" 
                  required
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="Nhập tên WiFi mới..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mật khẩu WiFi</label>
                <input 
                  type="text" 
                  value={wifiPass}
                  onChange={(e) => setWifiPass(e.target.value)}
                  placeholder="Nhập mật khẩu (nếu có)..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <p className="text-xs text-gray-500 italic">
                Lưu ý: Sau khi gửi lệnh, trạm ESP32 sẽ khởi động lại và thử kết nối vào mạng mới. Hãy đảm bảo thông tin chính xác.
              </p>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowWifiModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  HỦY
                </button>
                <button 
                  type="submit" 
                  disabled={!wifiSsid || isUpdatingWifi}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
                >
                  {isUpdatingWifi ? <Loader2 className="w-5 h-5 animate-spin" /> : <Settings className="w-5 h-5" />}
                  CẬP NHẬT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCalibModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-500" />
                Hiệu chỉnh cảm biến
              </h3>
              <button onClick={() => setIsCalibModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="bg-orange-50 text-orange-800 p-4 rounded-xl text-sm mb-4 border border-orange-100">
                Lưu ý: Bạn đang {isAdmin ? "là Admin (Có quyền lưu cấu hình)" : "không phải Admin (Có thể xem nhưng không thể lưu)"}.
                Các giá trị bù trừ (offset) sẽ được cộng hoặc trừ trực tiếp vào giá trị đo gốc của cảm biến.
              </div>
              {!ownerPhone && isAdmin && (
                <div className="mb-4 p-4 border-2 border-dashed border-emerald-200 rounded-xl bg-emerald-50">
                  <p className="text-sm text-emerald-800 mb-3">Trạm này chưa có chủ sở hữu. Bạn có muốn đăng ký tài khoản hiện tại làm Admin không?</p>
                  <button 
                    onClick={async () => {
                      if (deviceId && loggedInPhone) {
                        await set(ref(db, `/Stations/${deviceId}/OwnerPhone`), loggedInPhone);
                        alert("Đã đăng ký quyền Admin thành công!");
                      }
                    }}
                    className="w-full bg-emerald-600 text-white font-bold py-2 rounded-lg"
                  >
                    Nhận quyền Admin
                  </button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Nito (N)", key: "n" },
                  { label: "Photpho (P)", key: "p" },
                  { label: "Kali (K)", key: "k" },
                  { label: "Độ ẩm đất", key: "moisture" },
                  { label: "Nhiệt độ đất", key: "soilTemp" },
                  { label: "pH", key: "ph" },
                  { label: "Nhiệt độ nước", key: "waterTemp" }
                ].map(({ label, key }) => {
                  const val = tempCalib[key as keyof typeof tempCalib] || 0;
                  const isPositive = val >= 0;
                  const absVal = Math.abs(val);
                  return (
                    <div key={key} className={key === 'waterTemp' ? "col-span-2" : ""}>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
                      <div className="flex border rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all bg-white">
                        <select
                          value={isPositive ? '+' : '-'}
                          onChange={(e) => {
                            const newIsPositive = e.target.value === '+';
                            setTempCalib({ ...tempCalib, [key]: newIsPositive ? absVal : -absVal });
                          }}
                          className="bg-gray-100 border-r px-3 py-3 font-bold text-gray-700 outline-none cursor-pointer disabled:opacity-50"
                          disabled={!isAdmin}
                        >
                          <option value="+">+</option>
                          <option value="-">-</option>
                        </select>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={absVal}
                          onChange={(e) => {
                            const newVal = Number(e.target.value);
                            setTempCalib({ ...tempCalib, [key]: isPositive ? newVal : -newVal });
                          }}
                          className="w-full p-3 outline-none disabled:opacity-50"
                          disabled={!isAdmin}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
              <button 
                onClick={async () => {
                  if (isAdmin && deviceId) {
                    await set(ref(db, `/Stations/${deviceId}/Calibration`), tempCalib);
                    alert("Lưu cấu hình hiệu chỉnh thành công!");
                    setIsCalibModalOpen(false);
                  }
                }}
                disabled={!isAdmin}
                className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
