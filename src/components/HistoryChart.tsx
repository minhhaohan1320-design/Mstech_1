import React, { useState } from 'react';
import { SensorData } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChibiMarine } from './ChibiMarine';
import { Filter } from 'lucide-react';

interface HistoryChartProps {
  historyData: (SensorData & { timeStr: string })[];
  hideCard?: boolean;
}

export const HistoryChart: React.FC<HistoryChartProps> = ({ historyData, hideCard }) => {
  const [metric, setMetric] = useState<'npk' | 'moisture' | 'soilTemp' | 'ph'>('npk');

  if (!historyData || historyData.length === 0) {
    if (hideCard) return null;
    return (
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
        <p className="text-gray-500 font-medium">Chưa có dữ liệu lịch sử để hiển thị.</p>
      </div>
    );
  }

  const renderChart = () => {
    switch (metric) {
      case 'npk':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorN" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorK" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="timeStr" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="n" name="Nitơ (N)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorN)" />
              <Area type="monotone" dataKey="p" name="Phốt pho (P)" stroke="#f97316" fillOpacity={1} fill="url(#colorP)" />
              <Area type="monotone" dataKey="k" name="Kali (K)" stroke="#a855f7" fillOpacity={1} fill="url(#colorK)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'moisture':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="timeStr" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="moisture" name="Độ ẩm (%)" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorMoisture)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'soilTemp':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="timeStr" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="soilTemp" name="Nhiệt độ đất (°C)" stroke="#ef4444" fillOpacity={1} fill="url(#colorTemp)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'ph':
        return (
           <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="timeStr" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} domain={[0, 14]} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="ph" name="Độ pH" stroke="#10b981" fillOpacity={1} fill="url(#colorPh)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const content = (
    <>
      {!hideCard && (
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 shrink-0">
            <ChibiMarine chapter="imperialFist" bgColor="bg-yellow-50" borderColor="border-yellow-200" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Lịch sử đo</h2>
            <p className="text-xs text-gray-500">Giám sát biến động dữ liệu</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 px-4">
        <h3 className="font-bold text-gray-700 flex items-center text-sm uppercase tracking-wider">
          <Filter className="w-4 h-4 mr-2" />
          Chỉ số
        </h3>
        <select 
          value={metric} 
          onChange={(e) => setMetric(e.target.value as any)}
          className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block px-3 py-2 font-bold outline-none uppercase tracking-wider"
        >
          <option value="npk">N-P-K</option>
          <option value="moisture">Độ ẩm</option>
          <option value="soilTemp">Nhiệt độ đất</option>
          <option value="ph">Độ pH</option>
        </select>
      </div>

      <div className="w-full pl-2 pr-4">
        {renderChart()}
      </div>
    </>
  );

  if (hideCard) {
    return <div className="w-full">{content}</div>;
  }

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
      {content}
    </div>
  );
};
