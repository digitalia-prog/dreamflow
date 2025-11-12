const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'DreamFlow API',
    timestamp: new Date().toISOString()
  });
});

// Simple test endpoint
app.post('/api/generate', (req, res) => {
  const { network, language, count } = req.body;
  
  res.json({
    success: true,
    network,
    language,
    scripts: Array.from({ length: count || 5 }, (_, i) => ({
      id: i + 1,
      title: `Script ${i + 1}`,
      content: `[HOOK] Attention-grabbing!\n[BODY] Main content\n[CTA] Call to action!`
    }))
  });
});

app.listen(PORT, () => {
  console.log(`✅ DreamFlow API running on http://localhost:${PORT}`);
});
