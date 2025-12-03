const express = require("express");
const cors = require("cors");
const path = require("path");
const OpenAI = require("openai");

const app = express();
app.use(express.json({ limit: "10kb" }));
app.use(cors());

// === STORAGE EN MÉMOIRE ===
let brandProfiles = {};
let userHistory = {};
let analytics = {
  totalScripts: 0,
  totalUsers: 0,
};

// === CLIENT OPENAI ===
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// === SERVIR LE FRONTEND (dossier parent) ===
app.use(express.static(path.join(__dirname, "..")));

// === HEALTHCHECK ===
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", analytics });
});

// === CRÉER / METTRE À JOUR UNE MARQUE ===
app.post("/api/brand", (req, res) => {
  const { brandId, name, industry, tone, plan } = req.body;

  if (!brandId || !name) {
    return res
      .status(400)
      .json({ success: false, error: "brandId et name sont requis" });
  }

  brandProfiles[brandId] = {
    name,
    industry: industry || "Agence / Créateur",
    tone: tone || "Direct, moderne, orienté performance",
    plan: plan || "starter",
  };

  analytics.totalUsers++;

  res.json({ success: true, brand: brandProfiles[brandId] });
});

// === GÉNÉRATION DE SCRIPTS AVEC OPENAI ===
app.post("/api/generate", async (req, res) => {
  try {
    const {
      brandId,
      network,
      niche,
      angle,
      language = "français",
      count = 3,
    } = req.body;

    if (!network || !niche) {
      return res.status(400).json({
        success: false,
        error: "network et niche sont obligatoires",
      });
    }

    const brand = brandProfiles[brandId] || {};
    const langLabel =
      language.toLowerCase().startsWith("en") || language === "English"
        ? "English"
        : "French";

    const userPrompt = `
Génère ${count} scripts vidéos ULTRA VIRAUX pour ${network}.
Langue : ${langLabel}.
Niche : ${niche}.
Angle / objectif : ${
      angle || "générer des ventes et de la croissance pour le client."
    }

Profil de la marque :
- Nom : ${brand.name || "Client DreamFlow"}
- Secteur : ${brand.industry || "Agence / E-commerce / Infopreneur"}
- Ton : ${brand.tone || "Direct, dynamique, orienté résultat"}

Chaque script doit être structuré :
- "title" : titre très court et accrocheur
- "hook" : phrase d'accroche choc pour arrêter le scroll
- "body" : 2 à 4 lignes maximum, rythme rapide, ultra concret
- "cta" : appel à l'action clair
- "estimated_views" : estimation du potentiel de vues (nombre entier)
- "viral_score" : score viral de 0 à 100

IMPORTANT :
- Optimise pour TikTok / Reels / Shorts (contenu rapide, dynamique).
- Utilise des mécaniques virales : curiosité, promesse forte, pattern interrupt, social proof.
- Pas de pavé, reste très concis.

Répond UNIQUEMENT avec du JSON STRICT de cette forme :

{
  "scripts": [
    {
      "title": "...",
      "hook": "...",
      "body": "...",
      "cta": "...",
      "estimated_views": 123456,
      "viral_score": 92
    }
  ]
}
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.9,
      max_tokens: 1200,
      messages: [
        {
          role: "system",
          content:
            "Tu es un expert en marketing d'agence. Tu écris des scripts vidéos ULTRA VIRAUX pour TikTok / Reels / Shorts. Tu respectes STRICTEMENT le format JSON demandé.",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content || "{}";

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error("Erreur parse JSON OpenAI:", raw);
      return res.status(500).json({
        success: false,
        error: "Réponse IA invalide (parse JSON)",
      });
    }

    const scriptsFromIA = Array.isArray(data.scripts) ? data.scripts : [];

    const scripts = scriptsFromIA.map((s, idx) => ({
      id: "script_" + Date.now() + "_" + idx,
      network,
      niche,
      title: s.title,
      hook: s.hook,
      body: s.body,
      cta: s.cta,
      score: s.viral_score,
      views: s.estimated_views,
      createdAt: new Date().toISOString(),
    }));

    analytics.totalScripts += scripts.length;

    if (brandId && scripts.length > 0) {
      if (!userHistory[brandId]) userHistory[brandId] = [];
      userHistory[brandId].push(...scripts);
    }

    return res.json({ success: true, scripts });
  } catch (err) {
    console.error("Erreur /api/generate :", err);
    return res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la génération des scripts",
    });
  }
});

// === HISTORIQUE PAR MARQUE ===
app.get("/api/brand/:brandId/history", (req, res) => {
  const history = userHistory[req.params.brandId] || [];
  res.json({ success: true, history });
});

// === ROUTE FRONTEND PRINCIPALE ===
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// === DÉMARRAGE SERVEUR ===
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("🔥 DreamFlow Backend + Frontend running on port", PORT);
});
