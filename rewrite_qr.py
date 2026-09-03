import sys

with open('src/components/QRScanner.tsx', 'r') as f:
    content = f.read()

new_content = """import React, { useState, useRef } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { AlertCircle, Camera, Image as ImageIcon } from 'lucide-react';
import jsQR from 'jsqr';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
  onClose: () => void;
}

export default function QRScanner({ onScanSuccess, onScanFailure, onClose }: QRScannerProps) {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;
        
        // Scale down to avoid processing massive images (speeds up scanning)
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height = Math.round(height * (MAX_WIDTH / width));
          width = MAX_WIDTH;
        }
        
        canvas.width = width;
        canvas.height = height;
        context.drawImage(img, 0, 0, width, height);
        
        const imageData = context.getImageData(0, 0, width, height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          onScanSuccess(code.data);
        } else {
          alert("Không tìm thấy mã QR trong ảnh. Vui lòng thử lại với ảnh rõ nét hơn hoặc đưa mã QR vào trung tâm.");
        }
        
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
          <h3 className="text-lg font-bold text-gray-900">Quét mã QR Trạm</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors font-medium text-sm"
          >
            Đóng
          </button>
        </div>
        
        {/* Scanner Area */}
        <div className="p-4 bg-gray-50 flex-1 overflow-y-auto">
          <div className="w-full bg-black rounded-2xl overflow-hidden relative flex flex-col items-center justify-center shadow-inner" style={{ minHeight: '320px' }}>
            {cameraError ? (
              <div className="text-center p-6 text-white space-y-4">
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
                <p className="font-bold text-rose-400">Không thể truy cập Camera</p>
                <p className="text-sm text-gray-300">
                  {cameraError}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  (Lỗi quyền trên trình duyệt)
                </p>
              </div>
            ) : (
              <Scanner
                onScan={(result) => {
                  if (result && result.length > 0) {
                    onScanSuccess(result[0].rawValue);
                  }
                }}
                onError={(error) => {
                  console.error("Camera Error:", error);
                  setCameraError(error?.message || "Lỗi không xác định khi mở camera.");
                  if (onScanFailure) onScanFailure(error);
                }}
                components={{
                  audio: false,
                  finder: true,
                }}
              />
            )}
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Hướng camera vào mã QR dán trên tủ điện
            </p>
            
            <div className="relative flex items-center py-2 mb-4">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">Hoặc tải ảnh lên</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            
            {/* Native Camera / Gallery Fallback */}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold py-3.5 px-6 rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center space-x-2"
            >
              <Camera className="w-5 h-5" />
              <span>Chụp ảnh / Chọn từ thư viện</span>
            </button>
            <p className="text-xs text-emerald-600/70 mt-2 px-4">
              (Dùng cách này nếu màn hình quét trực tiếp bị đen)
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
"""

with open('src/components/QRScanner.tsx', 'w') as f:
    f.write(new_content)

print("Rewrite complete")
