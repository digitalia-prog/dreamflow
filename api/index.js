const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Test endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Fake generator
app.post("/api/generate", (req, res) => {
  res.json({
    success: true,
    scripts: [
      {
        title: "Script généré",
        script: "Ton backend fonctionne maintenant 🔥"
      }
    ]
  });
});

app.get("/", (req, res) => {
  res.send("Backend DreamFlow OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🔥 Backend OK sur port", PORT));
