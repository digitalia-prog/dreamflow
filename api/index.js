const express = require('express');
const cors = require('cors');
const { connectDB, User, Script } = require('./database');
const { generateToken, verifyToken } = require('./auth');

const app = express();
app.use(express.json());
app.use(cors());

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
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate scripts endpoint
app.post('/api/generate', authenticate, async (req, res) => {
  try {
    const { network, language, count } = req.body;
    const user = await User.findById(req.user.userId);
    
    // Check limit
    if (user.plan === 'FREE' && user.scriptsUsed >= 5) {
      return res.status(429).json({ error: 'Limit reached' });
    }
    
    // Simulate script generation (replace with real API call)
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
    
    // Update usage
    user.scriptsUsed += parseInt(count);
    await user.save();
    
    res.json({ success: true, scripts, model: 'GPT-4o Mini' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
