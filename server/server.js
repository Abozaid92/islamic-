// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch"; // node-fetch v3 (ESM)
dotenv.config();

const app = express();

// إعدادات بسيطة للـ CORS — خليها محددة لو عندك دومين فرونتند
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";
app.use(cors({ origin: FRONTEND_ORIGIN }));

app.use(express.json());

// Logger بسيط
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// health check
app.get("/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.post("/chat", async (req, res) => {
  try {
    const userMessage = String(req.body?.message || "").trim();
    if (!userMessage) return res.status(400).json({ reply: "الرسالة فارغة" });

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      console.error("⚠️ Missing API_KEY in environment.");
      return res.status(500).json({ reply: "مشكلة إعداد السيرفر: API_KEY مفقود" });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    // timeout باستخدام AbortController (Node 18+ يدعم AbortController)
    const controller = new AbortController();
    const TIMEOUT_MS = Number(process.env.API_TIMEOUT_MS || 15000); // 15s by default
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const body = {
      contents: [{ parts: [{ text: userMessage }] }]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const txt = await response.text().catch(() => "<non-text response>");
      console.error("🛑 Gemini API responded with status", response.status, txt);
      return res.status(502).json({ reply: "خطأ من مزود الخدمة الخارجية" });
    }

    const data = await response.json().catch((e) => {
      console.error("Error parsing JSON from Gemini:", e);
      return null;
    });

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ لم أستطع الفهم";

    return res.json({ reply });
  } catch (err) {
    if (err.name === "AbortError") {
      console.error("⚠️ Request to Gemini timed out.");
      return res.status(504).json({ reply: "انتهت مهلة الطلب (timeout)" });
    }
    console.error("❌ Server error:", err);
    return res.status(500).json({ reply: "حدث خطأ في السيرفر" });
  }
});

// PORT قابل للتغيير عبر ENV. Railway / Render / Railway يمرر PORT تلقائياً.
const PORT = Number(process.env.PORT || 8080);

// مهم: استمع على 0.0.0.0 علشان السيرفر يقبل اتصالات من داخل الحاوية ومن الشبكة
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} (API_KEY ${process.env.API_KEY ? "set" : "NOT set"})`);
});

// دفاع عن أخطاء غير معلنة
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
