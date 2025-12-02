const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// Servir tous les fichiers HTML, CSS, JS du dossier parent
app.use(express.static(path.join(__dirname, "..")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Fake generator (temporaire)
app.post("/api/generate", (req, res) => {
  res.json({
    success: true,
    scripts: [
      {
        title: "Script généré",
        script: "Ton backend fonctionne 🔥 (frontend réactivé)"
      }
    ]
  });
});

// Routes frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.get("/dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dashboard.html"));
});

app.get("/admin.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "admin.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🔥 Backend + Frontend DreamFlow OK sur port", PORT));
