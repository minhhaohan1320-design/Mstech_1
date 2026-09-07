import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { BottomNavigation } from './components/BottomNavigation';
import { Dashboard } from './components/Dashboard';
import { HistoryChart } from './components/HistoryChart';
import { AIAnalysis } from './components/AIAnalysis';
import { AIChat } from './components/AIChat';
import { WifiConfig } from './components/WifiConfig';
import { QRCodeDisplay } from './components/QRCodeDisplay';
import { useStation } from './hooks/useStation';
import { QrCode, Image as ImageIcon } from 'lucide-react';

export default function App() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      const stationIndex = pathParts.indexOf('station');
      if (stationIndex !== -1 && pathParts.length > stationIndex + 1) {
        setDeviceId(pathParts[stationIndex + 1]);
      }
    }
  }, []);

  const {
    sensorData,
    commandState,
    isOnline,
    lastUpdated,
    historyData,
    sendMeasureCommand,
    updateWifi
  } = useStation(deviceId, isDemo);

  if (!deviceId && !isDemo) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col p-4 font-sans">
        <div className="flex-1 flex flex-col max-w-md w-full mx-auto justify-center space-y-8">
          <div className="text-center mb-2">
            <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center space-x-3">
              <span className="bg-emerald-600 text-white px-3 py-1 rounded-2xl text-2xl shadow-sm">MS</span>
              <span>M.S.Tech</span>
            </h1>
            <p className="text-[11px] font-bold tracking-[0.25em] text-gray-500 mt-4 uppercase">SMART AGRICULTURE</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center bg-white border border-emerald-100 text-emerald-700 rounded-3xl p-6 shadow-sm hover:bg-emerald-50 transition-all hover:scale-[1.02]">
              <div className="bg-emerald-100 p-3 rounded-2xl mb-3">
                <QrCode className="w-7 h-7 text-emerald-600" />
              </div>
              <span className="text-sm font-bold">Quét QR</span>
            </button>
            <button className="flex flex-col items-center justify-center bg-white border border-emerald-100 text-emerald-700 rounded-3xl p-6 shadow-sm hover:bg-emerald-50 transition-all hover:scale-[1.02]">
              <div className="bg-emerald-100 p-3 rounded-2xl mb-3">
                <ImageIcon className="w-7 h-7 text-emerald-600" />
              </div>
              <span className="text-sm font-bold text-center leading-tight">Tải ảnh QR<br/>từ thư viện</span>
            </button>
          </div>

          <div className="flex items-center text-sm text-gray-400">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 font-medium">Hoặc nhập thủ công</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <form onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem('stationId') as HTMLInputElement).value;
              if (input.trim()) setDeviceId(input.trim());
            }}>
              <div className="mb-6 text-left">
                <label className="block text-sm font-bold text-gray-700 mb-3 ml-1">Mã Trạm (Thiết bị ESP32)</label>
                <input 
                  name="stationId"
                  type="text" 
                  placeholder="Ví dụ: TRAM_BG_01"
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-800 font-medium placeholder:text-gray-400 uppercase"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl hover:bg-emerald-700 transition-colors mb-3 shadow-md shadow-emerald-200"
              >
                Kết nối
              </button>
              <button 
                type="button" 
                onClick={() => setIsDemo(true)}
                className="w-full bg-gray-50 text-gray-500 font-bold py-4 rounded-2xl border border-gray-200 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                Xem bản Demo
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        deviceId={isDemo ? 'DEMO_STATION' : deviceId} 
        isOnline={isOnline} 
        className="hidden md:flex"
      />

      <div className="flex-1 pb-20 md:pb-0 relative flex flex-col w-full min-w-0">
        <header className="md:hidden bg-white px-4 py-4 shadow-sm border-b border-gray-100 flex items-center justify-center sticky top-0 z-30">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 flex items-center justify-center space-x-2">
              <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-lg text-sm mr-1 shadow-sm">MS</span>
              M.S.Tech
            </h1>
          </div>
          {(deviceId || isDemo) && (
            <button 
              onClick={() => { setDeviceId(null); setIsDemo(false); }} 
              className="absolute right-4 text-[10px] font-bold text-gray-500 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 tracking-wider"
            >
              ĐỔI TRẠM
            </button>
          )}
        </header>

        <main className="flex-1 p-3 md:p-6 max-w-4xl mx-auto w-full">
          {activeTab === 'home' && (
            <Dashboard 
              deviceId={deviceId || 'DEMO_STATION'} 
              data={sensorData} 
              isOnline={isOnline} 
              lastUpdated={lastUpdated} 
              isDemo={isDemo}
              commandState={commandState}
              onMeasure={sendMeasureCommand}
              onNavigateToAI={() => setActiveTab('ai')}
              historyData={historyData}
            />
          )}
          
          {activeTab === 'history' && (
            <div className="mt-4">
              <HistoryChart historyData={historyData} />
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6 mt-4">
              <AIAnalysis data={sensorData} />
              <AIChat data={sensorData} />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-md mx-auto space-y-6 mt-4">
              <WifiConfig deviceId={deviceId || 'DEMO_STATION'} onUpdateWifi={updateWifi} />
            </div>
          )}

          {activeTab === 'stationInfo' && (
            <div className="max-w-md mx-auto space-y-6 mt-4">
               <QRCodeDisplay deviceId={deviceId || 'DEMO_STATION'} />
            </div>
          )}
        </main>

        <BottomNavigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          className="md:hidden fixed bottom-0 left-0 right-0 z-40"
        />
      </div>
    </div>
  );
}
