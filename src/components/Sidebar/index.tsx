import React from 'react';
import { Home, BarChart2, MessageSquare, Settings, QrCode } from 'lucide-react';
import { ChibiMarine } from '../ChibiMarine';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  deviceId: string | null;
  isOnline: boolean;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, deviceId, isOnline, className = '' }) => {
  return (
    <aside className={`w-64 bg-white border-r border-gray-100 flex-col h-screen sticky top-0 ${className}`}>
      <div className="p-6 text-center border-b border-gray-50">
        <h1 className="text-xl font-bold text-emerald-700 flex items-center justify-center space-x-2">
          <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-lg text-sm mr-1">MS</span>
          M.S.Tech
        </h1>
        <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 mt-1 uppercase">SMART AGRICULTURE</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <NavItem id="home" icon={<Home />} label="Tổng quan" activeTab={activeTab} setActiveTab={setActiveTab} />
        <NavItem id="history" icon={<BarChart2 />} label="Lịch sử" activeTab={activeTab} setActiveTab={setActiveTab} />
        <NavItem id="ai" icon={<MessageSquare />} label="M.S.AI" activeTab={activeTab} setActiveTab={setActiveTab} />
        <NavItem id="settings" icon={<Settings />} label="Cấu hình" activeTab={activeTab} setActiveTab={setActiveTab} />
        <NavItem id="stationInfo" icon={<QrCode />} label="Thông tin trạm" activeTab={activeTab} setActiveTab={setActiveTab} />
      </nav>

      {deviceId && (
        <div className="p-4 border-t border-gray-50 bg-gray-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 shrink-0">
               <ChibiMarine chapter="ultramarine" bgColor="bg-white" borderColor="border-gray-200" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{deviceId}</p>
              <div className="flex items-center mt-0.5">
                <span className="relative flex h-2 w-2 mr-1.5">
                  {isOnline ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  )}
                </span>
                <span className="text-[10px] font-bold text-gray-500">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

const NavItem = ({ id, icon, label, activeTab, setActiveTab }: { id: string, icon: React.ReactNode, label: string, activeTab: string, setActiveTab: (t: string) => void }) => {
  const active = activeTab === id;
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
        active 
          ? 'bg-emerald-50 text-emerald-700' 
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span className={`[&>svg]:w-5 [&>svg]:h-5 ${active ? 'text-emerald-600' : 'text-gray-400'}`}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
};
