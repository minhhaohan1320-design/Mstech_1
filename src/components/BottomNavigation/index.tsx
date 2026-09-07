import React from 'react';
import { Home, BarChart2, MessageSquare, Settings, QrCode } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  className?: string;
}

export const BottomNavigation: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, className = '' }) => {
  return (
    <nav className={`bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] pb-safe ${className}`}>
      <div className="flex items-center justify-around p-2">
        <NavItem id="home" icon={<Home />} label="Tổng quan" activeTab={activeTab} setActiveTab={setActiveTab} />
        <NavItem id="history" icon={<BarChart2 />} label="Lịch sử" activeTab={activeTab} setActiveTab={setActiveTab} />
        <NavItem id="ai" icon={<MessageSquare />} label="M.S.AI" activeTab={activeTab} setActiveTab={setActiveTab} />
        <NavItem id="settings" icon={<Settings />} label="Cấu hình" activeTab={activeTab} setActiveTab={setActiveTab} />
        <NavItem id="stationInfo" icon={<QrCode />} label="Thông tin" activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </nav>
  );
};

const NavItem = ({ id, icon, label, activeTab, setActiveTab }: { id: string, icon: React.ReactNode, label: string, activeTab: string, setActiveTab: (t: string) => void }) => {
  const active = activeTab === id;
  return (
    <button 
      onClick={() => setActiveTab(id)} 
      className={`flex flex-col items-center p-2 rounded-xl transition-colors ${active ? 'text-emerald-600' : 'text-gray-400 hover:text-emerald-500'}`}
    >
      <span className="[&>svg]:w-6 [&>svg]:h-6 mb-1">{icon}</span>
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
};
