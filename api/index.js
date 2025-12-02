import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());
app.use(cors());

// FAKE DATABASE
const users = {};

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email & mot de passe requis" });
  }

  if (users[email]) {
    return res.status(400).json({ error: "Compte déjà existant" });
  }

  const hashed = await bcrypt.hash(password, 10);
  users[email] = { email, password: hashed };

  res.json({ success: true });
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!users[email]) {
    return res.status(400).json({ error: "Email incorrect" });
  }

  const valid = await bcrypt.compare(password, users[email].password);
  if (!valid) {
    return res.status(400).json({ error: "Mot de passe incorrect" });
  }

  const token = jwt.sign({ email }, "secret123", { expiresIn: "2h" });

  res.json({ success: true, token });
});

// PROTECTED ROUTE
app.get("/api/protected", (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  try {
    const decoded = jwt.verify(token, "secret123");
    res.json({ success: true, email: decoded.email });
  } catch (err) {
    res.status(401).json({ error: "Token invalide" });
  }
});

// START SERVER
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("⚡ API RUNNING ON", PORT));

