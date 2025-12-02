import express from "express";
import cors from "cors";
import path from "path";

const app = express();
app.use(express.json());
app.use(cors());

// === HEALTHCHECK ===
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// === LOGIN TEST (TEMPORAIRE) ===
app.post("/api/auth/login", (req, res) => {
  res.json({ success: true, token: "demo-token" });
});

// === STATIC FILES ===
app.use(express.static(path.join(process.cwd())));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("⚡ API RUNNING ON", PORT));
