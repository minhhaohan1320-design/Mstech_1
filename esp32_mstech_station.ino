#include <Arduino.h>
#include <WiFi.h>
#include <Preferences.h>
#include <Firebase_ESP_Client.h>
#include <SPI.h>
#include <SD.h>
#include <ArduinoJson.h>
#include <Adafruit_NeoPixel.h>
#include <ModbusMaster.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ==============================================================
// 1. CẤU HÌNH PHẦN CỨNG (Sơ đồ chân ESP32-S3)
// ==============================================================
#define SD_CS_PIN    10
#define SPI_SCK      12
#define SPI_MISO     13
#define SPI_MOSI     11

#define RS485_RX_PIN 18
#define RS485_TX_PIN 17

#define PH_ANALOG_PIN 8
#define WATER_TEMP_PIN 14 

#define RGB_LED_PIN  48
#define NUM_LEDS     1

// ==============================================================
// 2. CẤU HÌNH FIREBASE (ĐÃ ĐƯỢC TỰ ĐỘNG ĐIỀN THÔNG TIN CỦA BẠN)
// ==============================================================
#define API_KEY "AIzaSyBqrME9oNfnBVHwL8ypJTtiTIPwe-NDyOM"
#define DATABASE_URL "https://gen-lang-client-0249965989-default-rtdb.asia-southeast1.firebasedatabase.app"
// Mã bí mật Database Secret (nếu dùng): "kxDR4vOgOeeGIWwLpoDUl6HXYkWJ3UwylatOdPe"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
String DEVICE_ID = "TRAM_BG_01"; 

// ==============================================================
// 3. BIẾN TOÀN CỤC VÀ KHỞI TẠO ĐỐI TƯỢNG
// ==============================================================
Preferences preferences;
SPIClass spiSD(HSPI);
File dataFile;
const char* fileName = "/log_data.csv";
Adafruit_NeoPixel rgbLed(NUM_LEDS, RGB_LED_PIN, NEO_GRB + NEO_KHZ800);

HardwareSerial RS485Serial(1);
ModbusMaster nodeNPK;  
ModbusMaster nodeSoil; 

OneWire oneWire(WATER_TEMP_PIN);
DallasTemperature waterSensor(&oneWire);

unsigned long lastFirebaseCheck = 0;
unsigned long lastAutoLog = 0;
unsigned long previousLedMillis = 0;
const unsigned long CHECK_INTERVAL = 2000;
const unsigned long AUTO_LOG_INTERVAL = 1800000;
const unsigned long LED_INTERVAL = 20;

long currentHue = 0;
bool isAPMode = false;

bool isReadingSensor = false;
int readCount = 0;
unsigned long lastReadTick = 0;

float sumWaterTemp = 0;
long sumN = 0, sumP = 0, sumK = 0;
float sumMoist = 0, sumSoilTemp = 0, sumPh = 0;

int currentN = 0, currentP = 0, currentK = 0;
float currentMoist = 0.0, currentSoilTemp = 0.0;
float currentWaterTemp = 0.0, currentPh = 0.0;

// ==============================================================
// 4. HÀM QUẢN LÝ WIFI THÔNG MINH
// ==============================================================
void initWiFi() {
  preferences.begin("wifi_config", false);
  String ssid = preferences.getString("ssid", "");
  String pass = preferences.getString("pass", "");

  if (ssid == "") {
    ssid = "4G-UFI-8152"; pass = "1234567890";
    Serial.println(">> Su dung WiFi mac dinh: " + ssid);
  } else {
    Serial.println(">> Su dung WiFi da luu tren Flash Memory: " + ssid);
  }

  Serial.println("Dang ket noi WiFi: " + ssid);
  WiFi.begin(ssid.c_str(), pass.c_str());
  
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 40) { 
    delay(500); Serial.print("."); retries++;
  }

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("\n[!] Loi WiFi! Khong tim thay mang. Chuyen sang AP Mode...");
    WiFi.mode(WIFI_AP);
    WiFi.softAP("MSTech_Config", "12345678");
    Serial.print("IP Cau hinh: "); Serial.println(WiFi.softAPIP());
    isAPMode = true;
  } else {
    Serial.println("\n[v] WiFi KET NOI THANH CONG. IP: " + WiFi.localIP().toString());
    isAPMode = false;
  }
}

