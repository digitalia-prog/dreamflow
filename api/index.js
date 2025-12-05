const express = require("express");
const cors = require("cors");
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

// === ROUTE /api/generate ===
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
        {
          role: "system",
          content: "Tu es un générateur de scripts viraux TikTok."
        },
        {
          role: "user",
          content: prompt
        }
      ],
    });

    const result = completion.choices?.[0]?.message?.content || "";

    return res.json({
      success: true,
      script: result,
    });

  } catch (err) {
    console.error("Erreur /api/generate :", err);
    return res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la génération",
    });
  }
});

// === SERVEUR ===
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("API running on port", PORT);
});

