"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setResult("");

    const res = await fetch("https://dreamflow-api.onrender.com/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    setResult(data.script || data.error || "Erreur");
    setLoading(false);
  }

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>🚀 DreamFlow Pro</h1>
      <p>Générateur IA de scripts viraux</p>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ex: Script TikTok pour vendre une app IA"
        rows={4}
        style={{ width: "100%", padding: 10 }}
      />

      <br />

      <button onClick={generate} disabled={loading} style={{ marginTop: 10 }}>
        {loading ? "Génération..." : "Générer"}
      </button>

      {result && (
        <pre style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>
          {result}
        </pre>
      )}
    </main>
  );

