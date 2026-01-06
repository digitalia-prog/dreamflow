"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!prompt) return;

    setLoading(true);
    setResult("");

    try {
      const res = await fetch("https://dreamflow-api.onrender.com/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setResult(data.script || data.error || "Erreur");
    } catch (e) {
      setResult("Erreur de connexion à l’API");
    }

    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 700, margin: "60px auto", fontFamily: "Arial" }}>
      <h1>🚀 DreamFlow Pro</h1>
      <p>Générateur IA de scripts viraux</p>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ex : Script TikTok pour vendre une application IA"
        rows={4}
        style={{ width: "100%", padding: 12, fontSize: 16 }}
      />

      <br /><br />

      <button
        onClick={generate}
        disabled={loading}
        style={{ padding: "10px 20px", fontSize: 16 }}
      >
        {loading ? "Génération..." : "Générer"}
      </button>

      {result && (
        <pre
          style={{
            marginTop: 20,
            whiteSpace: "pre-wrap",
            background: "#f4f4f4",
            padding: 15,
            borderRadius: 6,
          }}
        >
          {result}
        </pre>
      )}
    </main>
  );
}
