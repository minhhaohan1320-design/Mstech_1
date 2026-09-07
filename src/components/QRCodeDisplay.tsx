import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ChibiMarine } from './ChibiMarine';
import { Share2 } from 'lucide-react';

interface QRCodeDisplayProps {
  deviceId: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ deviceId }) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain';
  const shareUrl = `${currentUrl}/station/${deviceId}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 shrink-0">
          <ChibiMarine chapter="salamander" bgColor="bg-green-50" borderColor="border-green-200" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Thông tin Trạm</h2>
          <p className="text-xs text-gray-500">Mã QR chia sẻ</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{deviceId}</h3>
        <p className="text-sm text-gray-500 mb-8">Quét mã này để mở trực tiếp dashboard của trạm.</p>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6">
          <QRCodeSVG value={shareUrl} size={200} level="H" />
        </div>

        <div className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500 truncate mr-2">{shareUrl}</span>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              alert("Đã copy đường dẫn!");
            }}
            className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