// ==============================================================
// 5. HÀM QUẢN LÝ THẺ NHỚ SD
// ==============================================================
void initSDCard() {
  Serial.println(">> Dang kiem tra the Micro SD...");
  spiSD.begin(SPI_SCK, SPI_MISO, SPI_MOSI, SD_CS_PIN);
  if (!SD.begin(SD_CS_PIN, spiSD)) {
    Serial.println("[!] Khong thay the Micro SD (Kiem tra day hoac the bi hu).");
    return;
  }
  if (!SD.exists(fileName)) {
    Serial.println(">> Tao file log_data.csv moi tren SD.");
    dataFile = SD.open(fileName, FILE_WRITE);
    if (dataFile) {
      dataFile.println("timestamp,n,p,k,moisture,soilTemp,waterTemp,ph");
      dataFile.close();
    }
  }
  Serial.println("[v] Khoi tao the SD thanh cong.");
}

void logDataToSD(String timestamp) {
  dataFile = SD.open(fileName, FILE_APPEND);
  if (dataFile) {
    String logLine = timestamp + "," + String(currentN) + "," + String(currentP) + "," + String(currentK) + "," + 
                     String(currentMoist, 1) + "," + String(currentSoilTemp, 1) + "," + 
                     String(currentWaterTemp, 1) + "," + String(currentPh, 2);
    dataFile.println(logLine);
    dataFile.close();
  }
}

// ==============================================================
// 6. THUẬT TOÁN ĐỌC 3 LẦN RỒI TÍNH TRUNG BÌNH
// ==============================================================
void processSensorReading() {
  if (!isReadingSensor) return;

  if (millis() - lastReadTick >= 500) {
    lastReadTick = millis();
    readCount++;

    Serial.printf("\n--- DANG DOC LAN THU %d/3 ---\n", readCount);

    waterSensor.requestTemperatures(); 
    float wTemp = waterSensor.getTempCByIndex(0);
    if(wTemp != DEVICE_DISCONNECTED_C) sumWaterTemp += wTemp;

    long localSumPh = 0;
    for(int i=0; i<10; i++) {
      localSumPh += analogRead(PH_ANALOG_PIN);
      delay(5);
    }
    float voltage = (localSumPh / 10.0) * (3.3 / 4095.0); 
    sumPh += (3.5 * voltage);

    uint8_t resSoil = nodeSoil.readHoldingRegisters(0x0000, 2); 
    if (resSoil == nodeSoil.ku8MBSuccess) {
      sumMoist    += nodeSoil.getResponseBuffer(0) / 10.0; 
      sumSoilTemp += nodeSoil.getResponseBuffer(1) / 10.0; 
    } else {
      Serial.printf("[!] LOI DOC CAM BIEN DAT (ID 2). Ma loi: %X\n", resSoil);
    }

    delay(50); 

    uint8_t resNPK = nodeNPK.readHoldingRegisters(0x001E, 3); 
    if (resNPK == nodeNPK.ku8MBSuccess) {
      sumN += nodeNPK.getResponseBuffer(0); 
      sumP += nodeNPK.getResponseBuffer(1); 
      sumK += nodeNPK.getResponseBuffer(2); 
    } else {
      resNPK = nodeNPK.readHoldingRegisters(0x0000, 3);
      if (resNPK == nodeNPK.ku8MBSuccess) {
        sumN += nodeNPK.getResponseBuffer(0);
        sumP += nodeNPK.getResponseBuffer(1);
        sumK += nodeNPK.getResponseBuffer(2);
      } else {
        Serial.printf("[!] LOI DOC C.BIEN NPK (ID 1). Ma loi: %X\n", resNPK);
      }
    }

    if (readCount >= 3) {
      currentWaterTemp = sumWaterTemp / 3.0;
      currentPh        = sumPh / 3.0;
      currentMoist     = sumMoist / 3.0;
      currentSoilTemp  = sumSoilTemp / 3.0;
      currentN         = sumN / 3;
      currentP         = sumP / 3;
      currentK         = sumK / 3;

      Serial.println("\n[v] HOAN THANH 3 LAN DOC. GIA TRI TRUNG BINH:");
      Serial.printf("Nuoc: %.1fC | pH: %.1f | Dat: %.1f%% - %.1fC | NPK: %d/%d/%d\n", 
                     currentWaterTemp, currentPh, currentMoist, currentSoilTemp, currentN, currentP, currentK);

      String path = "/Stations/" + DEVICE_ID + "/Data";
      FirebaseJson dataNode;
      dataNode.set("n", currentN); dataNode.set("p", currentP); dataNode.set("k", currentK);
      dataNode.set("moisture", currentMoist); dataNode.set("soilTemp", currentSoilTemp); 
      dataNode.set("waterTemp", currentWaterTemp); dataNode.set("ph", currentPh);
      dataNode.set("timestamp", ".sv/timestamp"); 
      
      if (Firebase.RTDB.setJSON(&fbdo, path.c_str(), &dataNode)) {
        Serial.println("[v] Da day ket qua trung binh len Website!");
      }

      String timeString = "SysTime_" + String(millis()); 
      logDataToSD(timeString);
      
      isReadingSensor = false; 
    }
  }
}

