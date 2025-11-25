const express = require('express');
const cors = require('cors');
const path = require('path');
const prompts = require('../prompts.json');
const tendances = require('../tendances.json');

const app = express();
app.use(express.json({ limit: '10kb' }));
app.use(cors({ origin: ['http://localhost:3000', 'https://dreamflow.fr'], credentials: true }));
app.use(express.static(path.join(__dirname, '..')));

let brandProfiles = {};

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/api/brand', (req, res) => {
  const { brandId, name, industry, tone } = req.body;
  brandProfiles[brandId] = { name, industry, tone };
  res.json({ success: true, brand: brandProfiles[brandId] });
});

app.post('/api/generate', (req, res) => {
  try {
    const { network, language, niche, count, brandId } = req.body;
    const scripts = [];
    
    const brand = brandProfiles[brandId] || { name: 'Brand', tone: 'casual' };
    const promptData = prompts[language]?.[network]?.[niche] || "Script générique";
    const trendingTags = tendances[language]?.[network] || [];
    
    for (let i = 1; i <= (parseInt(count) || 1); i++) {
      const randomTags = trendingTags.slice(0, 3).join(' ');
      const personalizedScript = `${promptData}\n\nBrand: ${brand.name}\nTone: ${brand.tone}\nTags: ${randomTags}`;
      
      scripts.push({
        title: `Script ${i} - ${network}`,
        content: personalizedScript,
        score: Math.floor(Math.random() * 40) + 60,
        views: Math.floor(Math.random() * 900000) + 100000,
        engagement: Math.floor(Math.random() * 40) + 60
      });
    }
    
    res.json({ success: true, scripts: scripts, brand: brand.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
