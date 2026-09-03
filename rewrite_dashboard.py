import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

parts = content.split('// DASHBOARD SCREEN\n  // -------------------------------------------------------------')
if len(parts) < 2:
    print("Could not find DASHBOARD SCREEN marker")
    sys.exit(1)

top_part = parts[0] + '// DASHBOARD SCREEN\n  // -------------------------------------------------------------\n'

new_dashboard = """  const chartData = [
    { name: '20-04', N: 14.5, P: 18.2, K: 32.1, Moisture: 38, Temp: 27, ph: 6.5 },
    { name: '21-04', N: 14.8, P: 19.5, K: 33.5, Moisture: 39, Temp: 29, ph: 6.7 },
    { name: '22-04', N: 15.3, P: 20.3, K: 34.7, Moisture: 40.3, Temp: 32, ph: 6.8 },
  ];

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
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          <button className="w-full flex items-center space-x-3 p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-medium border border-emerald-100">
            <Leaf className="w-5 h-5" />
            <span>Phân tích Đất</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-4 text-gray-600 hover:bg-gray-50 rounded-2xl font-medium">
            <Droplets className="w-5 h-5 text-gray-400" />
            <span>Phân tích Nước</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-4 text-gray-600 hover:bg-gray-50 rounded-2xl font-medium">
            <Database className="w-5 h-5 text-gray-400" />
            <span>Dữ liệu lịch sử</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-4 text-gray-600 hover:bg-gray-50 rounded-2xl font-medium">
            <Bell className="w-5 h-5 text-red-400" />
            <span>Cảnh báo chỉ số</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-4 text-gray-600 hover:bg-gray-50 rounded-2xl font-medium">
            <Search className="w-5 h-5 text-gray-400" />
            <span>Tra cứu dịch bệnh</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-4 text-gray-600 hover:bg-gray-50 rounded-2xl font-medium">
            <Settings className="w-5 h-5 text-gray-400" />
            <span>Cấu hình thiết bị</span>
          </button>
          <button onClick={() => setDeviceId(null)} className="w-full flex items-center space-x-3 p-4 text-rose-600 hover:bg-rose-50 rounded-2xl font-medium mt-auto">
            <LogOut className="w-5 h-5" />
            <span>Đổi Trạm (Ngắt kết nối)</span>
          </button>
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
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Loại cây trồng</p>
              <div className="space-y-4">
                <input type="text" placeholder="Tên cây (Vd: Vải thiều)" className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-700" />
                <input type="text" placeholder="Giống (Vd: Thanh Hà)" className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-700" />
              </div>
            </div>
          </div>
        </section>

        {/* TẦNG 2 */}
        <section className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center border border-emerald-200">
              2
            </div>
            <h2 className="text-lg font-bold text-emerald-600 uppercase tracking-wide">Tầng 2: Nhập liệu Đất & Nước</h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-6">
            
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
                      {formatNumber(averageArray(sensorData?.npk_data?.n || []))}
                    </span>
                    <span className="text-xs text-gray-400 font-medium mb-1">mg/kg</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-2">LÂN (P)</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-black text-gray-900 flex items-center">
                      <span className="text-orange-500 mr-2 text-xl">P</span>
                      {formatNumber(averageArray(sensorData?.npk_data?.p || []))}
                    </span>
                    <span className="text-xs text-gray-400 font-medium mb-1">mg/kg</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-2">KALI (K)</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-black text-gray-900 flex items-center">
                      <span className="text-purple-600 mr-2 text-xl">K</span>
                      {formatNumber(averageArray(sensorData?.npk_data?.k || []))}
                    </span>
                    <span className="text-xs text-gray-400 font-medium mb-1">mg/kg</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-2">ĐỘ ẨM</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-black text-gray-900 flex items-center">
                      <Droplets className="w-5 h-5 text-blue-400 mr-2" />
                      {formatNumber(averageArray(sensorData?.do_am_dat || []))}
                    </span>
                    <span className="text-xs text-gray-400 font-medium mb-1">%</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 col-span-2 flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-500">NHIỆT ĐỘ ĐẤT</p>
                  <div className="flex items-end space-x-2">
                    <span className="text-2xl font-black text-gray-900 flex items-center">
                      <ThermometerSun className="w-5 h-5 text-amber-500 mr-2" />
                      {formatNumber(averageArray(sensorData?.nhiet_do_dat || []))}
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
                      {formatNumber(averageArray(sensorData?.ph_data || []))}
                    </span>
                    <span className="text-xs text-gray-400 font-medium mb-1">pH</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-2">NHIỆT ĐỘ NƯỚC</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-black text-gray-900 flex items-center">
                      <ThermometerSun className="w-5 h-5 text-rose-500 mr-2" />
                      {formatNumber(sensorData?.temp_nuoc)}
                    </span>
                    <span className="text-xs text-gray-400 font-medium mb-1">°C</span>
                  </div>
                </div>
              </div>
            )}

            {/* Sync Button */}
            <button 
              onClick={triggerRead}
              disabled={isCommanding}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all border ${
                isConnected 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                  : 'bg-gray-50 text-gray-400 border-gray-200'
              }`}
            >
              {isCommanding ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Bluetooth className="w-5 h-5" />
              )}
              <span>{isConnected ? 'KẾT NỐI FIREBASE (ĐANG NHẬN DỮ LIỆU)' : 'MẤT KẾT NỐI FIREBASE'}</span>
            </button>

            {/* Info Fields */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 font-medium flex-1 text-sm">21.2858, 106.1950</span>
                <span className="text-xs text-gray-400 font-bold">GPS</span>
              </div>
              <div className="relative">
                <input type="text" placeholder={activeZone === 'khu-vuon-a' ? "Khu Vườn A (Đất)" : "Hệ Thống Tưới (Nước)"} className="w-full pl-4 pr-16 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium text-gray-700" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">TÊN</span>
              </div>
            </div>

            {/* Average Values Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">Giá trị trung bình lần đo</p>
              
              {inputTab === 'dat' ? (
                <div className="grid grid-cols-2 gap-y-6">
                  <div>
                    <p className="text-xs text-gray-400 font-bold mb-1">N</p>
                    <p className="text-2xl font-black text-emerald-600">{formatNumber(averageArray(sensorData?.npk_data?.n || []))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold mb-1">P</p>
                    <p className="text-2xl font-black text-emerald-600">{formatNumber(averageArray(sensorData?.npk_data?.p || []))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold mb-1">K</p>
                    <p className="text-2xl font-black text-emerald-600">{formatNumber(averageArray(sensorData?.npk_data?.k || []))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold mb-1">MOISTURE</p>
                    <p className="text-2xl font-black text-emerald-600">{formatNumber(averageArray(sensorData?.do_am_dat || []))}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 font-bold mb-1">TEMP</p>
                    <p className="text-2xl font-black text-emerald-600">{formatNumber(averageArray(sensorData?.nhiet_do_dat || []))}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-y-6">
                  <div>
                    <p className="text-xs text-gray-400 font-bold mb-1">PH</p>
                    <p className="text-2xl font-black text-emerald-600">{formatNumber(averageArray(sensorData?.ph_data || []))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold mb-1">TEMP</p>
                    <p className="text-2xl font-black text-emerald-600">{formatNumber(sensorData?.temp_nuoc)}</p>
                  </div>
                </div>
              )}
            </div>

            <button className="w-full py-4 bg-emerald-100 text-emerald-700 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-emerald-200 transition-colors">
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
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-700 max-w-[150px] leading-tight flex items-center gap-2">
                <Zap className="w-5 h-5 flex-shrink-0" />
                PHÂN TÍCH TỔNG HỢP ĐẤT-NƯỚC
              </h3>
              <button className="bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold text-sm shadow-md shadow-emerald-200 hover:bg-emerald-600">
                PHÂN TÍCH NGAY
              </button>
            </div>
            <p className="text-sm text-gray-500 italic">Bấm "Phân tích ngay" để AI tổng hợp dữ liệu toàn vườn...</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Quản lý dữ liệu dài hạn</h3>
            <p className="text-sm text-gray-500">Hệ thống sẽ tổng hợp 12 tháng dữ liệu thành một file PDF chuyên nghiệp để lưu trữ hoặc gửi báo cáo.</p>
            
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">Số bản ghi hiện có:</span>
              <span className="text-xl font-black text-emerald-600">3/12</span>
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
        <section className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center border border-emerald-200">
              4
            </div>
            <h2 className="text-lg font-bold text-emerald-600 uppercase tracking-wide">Tầng 4: Biểu đồ trực quan & AI chiến lược</h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-8">
            
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

      </main>
    </div>
  );
}
"""

with open('src/App.tsx', 'w') as f:
    f.write(top_part + new_dashboard)

print("Done")
