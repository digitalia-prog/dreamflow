const express = require('express');
const cors = require('cors');
const path = require('path');
const prompts = require('../prompts.json');
const tendances = require('../tendances.json');

const app = express();

app.use(express.json({ limit: '10kb' }));
app.use(cors({ origin: ['http://localhost:3000', 'https://dreamflow.fr'], credentials: true }));
app.use(express.static(path.join(__dirname, '..')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.post('/api/generate', (req, res) => {
  try {
    const { network, language, niche, count } = req.body;
    const scripts = [];
    
    const promptData = prompts[language]?.[network]?.[niche] || "Script générique";
    const trendingTags = tendances[language]?.[network] || [];
    
    for (let i = 1; i <= (parseInt(count) || 1); i++) {
      const randomTags = trendingTags.slice(0, 3).join(' ');
      scripts.push({
        title: `Script ${i} - ${network}`,
        content: `${promptData}\n\nTrendingTags: ${randomTags}`,
        score: Math.floor(Math.random() * 40) + 60,
        views: Math.floor(Math.random() * 900000) + 100000,
        engagement: Math.floor(Math.random() * 40) + 60
      });
    }
    
    res.json({ success: true, scripts: scripts, model: 'Local Prompts + Trends' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
