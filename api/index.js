
app.post("/api/generate", (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: "Prompt manquant",
    });
  }

  return res.json({
    success: true,
    script: `🎯 Script généré pour : ${prompt}`,
  });
});
