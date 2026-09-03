import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Remove import QRScanner from './components/QRScanner';
content = content.replace("import QRScanner from './components/QRScanner';", "")

# Add import for QrScannerLib
content = content.replace("import { LineChart,", "import QrScannerLib from 'qr-scanner';\nimport { Image as ImageIcon, Loader2 } from 'lucide-react';\nimport { LineChart,")

# Replace the QR Scanner state and functions
new_logic = """  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isProcessingQR, setIsProcessingQR] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [manualInput, setManualInput] = useState('');"""

content = content.replace("""  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');""", new_logic)

# Replace handleScanSuccess with handleFileUpload
new_handlers = """  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };"""

content = content.replace("""  const handleScanSuccess = (decodedText: string) => {
    setIsScanning(false);
    const id = decodedText.trim();
    if (/[.#$\[\]]/.test(id)) {
      setLoginError("Mã QR không hợp lệ. Vui lòng chỉ quét mã QR chứa Địa chỉ MAC (VD: AC51A9A5FC84), không dùng Link URL.");
      return;
    }
    setLoginError(null);
    setDeviceId(id);
  };""", new_handlers)

# Replace UI part
ui_old = """        {isScanning && (
          <QRScanner 
            onScanSuccess={handleScanSuccess} 
            onClose={() => setIsScanning(false)} 
            onScanFailure={(err) => console.log(err)}
          />
        )}
        
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100">
          <div className="bg-emerald-600 p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">M.S.Tech</h1>
            <p className="text-emerald-100">Hệ thống Quan trắc Nông nghiệp</p>
          </div>
          
          <div className="p-8">
            <button
              onClick={() => setIsScanning(true)}
              className="w-full flex items-center justify-center space-x-3 bg-emerald-50 text-emerald-700 font-semibold py-4 px-6 rounded-2xl hover:bg-emerald-100 transition-colors mb-6 border border-emerald-200"
            >
              <QrCode className="w-6 h-6" />
              <span>Quét mã QR Trạm</span>
            </button>"""

ui_new = """        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100">
          <div className="bg-emerald-600 p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">M.S.Tech</h1>
            <p className="text-emerald-100">Hệ thống Quan trắc Nông nghiệp</p>
          </div>
          
          <div className="p-8">
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
              className="w-full flex items-center justify-center space-x-3 bg-emerald-50 text-emerald-700 font-semibold py-4 px-6 rounded-2xl hover:bg-emerald-100 transition-colors mb-6 border border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessingQR ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Đang xử lý ảnh QR...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-6 h-6" />
                  <span>Tải ảnh QR Trạm lên</span>
                </>
              )}
            </button>"""

content = content.replace(ui_old, ui_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Rewrite App.tsx complete")
