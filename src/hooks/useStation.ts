import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../lib/firebase';
import { SensorData, StationCommand, StationStatus, DemoModeType, HistoryRecord } from '../types';

export const useStation = (deviceId: string | null, isDemo: DemoModeType) => {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [commandState, setCommandState] = useState<StationCommand | null>(null);
  const [status, setStatus] = useState<StationStatus | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<(HistoryRecord & { timeStr: string })[]>([]);

  useEffect(() => {
    if (!deviceId && !isDemo) {
      setSensorData(null);
      setIsOnline(false);
      return;
    }

    if (isDemo) {
      const demoData = {
        n: 120, p: 65, k: 180, moisture: 54.5, soilTemp: 28.2, waterTemp: 27.4, ph: 6.5, timestamp: Date.now()
      };
      setSensorData(demoData);
      setIsOnline(true);
      setLastUpdated(new Date().toLocaleTimeString('vi-VN'));
      
      const time = new Date();
      setHistoryData([{
        ...demoData,
        timeStr: `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')} ${time.getDate()}/${time.getMonth()+1}`
      }]);
      return;
    }

    const dataRef = ref(db, `/Stations/${deviceId}/Data`);
    const cmdRef = ref(db, `/Stations/${deviceId}/Command`);
    const statusRef = ref(db, `/Stations/${deviceId}/Status`);
    const historyRef = ref(db, `/Stations/${deviceId}/History`);

    const unsubscribeData = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        setSensorData(val);
        setIsOnline(true); // Assuming receiving data means online for now, as firmware lacks heartbeat
        setLastUpdated(new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));
      } else {
        setSensorData(null);
        setIsOnline(false);
      }
    });

    const unsubscribeCmd = onValue(cmdRef, (snapshot) => {
      if (snapshot.exists()) {
        setCommandState(snapshot.val());
      }
    });

    const unsubscribeStatus = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        setStatus(snapshot.val());
      }
    });

    const unsubscribeHistory = onValue(historyRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list = Object.keys(val).map(key => {
          const item = val[key];
          const time = new Date(item.timestamp || Date.now());
          return {
            ...item,
            timeStr: `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')} ${time.getDate()}/${time.getMonth()+1}`
          };
        });
        setHistoryData(list.slice(-30));
      } else {
        setHistoryData([]);
      }
    });

    return () => {
      unsubscribeData();
      unsubscribeCmd();
      unsubscribeStatus();
      unsubscribeHistory();
    };
  }, [deviceId, isDemo]);

  // Fallback history for when history is not synced to Firebase
  useEffect(() => {
    if (sensorData && !isDemo) {
      setHistoryData(prev => {
        const isDuplicate = prev.length > 0 && prev[prev.length-1].timestamp === sensorData.timestamp;
        if (isDuplicate) return prev;

        const time = new Date(sensorData.timestamp || Date.now());
        const newEntry = {
          ...sensorData,
          timeStr: `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')} ${time.getDate()}/${time.getMonth()+1}`
        };
        const newList = [...prev, newEntry];
        return newList.slice(-30);
      });
    }
  }, [sensorData, isDemo]);

  const sendMeasureCommand = useCallback(async () => {
    if (isDemo || !deviceId) return;
    await set(ref(db, `/Stations/${deviceId}/Command/read_soil`), true);
  }, [deviceId, isDemo]);

  const updateWifi = useCallback(async (ssid: string, pass: string) => {
    if (isDemo || !deviceId) return;
    await set(ref(db, `/Stations/${deviceId}/Command/wifi_ssid`), ssid);
    await set(ref(db, `/Stations/${deviceId}/Command/wifi_pass`), pass);
    await set(ref(db, `/Stations/${deviceId}/Command/update_wifi`), true);
  }, [deviceId, isDemo]);

  return {
    sensorData,
    commandState,
    status,
    isOnline,
    lastUpdated,
    historyData,
    sendMeasureCommand,
    updateWifi
  };
};
