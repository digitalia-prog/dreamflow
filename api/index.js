const express = require('express');
const cors = require('cors');
const path = require('path');
const prompts = require('../prompts.json');
const tendances = require('../tendances.json');
const rateLimiter = require('./security');

const app = express();

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  next();
});

app.use(express.json({ limit: '10kb' }));
app.use(cors({ origin: ['http://localhost:3000', 'https://dreamflow-api.onrender.com'], credentials: true }));
app.use(express.static(path.join(__dirname, '..')));

let brandProfiles = {};
let analytics = { totalScripts: 0, totalUsers: 0 };

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', analytics });
});

app.post('/api/brand', (req, res) => {
  const { brandId, name, industry, tone, plan } = req.body;
  if (!brandId || !name) return res.status(400).json({ error: 'Missing fields' });
  brandProfiles[brandId] = { name, industry, tone, plan: plan || 'starter' };
  analytics.totalUsers++;
  res.json({ success: true, brand: brandProfiles[brandId] });
});

app.post('/api/generate', (req, res) => {
  try {
    const { network, language, niche, count, brandId } = req.body;
    if (!network || !language) return res.status(400).json({ error: 'Missing fields' });
    
    const brand = brandProfiles[brandId] || { name: 'Brand', tone: 'casual', plan: 'starter' };
    
    // Vérifier rate limit
    const rateCheck = rateLimiter.checkRateLimit(brandId, brand.plan);
    if (!rateCheck.allowed) {
      return res.status(429).json({ error: rateCheck.reason, details: rateCheck });
    }

    const scripts = [];
    const promptData = prompts[language]?.[network]?.[niche] || "Script générique";
    const trendingTags = tendances[language]?.[network] || [];
    
    const numScripts = Math.min(parseInt(count) || 1, 500);
    
    for (let i = 1; i <= numScripts; i++) {
      const randomTags = trendingTags.slice(0, 3).join(' ');
      const personalizedScript = `${promptData}\n\nBrand: ${brand.name}\nTone: ${brand.tone}\nTags: ${randomTags}`;
      
      scripts.push({
        title: `Script ${i} - ${network}`,
        content: personalizedScript,
        score: Math.floor(Math.random() * 40) + 60,
        views: Math.floor(Math.random() * 900000) + 100000,
        engagement: Math.floor(Math.random() * 40) + 60
      });
      
      analytics.totalScripts++;
    }
    
    res.json({ 
      success: true, 
      scripts: scripts, 
      brand: brand.name,
      rateLimit: rateCheck
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/analytics', (req, res) => {
  res.json({ scripts: analytics.totalScripts, users: analytics.totalUsers });
});

app.get('/api/user/:userId/stats', (req, res) => {
  const stats = rateLimiter.getUserStats(req.params.userId);
  res.json(stats || { error: 'User not found' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dashboard.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
