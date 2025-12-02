import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.post("/api/generate", (req, res) => {
  res.json({
    success: true,
    scripts: [
      { title: "Script de test", script: "Ton script fonctionne 🔥" }
    ]
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Serveur OK sur port", PORT));
