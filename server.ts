import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
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

  app.use(express.json());

  // API Route for AI Analysis
  app.post("/api/analyze", async (req, res) => {
    try {
      const { cropType, location, n, p, k, moisture, soilTemp, ph, waterTemp } = req.body;

      if (!cropType) {
        return res.status(400).json({ error: "Vui lòng nhập tên giống cây." });
      }

      const prompt = `Bạn là một chuyên gia nông nghiệp thông minh. 
Dữ liệu cảm biến đo được từ trạm quan trắc nông nghiệp tại khu vực ${location || 'chưa rõ'} như sau:
- Giống cây: ${cropType}
- Nitơ (N): ${n} mg/kg
- Phốt pho (P): ${p} mg/kg
- Kali (K): ${k} mg/kg
- Độ ẩm đất: ${moisture} %
- Nhiệt độ đất: ${soilTemp} °C
- Độ pH (Nước/Đất): ${ph}
- Nhiệt độ nước: ${waterTemp} °C

Dựa trên dữ liệu trên, kết hợp với DỰ BÁO THỜI TIẾT và KHÍ HẬU hiện tại tại khu vực ${location || 'chưa rõ'} (Hãy sử dụng công cụ tìm kiếm Google để lấy thông tin thời tiết khu vực này), hãy phân tích:
1. Đánh giá nhanh tình trạng hiện tại của môi trường trồng.
2. Suy luận thời tiết khu vực và ảnh hưởng: (Kết hợp dữ liệu cảm biến và dự báo thời tiết thực tế).
3. Đưa ra phương án cải tạo thực tế (ví dụ: cần tưới thêm bao nhiêu nước trong bao lâu, bón thêm loại phân gì, có cần che nắng/che mưa hay không).

Viết ngắn gọn, súc tích, dễ hiểu và format bằng Markdown. Không cần chào hỏi dài dòng.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        tools: [{ googleSearch: {} }]
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("AI Error:", error);
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
