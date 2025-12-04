const express = require("express");
const cors = require("cors");
const path = require("path");
const OpenAI = require("openai");

const app = express();
app.use(express.json({ limit: "10kb" }));
app.use(cors());

// === CLIENT OPENAI ===
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// === ROUTE DE TEST ===
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "API OK" });
});

// === SERVEUR ===
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("API running on port", PORT);
});

