const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json({ limit: "10kb" }));
app.use(cors());

// === STOCKAGE EN MÉMOIRE ===
let brandProfiles = {};
let userHistory = {};
let analytics = {
  totalScripts: 0,
  totalUsers: 0
};

// === SERVIR LE FRONTEND ===
app.use(express.static(path.join(__dirname, "..")));

// === HEALTHCHECK ===
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", analytics });
});

// === CRÉER / METTRE À JOUR UNE MARQUE ===
app.post("/api/brand", (req, res) => {
  const { brandId, name, industry, tone, plan } = req.body;

  brandProfiles[brandId] = {
    name,
    industry,
    tone,
    plan: plan || "starter"
  };

  analytics.totalUsers++;
  res.json({ success: true, brand: brandProfiles[brandId] });
});

// === GÉNÉRER DES SCRIPTS ===
app.post("/api/generate", (req, res) => {
  const { brandId, network, niche, count } = req.body;

  const scripts = [];

  for (let i = 0; i < (count || 1); i++) {
    scripts.push({
      id: "script_" + Date.now() + "_" + i,
      network,
      niche,
      content: `[HOOK] ${niche} tendance ! [BODY] Idée virale générée. [CTA] Sauvegarde !`,
      score: Math.floor(Math.random() * 40) + 60,
      views: Math.floor(Math.random() * 900000),
      engagement: Math.floor(Math.random() * 20) + 5,
      createdAt: new Date(),
    });
  }

  analytics.totalScripts += scripts.length;

  if (!userHistory[brandId]) userHistory[brandId] = [];
  userHistory[brandId].push(...scripts);

  res.json({ success: true, scripts });
});

// === HISTORIQUE ===
app.get("/api/brand/:brandId/history", (req, res) => {
  const history = userHistory[req.params.brandId] || [];
  res.json({ success: true, history });
});

// === ROUTE FRONTEND ===
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// === DEMARRAGE SERVEUR ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log("🔥 DreamFlow Backend + Frontend running on port", PORT)
);
