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
  res.json({
    success: true,
    scripts: [{
      title: `Script - ${network}`,
      content: '[HOOK] Grabbing attention!\n[BODY] Main content\n[CTA] Follow!',
      score: 75,
      views: 500000,
      engagement: 85
    }]
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
