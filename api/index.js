import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// QUOTAS PAR PLAN
// ==========================================
const QUOTAS = {
  free: { daily: 3, monthly: 30, perMinute: 1 },
  pro: { daily: 50, monthly: 500, perMinute: 5 },
  premium: { daily: 500, monthly: 5000, perMinute: 20 }
};

// ==========================================
// STOCKAGE EN MÉMOIRE (à remplacer par MongoDB)
// ==========================================
const users = new Map(); // {userId: {plan, dailyUsage, monthlyUsage, lastRequest, blockedUntil}}
const blockedUsers = new Set();

// ==========================================
// MIDDLEWARE DE SÉCURITÉ
// ==========================================
const securityMiddleware = (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const token = req.headers['authorization']?.split(' ')[1];

    // Vérifier l'authentification
    if (!userId || !token) {
      return res.status(401).json({ 
        error: 'Non authentifié. Headers requis: x-user-id et Authorization' 
      });
    }

    // Vérifier si l'utilisateur est bloqué
    if (blockedUsers.has(userId)) {
      return res.status(403).json({ 
        error: 'Compte bloqué pour abus détecté. Contactez support@dreamflow.ai' 
      });
    }

    // Initialiser l'utilisateur s'il n'existe pas
    if (!users.has(userId)) {
      users.set(userId, {
        plan: 'free',
        dailyUsage: {},
        monthlyUsage: {},
        lastRequest: null,
        abuseCount: 0,
        requestHistory: []
      });
    }

    const user = users.get(userId);
    const now = Date.now();

    // ========== RATE LIMITING (par minute) ==========
    const oneMinuteAgo = now - 60000;
    user.requestHistory = user.requestHistory.filter(t => t > oneMinuteAgo);
    
    const plan = user.plan || 'free';
    const maxPerMinute = QUOTAS[plan].perMinute;
    
    if (user.requestHistory.length >= maxPerMinute) {
      return res.status(429).json({ 
        error: `Rate limit atteint. Max ${maxPerMinute} requête(s)/minute pour le plan ${plan}` 
      });
    }

    user.requestHistory.push(now);

    // ========== QUOTA QUOTIDIEN ==========
    const today = new Date().toDateString();
    if (!user.dailyUsage[today]) {
      user.dailyUsage[today] = 0;
    }

    const maxDaily = QUOTAS[plan].daily;
    if (user.dailyUsage[today] >= maxDaily) {
      return res.status(429).json({ 
        error: `Quota quotidien atteint (${maxDaily}/jour). Revenez demain !` 
      });
    }

    // ========== QUOTA MENSUEL ==========
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (!user.monthlyUsage[currentMonth]) {
      user.monthlyUsage[currentMonth] = 0;
    }

    const maxMonthly = QUOTAS[plan].monthly;
    if (user.monthlyUsage[currentMonth] >= maxMonthly) {
      return res.status(429).json({ 
        error: `Quota mensuel atteint (${maxMonthly}/mois). Upgrade ton plan !` 
      });
    }

    // Ajouter les infos à la requête
    req.user = {
      id: userId,
      plan: plan,
      dailyRemaining: maxDaily - user.dailyUsage[today],
      monthlyRemaining: maxMonthly - user.monthlyUsage[currentMonth]
    };

    next();

  } catch (error) {
    console.error('Security error:', error);
    res.status(500).json({ error: 'Erreur de sécurité' });
  }
};

// ==========================================
// FONCTION WATERMARK
// ==========================================
const addWatermark = (script, userId) => {
  const userShort = userId.slice(-6);
  const watermark = `\n\n---\n✨ Script généré par DreamFlow IA | ID: ${userShort}\n`;
  return script + watermark;
};

// ==========================================
// FONCTION DÉTECTION D'ABUS
// ==========================================
const trackAbuse = (userId) => {
  const user = users.get(userId);
  user.abuseCount = (user.abuseCount || 0) + 1;

  // Bloquer après 5 tentatives suspectes
  if (user.abuseCount >= 5) {
    blockedUsers.add(userId);
    console.warn(`⚠️ Utilisateur ${userId} BLOQUÉ pour abus`);
    return true;
  }
  
  return false;
};

// ==========================================
// ROUTES
// ==========================================

app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "API OK 🚀" });
});

// ROUTE SÉCURISÉE DE GÉNÉRATION
app.post("/api/generate", securityMiddleware, (req, res) => {
  try {
    const { prompt, niche, tone, platform } = req.body;
    const userId = req.user.id;
    const plan = req.user.plan;
    const user = users.get(userId);

    // ========== VALIDATION DU PROMPT ==========
    if (!prompt || prompt.length < 5) {
      trackAbuse(userId);
      return res.status(400).json({ 
        error: 'Prompt invalide (minimum 5 caractères)' 
      });
    }

    // ========== LIMITER LES GROS PROMPTS ==========
    if (prompt.length > 5000) {
      trackAbuse(userId);
      return res.status(400).json({ 
        error: 'Prompt trop long (maximum 5000 caractères)' 
      });
    }

    // ========== GÉNÉRER LE SCRIPT ==========
    // TODO: Intégrer OpenAI ici
    let script = `🎯 Script généré pour: ${prompt}
📱 Plateforme: ${platform || 'TikTok'}
🎨 Ton: ${tone || 'Naturel'}
🎯 Niche: ${niche || 'Général'}

Contenu:
- Hook accrocheur en 3 secondes
- Message principal clair
- CTA (Appel à l'action)`;

    // ========== AJOUTER LE WATERMARK ==========
    script = addWatermark(script, userId);

    // ========== METTRE À JOUR LES QUOTAS ==========
    const today = new Date().toDateString();
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    user.dailyUsage[today]++;
    user.monthlyUsage[currentMonth]++;
    user.abuseCount = 0; // Réinitialiser le compteur d'abus

    // ========== RÉPONDRE ==========
    res.json({
      success: true,
      script: script,
      quotas: {
        dailyRemaining: req.user.dailyRemaining - 1,
        monthlyRemaining: req.user.monthlyRemaining - 1,
        plan: plan
      },
      message: `✅ Script généré ! (${req.user.dailyRemaining - 1}/${QUOTAS[plan].daily} restants aujourd'hui)`
    });

    console.log(`✅ ${userId} (${plan}) - Script généré`);

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Erreur lors de la génération' });
  }
});

// ROUTE POUR VÉRIFIER LES QUOTAS
app.get("/api/quotas", securityMiddleware, (req, res) => {
  const userId = req.user.id;
  const user = users.get(userId);
  const plan = user.plan;

  res.json({
    plan: plan,
    limits: QUOTAS[plan],
    remaining: {
      daily: req.user.dailyRemaining,
      monthly: req.user.monthlyRemaining
    }
  });
});

// ROUTE POUR UPGRADE LE PLAN (exemple)
app.post("/api/upgrade", securityMiddleware, (req, res) => {
  const { newPlan } = req.body;
  const userId = req.user.id;
  const user = users.get(userId);

  if (!['free', 'pro', 'premium'].includes(newPlan)) {
    return res.status(400).json({ error: 'Plan invalide' });
  }

  user.plan = newPlan;
  res.json({ success: true, message: `Plan upgradé en ${newPlan}` });
});

// ==========================================
// DÉMARRAGE
// ==========================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT} 🚀`);
});
