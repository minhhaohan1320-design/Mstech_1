import React, { useState } from 'react';
import { Wifi, Info, Eye, EyeOff } from 'lucide-react';
import { ChibiMarine } from './ChibiMarine';

interface WifiConfigProps {
  deviceId: string;
  onUpdateWifi: (ssid: string, pass: string) => void;
}

export const WifiConfig: React.FC<WifiConfigProps> = ({ deviceId, onUpdateWifi }) => {
  const [ssid, setSsid] = useState('');
  const [pass, setPass] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssid) return;
    
    setIsUpdating(true);
    try {
      if (confirm("Thay đổi Wi-Fi\n\nNếu thông tin không chính xác, trạm có thể không kết nối được Internet và chuyển sang AP Mode.")) {
        onUpdateWifi(ssid.trim(), pass);
        alert("Đã gửi cấu hình Wi-Fi.\n\nĐang chờ trạm khởi động lại...");
        setSsid('');
        setPass('');
      }
    } catch (error) {
      alert("Lỗi khi gửi lệnh.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 shrink-0">
          <ChibiMarine chapter="ironHand" bgColor="bg-gray-100" borderColor="border-gray-300" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Cấu hình Trạm</h2>
          <p className="text-xs text-gray-500">Cài đặt kết nối Wi-Fi cho thiết bị</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 flex items-center mb-4">
          <Wifi className="w-5 h-5 mr-2 text-emerald-600" />
          Đổi mạng Wi-Fi
        </h3>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên Wi-Fi mới (SSID)</label>
            <input 
              type="text" 
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="VD: Home_Network"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu Wi-Fi</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Nhập mật khẩu"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={!ssid || isUpdating}
            className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50"
          >
            LƯU & KẾT NỐI
          </button>
        </form>
      </div>

      <div className="bg-amber-50 rounded-3xl p-6 shadow-sm border border-amber-100">
        <h3 className="font-bold text-amber-800 flex items-center mb-2">
          <Info className="w-5 h-5 mr-2" />
          CẤU HÌNH KHI MẤT WIFI
        </h3>
        <p className="text-sm text-amber-700 mb-4">
          Nếu trạm không kết nối được Wi-Fi, hãy kết nối điện thoại với mạng do trạm phát ra.
        </p>
        
        {showGuide ? (
          <div className="bg-white p-4 rounded-xl text-sm text-gray-700 space-y-2 border border-amber-200">
            <p><strong>SSID:</strong> MSTech_Config</p>
            <p><strong>Password:</strong> 12345678</p>
            <p className="mt-2 text-xs italic text-gray-500">Lưu ý: Firmware hiện tại chưa hỗ trợ Web Server nội bộ trong AP Mode. Tính năng này đã được chuẩn bị cho bản nâng cấp firmware sắp tới.</p>
          </div>
        ) : (
          <button 
            onClick={() => setShowGuide(true)}
            className="text-sm font-bold text-amber-600 hover:text-amber-800"
          >
            Hiển thị Hướng dẫn cấu hình
          </button>
        )}
      </div>
    </div>
  );
};
