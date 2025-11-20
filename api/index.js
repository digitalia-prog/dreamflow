const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(express.json({ limit: '10kb' }));
app.use(cors({
  origin: ['https://magnifique-longma-bd6a8c.netlify.app', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.static(path.join(__dirname, '..')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.post('/api/generate', (req, res) => {
  const { network, language, count } = req.body;
  const scripts = [];
  for (let i = 1; i <= (parseInt(count) || 1); i++) {
    scripts.push({
      title: `Script ${i} - ${network}`,
      content: '[HOOK] Attention!\n[BODY] Content\n[CTA] Follow!',
      score: Math.floor(Math.random() * 40) + 60,
      views: Math.floor(Math.random() * 900000) + 100000,
      engagement: Math.floor(Math.random() * 40) + 60
    });
  }
  res.json({ success: true, scripts: scripts, model: 'GPT-4o Mini' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
EOF~
