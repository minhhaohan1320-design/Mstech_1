# M.S.TECH SMART AGRICULTURE

Dự án Hệ thống giám sát và phân tích nông nghiệp thông minh, giao tiếp với thiết bị ESP32-S3 thông qua Firebase Realtime Database.

## 1. Project là gì
Đây là một Web App quản lý trạm quan trắc nông nghiệp IoT, hỗ trợ thu thập các thông số như Đạm (N), Lân (P), Kali (K), Độ ẩm đất, Nhiệt độ đất, Nhiệt độ nước, và pH.
Web App tích hợp M.S.AI (Google Gemini) để phân tích dữ liệu và cung cấp trợ lý ảo thông minh.

## 2. Architecture
Hệ thống tuân theo luồng giao tiếp một chiều thông qua Firebase:
- **Web App**: React, TypeScript, TailwindCSS (Mobile-first).
- **Backend/AI**: Express Server xử lý API phân tích (ẩn API Key Gemini).
- **Firebase**: Realtime Database đóng vai trò là cầu nối (Source of Truth).
- **Phần cứng**: ESP32-S3 giao tiếp với các cảm biến qua Modbus RTU/RS485.

Luồng đo cảm biến:
`USER -> Web -> Firebase -> ESP32-S3 -> Cảm biến -> ESP32-S3 -> Firebase -> Web -> M.S.AI`

## 3. Firebase Data Structure
```json
/Stations
  /{deviceId}
    /Data
      - n (number)
      - p (number)
      - k (number)
      - moisture (number)
      - soilTemp (number)
      - waterTemp (number)
      - ph (number)
      - timestamp (number)
    /Command
      - read_soil (boolean)
      - update_wifi (boolean)
      - wifi_ssid (string)
      - wifi_pass (string)
    /Status
      - online (boolean)
      - lastSeen (number)
    /History
      /{recordId} ...
```

## 4. Firebase Rules Mẫu
Firebase Rules là thành phần bắt buộc để bảo vệ database trong production. Mẫu rules:

```json
{
  "rules": {
    "Stations": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('Users').child(auth.uid).child('role').val() == 'admin'"
    }
  }
}
```

## 5. Bảng Firmware Compatibility
| Tính năng | Firmware | Firebase | Web | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| Đọc NPK | Có | Có | Có | Realtime |
| Đọc độ ẩm | Có | Có | Có | |
| Đọc nhiệt độ đất | Có | Có | Có | |
| Đọc nhiệt độ nước | Có | Có | Có | |
| Đọc pH | Có | Có | Có | |
| Đo 3 lần | Có | Data trung bình | Có | |
| Đổi Wi-Fi | Có | Có | Có | Restart ESP32 |
| AP Mode | Có | Không | Hướng dẫn | Chưa có HTTP Server |
| History Firebase | Chưa đầy đủ | Chưa xác định | Chuẩn bị architecture | |
| Heartbeat | Chưa có | Chưa có | Chuẩn bị architecture | |
| OTA | Chưa có | Chưa có | Chưa triển khai | |

## 6. Firmware Issues
Nếu có vấn đề kết nối hoặc dữ liệu, có thể do firmware:
- **command race condition**: Cần timeout bảo vệ.
- **Firebase reconnect**: Lỗi wifi hoặc chập chờn.
- **timestamp**: Không đồng bộ chính xác.
- **measurement state**: Không có tiến trình chi tiết 1/3, 2/3.
- **Wi-Fi restart**: Mất thời gian lâu.
- **history**: Chưa đồng bộ đầy đủ lên firebase.

## 7. Firmware Nâng Cấp Đề Xuất (Roadmap)
FUTURE FEATURE:
1. Heartbeat
2. Device status
3. Wi-Fi RSSI
4. Firmware version
5. Measurement progress
6. Error code
7. Sensor diagnostics
8. Firebase History
9. SD synchronization
10. OTA update
11. Direct AP Web Server
12. Calibration
13. Restart command
14. Factory reset

## 8. Command Table
| Web Action | Firebase Path | Value | ESP32 |
| :--- | :--- | :--- | :--- |
| Đo ngay | `/Command/read_soil` | `true` | Đo 3 lần |
| Wi-Fi SSID | `/Command/wifi_ssid` | `string` | SSID mới |
| Wi-Fi Password | `/Command/wifi_pass` | `string` | Password mới |
| Đổi Wi-Fi | `/Command/update_wifi` | `true` | Lưu + restart |

## 9. Cách Chạy (Development)
1. Copy file `.env.example` thành `.env` và điền `GEMINI_API_KEY`.
2. Chạy `npm install` để tải thư viện.
3. Chạy lệnh `npm run dev` để khởi động Vite + Express middleware ở port `3000`.

## 10. Test Plan
- [x] Firebase initialization
- [x] Firebase Realtime Data
- [x] Firebase listener
- [x] ESP32 Data
- [x] read_soil command
- [x] command reset
- [x] measurement state
- [x] Wi-Fi update
- [x] restart state
- [x] Firebase disconnect
- [x] missing data
- [x] invalid data
- [x] QR
- [x] multi station
- [x] AI analysis
- [x] AI chat
- [x] Demo Mode
- [x] Mobile UI
- [x] Desktop UI
