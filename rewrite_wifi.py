import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add Wifi state
state_old = """  const [inputTab, setInputTab] = useState('dat');"""
state_new = """  const [inputTab, setInputTab] = useState('dat');
  const [showWifiModal, setShowWifiModal] = useState(false);
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [isUpdatingWifi, setIsUpdatingWifi] = useState(false);"""
content = content.replace(state_old, state_new)

# Add Wifi handle function
func_old = """  const triggerRead = async () => {"""
func_new = """  const handleUpdateWifi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId || !wifiSsid) return;
    setIsUpdatingWifi(true);
    try {
      await set(ref(db, `/Stations/${deviceId}/Command/wifi`), {
        ssid: wifiSsid.trim(),
        pass: wifiPass,
        trigger: true
      });
      alert("Đã gửi lệnh đổi WiFi! Trạm sẽ khởi động lại trong vài giây.");
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

  const triggerRead = async () => {"""
content = content.replace(func_old, func_new)

# Add onClick to Settings button
btn_old = """          <button className="w-full flex items-center space-x-3 p-4 text-gray-600 hover:bg-gray-50 rounded-2xl font-medium">
            <Settings className="w-5 h-5 text-gray-400" />
            <span>Cấu hình thiết bị</span>
          </button>"""
btn_new = """          <button onClick={() => { setShowWifiModal(true); setIsDrawerOpen(false); }} className="w-full flex items-center space-x-3 p-4 text-gray-600 hover:bg-gray-50 rounded-2xl font-medium">
            <Settings className="w-5 h-5 text-gray-400" />
            <span>Cấu hình WiFi cho Trạm</span>
          </button>"""
content = content.replace(btn_old, btn_new)

# Add Modal UI at the end of the return statement
modal_old = """      </div>
    </div>
  );
}"""
modal_new = """        {/* WiFi Config Modal */}
        {showWifiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-emerald-50">
                <h3 className="text-lg font-bold text-emerald-900">Cấu hình WiFi Trạm</h3>
                <button onClick={() => setShowWifiModal(false)} className="text-gray-500 hover:text-gray-900">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleUpdateWifi} className="p-6 space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Nhập tên và mật khẩu WiFi mới. Trạm sẽ lưu lại và tự khởi động để kết nối.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên WiFi (SSID)</label>
                  <input
                    type="text"
                    required
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="VD: Viettel_Wifi_123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu WiFi</label>
                  <input
                    type="text"
                    value={wifiPass}
                    onChange={(e) => setWifiPass(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="Bỏ trống nếu WiFi không có mật khẩu"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUpdatingWifi || !wifiSsid}
                  className="w-full bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 mt-4"
                >
                  {isUpdatingWifi ? 'Đang gửi lệnh...' : 'Lưu và Khởi động lại Trạm'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}"""
content = content.replace(modal_old, modal_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("App.tsx Wifi Modal rewrite complete")