// ==============================================================
// 7. LỆNH TỪ WEB & HIỆU ỨNG LED
// ==============================================================
void handleFirebaseCommands() {
  if (isAPMode || !Firebase.ready()) return;

  if (millis() - lastFirebaseCheck > CHECK_INTERVAL) {
    lastFirebaseCheck = millis();

    String cmdPath = "/Stations/" + DEVICE_ID + "/Command";
    if (Firebase.RTDB.getJSON(&fbdo, cmdPath.c_str())) {
      FirebaseJsonData jsonData;
      FirebaseJson& json = fbdo.jsonObject();
      
      json.get(jsonData, "read_soil");
      if (jsonData.success && jsonData.boolValue == true) {
        isReadingSensor = true;
        readCount = 0;
        sumWaterTemp = 0; sumN = 0; sumP = 0; sumK = 0;
        sumMoist = 0; sumSoilTemp = 0; sumPh = 0;
        
        Firebase.RTDB.setBool(&fbdo, (cmdPath + "/read_soil").c_str(), false);
        Serial.println("\n[!] BAT DAU CHU KY DOC CAM BIEN 3 LAN...");
      }

      json.get(jsonData, "update_wifi");
      if (jsonData.success && jsonData.boolValue == true) {
        String newSsid = "";
        String newPass = "";
        
        json.get(jsonData, "wifi_ssid");
        if(jsonData.success) newSsid = jsonData.stringValue;
        
        json.get(jsonData, "wifi_pass");
        if(jsonData.success) newPass = jsonData.stringValue;

        if (newSsid != "") {
          preferences.begin("wifi_config", false);
          preferences.putString("ssid", newSsid);
          preferences.putString("pass", newPass);
          preferences.end();
          
          Serial.println("\n[!] DA LUU WIFI MAC DINH MOI: " + newSsid);
          Serial.println("[!] TRAM SE KHOI DONG LAI DE KET NOI...");
          
          Firebase.RTDB.setBool(&fbdo, (cmdPath + "/update_wifi").c_str(), false);
          delay(1500);
          ESP.restart(); 
        }
      }
    }
  }
}

void processRainbowLed() {
  unsigned long currentMillis = millis();
  if (currentMillis - previousLedMillis >= LED_INTERVAL) {
    previousLedMillis = currentMillis;
    rgbLed.setPixelColor(0, rgbLed.ColorHSV(currentHue, 255, 255)); 
    rgbLed.show();                  
    currentHue += 256; 
    if(currentHue >= 65536) currentHue = 0;
  }
}

// ==============================================================
// 8. SETUP & LOOP
// ==============================================================
void setup() {
  rgbLed.begin();            
  rgbLed.setBrightness(50); 
  rgbLed.setPixelColor(0, rgbLed.Color(255, 0, 0)); 
  rgbLed.show();            
  
  Serial.begin(115200);
  delay(2000); 
  
  Serial.println("\n\n===================================");
  Serial.println("  ESP32-S3 KHOI DONG THANH CONG!");
  Serial.println("===================================");
  
  waterSensor.begin();
  pinMode(PH_ANALOG_PIN, INPUT);
  
  RS485Serial.begin(4800, SERIAL_8N1, RS485_RX_PIN, RS485_TX_PIN); 
  
  nodeNPK.begin(1, RS485Serial); 
  nodeSoil.begin(2, RS485Serial); 
  
  initSDCard();
  initWiFi();

  if (!isAPMode) {
    // Sử dụng Database Secret (Legacy Token) thay vì API Key để tránh lỗi SSL
    config.database_url = "gen-lang-client-0249965989-default-rtdb.asia-southeast1.firebasedatabase.app";
    config.signer.tokens.legacy_token = "kxDR4vOgOeeGIWwLpoDUl6HXYkWJ3UwylatOdPe";
    
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);

    Serial.println(">> Dang khoi tao Firebase...");
    delay(2000); 
    if (Firebase.ready()) {
      Serial.println("[v] KET NOI FIREBASE THANH CONG VA SAN SANG!");
    } else {
      Serial.println("[-] Firebase chua san sang, se thu ket noi ngam...");
    }
  }
}

void loop() {
  processSensorReading();
  handleFirebaseCommands();
  processRainbowLed(); 

  if (millis() - lastAutoLog > AUTO_LOG_INTERVAL) {
    lastAutoLog = millis();
    if (WiFi.status() != WL_CONNECTED) {
      logDataToSD("2026-09-06 17:30:00"); 
    }
  }
  delay(10); 
}
