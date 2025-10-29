// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors()); // يسمح لكل Origins يطلبوا

// Endpoint وسيط
app.get("/quran/:page", async (req, res) => {
  try {
    const page = req.params.page;
    const response = await axios.get(`https://api.alquran.cloud/v1/page/${page}/quran-uthmani`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Error fetching data" });
  }
});

app.listen(3000, () => console.log("✅ Proxy running on http://localhost:3000"));
