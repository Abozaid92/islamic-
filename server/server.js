// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch"; // تأكد أنك نصّبت node-fetch: npm i node-fetch

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// middleware بسيط للـ logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.post("/chat", async (req, res) => {
  try {
    const userMessage = String(req.body?.message || "").trim();
    if (!userMessage) return res.status(400).json({ reply: "الرسالة فارغة" });

    if (!process.env.API_KEY) {
      console.error("⚠️ Missing API_KEY in environment (process.env.API_KEY).");
      return res.status(500).json({ reply: "مشكلة إعداد السيرفر: API_KEY مفقود" });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }]
      }),
      // timeout logic يمكن إضافته إذا لزم
    });

    if (!response.ok) {
      const txt = await response.text();
      console.error("🛑 Gemini API responded with status", response.status, txt);
      return res.status(502).json({ reply: "خطأ من مزود الخدمة الخارجية" });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ لم أستطع الفهم";

    res.json({ reply });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ reply: "حدث خطأ في السيرفر" });
  }
});

// اجعل المنفذ قابل للتغيير عبر ENV
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// استمع على كل الواجهات — مهم لو تستخدم Docker/WSL
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT} (process.env.API_KEY ${process.env.API_KEY ? "set" : "NOT set"})`);
});

// دفاع ضد أخطاء غير معلنة
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});