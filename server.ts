import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Route for PDF Analysis (keep existing just in case)
  app.post("/api/analyze-pdf", async (req, res) => {
    try {
      const { pdfBase64, promptText } = req.body;
      
      if (!pdfBase64) {
        return res.status(400).json({ error: "Không tìm thấy dữ liệu PDF." });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: [
          promptText || "Hãy phân tích nội dung tài liệu này và đưa ra nhận xét, tóm tắt những điểm chính liên quan đến nông nghiệp.",
          {
            inlineData: {
              data: pdfBase64,
              mimeType: "application/pdf"
            }
          }
        ]
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("AI PDF Error:", error);
      res.status(500).json({ error: "Lỗi khi phân tích PDF: " + error.message });
    }
  });

  // API Route for AI Analysis (Structured JSON Output)
  app.post("/api/analyze", async (req, res) => {
    try {
      const { cropType, location, n, p, k, moisture, soilTemp, ph, waterTemp } = req.body;

      const prompt = `Bạn là một chuyên gia nông nghiệp thông minh. 
Dữ liệu cảm biến đo được từ trạm quan trắc nông nghiệp tại khu vực ${location || 'chưa rõ'} như sau:
- Giống cây: ${cropType || 'Chưa rõ'}
- Nitơ (N): ${n ?? 'Chưa có'} mg/kg
- Phốt pho (P): ${p ?? 'Chưa có'} mg/kg
- Kali (K): ${k ?? 'Chưa có'} mg/kg
- Độ ẩm đất: ${moisture ?? 'Chưa có'} %
- Nhiệt độ đất: ${soilTemp ?? 'Chưa có'} °C
- Độ pH: ${ph ?? 'Chưa có'}
- Nhiệt độ nước: ${waterTemp ?? 'Chưa có'} °C

Nếu thiếu dữ liệu nào (null/undefined), hãy ghi rõ là "Chưa có dữ liệu [tên thông số]".
Tuyệt đối KHÔNG tự tạo dữ liệu bịa đặt.
Phân tích tình trạng hiện tại và đưa ra lời khuyên.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: "Bạn là M.S.AI - Trợ lý phân tích nông nghiệp. Trả về đúng định dạng JSON được yêu cầu.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: "Đánh giá tổng quan về tình trạng." },
              nutrients: {
                type: Type.OBJECT,
                properties: {
                  n: { type: Type.STRING, description: "Nhận xét về Nitơ." },
                  p: { type: Type.STRING, description: "Nhận xét về Phốt pho." },
                  k: { type: Type.STRING, description: "Nhận xét về Kali." }
                }
              },
              moisture: { type: Type.STRING, description: "Nhận xét về độ ẩm." },
              ph: { type: Type.STRING, description: "Nhận xét về pH." },
              temperature: { type: Type.STRING, description: "Nhận xét về nhiệt độ đất và nước." },
              anomalies: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các dấu hiệu bất thường nếu có." },
              trends: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Xu hướng hiện tại." },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các hành động khuyến nghị." }
            },
            required: ["summary", "nutrients", "moisture", "ph", "temperature", "anomalies", "trends", "recommendations"]
          }
        }
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      console.error("AI Analyze Error:", error);
      res.status(500).json({ error: "Lỗi khi gọi AI: " + error.message });
    }
  });

  // API Route for AI Chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { userMessage, chatHistory, sensorData } = req.body;
      
      const n = sensorData?.n;
      const p = sensorData?.p;
      const k = sensorData?.k;
      const moisture = sensorData?.moisture;
      const soilTemp = sensorData?.soilTemp;
      const ph = sensorData?.ph;
      const waterTemp = sensorData?.waterTemp;

      const dataContext = sensorData ? `
Dữ liệu cảm biến hiện tại:
- N: ${n ?? 'Chưa có'} mg/kg
- P: ${p ?? 'Chưa có'} mg/kg
- K: ${k ?? 'Chưa có'} mg/kg
- Độ ẩm: ${moisture ?? 'Chưa có'} %
- Nhiệt độ đất: ${soilTemp ?? 'Chưa có'} °C
- pH: ${ph ?? 'Chưa có'}
- Nhiệt độ nước: ${waterTemp ?? 'Chưa có'} °C
` : "Hiện tại chưa có dữ liệu cảm biến.";

      const prompt = `Bạn là M.S.AI, trợ lý nông nghiệp ảo thông minh. 
Người dùng hỏi: "${userMessage}". 

${dataContext}

Tuyệt đối không tự bịa dữ liệu. Nếu thông số nào chưa có, hãy nói rõ là chưa có.
Hãy trả lời ngắn gọn, thân thiện, dễ hiểu bằng tiếng Việt.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: "Lỗi khi gọi AI: " + error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
