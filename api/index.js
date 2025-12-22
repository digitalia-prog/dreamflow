import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "API OK 🚀" });
});

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "Prompt manquant",
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "Tu es un générateur de scripts viraux TikTok." },
        { role: "user", content: prompt }
      ],
    });

    const result = completion.choices?.[0]?.message?.content || "";

    res.json({ success: true, script: result });
  } catch (err) {
    console.error("Erreur /api/generate :", err);
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la génération",
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

