const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, User, Script } = require('./database');
const { generateToken, verifyToken } = require('./auth');

const app = express();

// Middleware
app.use(express.json({ limit: '10kb' }));
app.use(cors({
  origin: ['https://magnifique-longma-bd6a8c.netlify.app', 'http://localhost:3000'],
  credentials: true
}));

// Serve static files (index.html, CSS, JS)
app.use(express.static(path.join(__dirname, '..')));

// Connect to MongoDB
connectDB();

// Middleware: Verify JWT
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing token' });
  
  const decoded = verifyToken(token);
  if (!decoded) return res.status(403).json({ error: 'Invalid token' });
  
  req.user = decoded;
  next();
};

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({ email, password, plan: 'FREE' });
    }
    
    const token = generateToken(user._id);
    res.json({ success: true, token, user: { email: user.email, plan: user.plan } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate scripts endpoint
app.post('/api/generate', authenticate, async (req, res) => {
  try {
    const { network, language, count } = req.body;
    
    if (!network || !language || !count) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
    
    const user = await User.findById(req.user.userId);
    
    if (user.plan === 'FREE' && user.scriptsUsed >= 5) {
      return res.status(429).json({ error: 'Limit reached. Upgrade to PRO!' });
    }
    
    const scripts = [];
    for (let i = 0; i < parseInt(count); i++) {
      const script = {
        title: `Script ${i + 1}`,
        content: `[HOOK] Accroche virale\n[BODY] Contenu engageant\n[CTA] Appel à action`,
        network,
        language,
      };
      scripts.push(script);
      await Script.create({ userId: user._id, ...script });
    }
    
    user.scriptsUsed += parseInt(count);
    await user.save();
    
    res.json({ success: true, scripts, model: 'GPT-4o Mini' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Serve index.html for all other routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
