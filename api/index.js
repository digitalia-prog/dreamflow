import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// TEST ROUTE
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "API OK 🚀" });
});

// GENERATE (VERSION STABLE SANS OPENAI POUR TEST)
app.post("/api/generate", (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: "Prompt manquant",
    });
  }

  return res.json({
    success: true,
    script: `🎯 Script généré pour : ${prompt}`,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
