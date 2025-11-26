const rateLimit = {};
const userUsage = {};
const ipTracking = {};
const suspiciousPatterns = {};

class RateLimiter {
  constructor() {
    this.limits = {
      'starter': 100,
      'pro': 500,
      'enterprise': 5000
    };
    this.delayBetweenRequests = 30000; // 30 secondes
    this.maxRequestsPerHour = 50;
    this.suspiciousThreshold = 75;
  }

  checkRateLimit(userId, plan = 'starter', ipAddress = null) {
    const now = Date.now();
    
    // Initialiser utilisateur
    if (!userUsage[userId]) {
      userUsage[userId] = {
        count: 0,
        lastRequest: now,
        monthStart: now,
        riskScore: 0,
        activities: [],
        requestsPerHour: [],
        suspiciousFlags: 0,
        blockedAttempts: 0
      };
    }

    const user = userUsage[userId];
    const monthDuration = 30 * 24 * 60 * 60 * 1000;
    
    // Reset si nouveau mois
    if (now - user.monthStart > monthDuration) {
      user.count = 0;
      user.monthStart = now;
      user.riskScore = 0;
      user.suspiciousFlags = 0;
    }

    // 1️⃣ VÉRIFIER LIMITE MENSUELLE
    const limit = this.limits[plan] || 100;
    if (user.count >= limit) {
      user.blockedAttempts++;
      return { 
        allowed: false, 
        reason: 'Limite mensuelle atteinte',
        limit, 
        used: user.count,
        riskLevel: 'high'
      };
    }

    // 2️⃣ VÉRIFIER DÉLAI MINIMUM (30 sec - 2 min)
    const timeSinceLastRequest = now - user.lastRequest;
    if (timeSinceLastRequest < this.delayBetweenRequests) {
      user.suspiciousFlags++;
      return { 
        allowed: false, 
        reason: 'Délai minimum requis',
        waitSeconds: Math.ceil((this.delayBetweenRequests - timeSinceLastRequest) / 1000),
        riskLevel: 'medium'
      };
    }

    // 3️⃣ ANALYSER COMPORTEMENT (SCORING DE RISQUE)
    user.riskScore = this.calculateRiskScore(user, now);
    
    if (user.riskScore > this.suspiciousThreshold) {
      user.suspiciousFlags++;
      this.logActivity(userId, 'suspicious_behavior_detected', { riskScore: user.riskScore });
      return { 
        allowed: false, 
        reason: 'Comportement suspect détecté',
        riskScore: user.riskScore,
        riskLevel: 'critical'
      };
    }

    // 4️⃣ TRACKING IP (déterminer patterns bot)
    if (ipAddress) {
      this.trackIP(userId, ipAddress);
    }

    // 5️⃣ VÉRIFIER RATE LIMIT HORAIRE
    const hourAgo = now - 3600000;
    user.requestsPerHour = user.requestsPerHour.filter(t => t > hourAgo);
    
    if (user.requestsPerHour.length >= this.maxRequestsPerHour) {
      user.suspiciousFlags++;
      return { 
        allowed: false, 
        reason: 'Trop de requêtes par heure',
        hourlyLimit: this.maxRequestsPerHour,
        currentHour: user.requestsPerHour.length,
        riskLevel: 'high'
      };
    }

    // ✅ AUTORISER LA REQUÊTE
    user.count++;
    user.lastRequest = now;
    user.requestsPerHour.push(now);
    this.logActivity(userId, 'script_generated', { plan, riskScore: user.riskScore });

    return { 
      allowed: true, 
      used: user.count, 
      limit, 
      remaining: limit - user.count,
      riskScore: user.riskScore,
      riskLevel: this.getRiskLevel(user.riskScore)
    };
  }

  calculateRiskScore(user, now) {
    let score = 0;

    // 🚨 Burst requests (trop rapide = bot)
    if (user.count > 50 && (now - user.monthStart) < 3600000) {
      score += 40;
    }

    // 🚨 Exact interval pattern (bot-like)
    if (user.activities && user.activities.length >= 2) {
      const last = user.activities[user.activities.length - 1];
      const secondLast = user.activities[user.activities.length - 2];
      const interval = new Date(last.timestamp) - new Date(secondLast.timestamp);
      
      // Si exactement 30 sec = pattern suspect
      if (interval === 30000 || interval === 31000 || interval === 29000) {
        score += 35;
      }
    }

    // 🚨 Trop many blocked attempts
    if (user.blockedAttempts > 10) {
      score += 20;
    }

    // 🚨 Suspicious flags
    if (user.suspiciousFlags > 3) {
      score += 15;
    }

    // 🟡 Heure de pointe suspecte (pattern humain vs bot)
    const hour = new Date(now).getHours();
    if ((hour >= 2 && hour <= 5) && user.count > 20) {
      score += 10; // Requêtes à 3h du matin = suspect
    }

    return Math.min(score, 100);
  }

  trackIP(userId, ipAddress) {
    const key = `${userId}:${ipAddress}`;
    if (!ipTracking[key]) {
      ipTracking[key] = {
        count: 0,
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString()
      };
    }
    ipTracking[key].count++;
    ipTracking[key].lastSeen = new Date().toISOString();
  }

  getRiskLevel(score) {
    if (score < 30) return 'low';
    if (score < 60) return 'medium';
    if (score < 80) return 'high';
    return 'critical';
  }

  logActivity(userId, action, metadata = {}) {
    if (!userUsage[userId]) return;
    userUsage[userId].activities.push({
      timestamp: new Date().toISOString(),
      action,
      ...metadata
    });
    if (userUsage[userId].activities.length > 100) {
      userUsage[userId].activities.shift();
    }
  }

  getUserStats(userId) {
    const user = userUsage[userId];
    if (!user) return null;
    
    return {
      ...user,
      riskLevel: this.getRiskLevel(user.riskScore),
      ipAddresses: Object.keys(ipTracking).filter(k => k.startsWith(`${userId}:`))
    };
  }

  // 🔍 Monitoring avancé
  getAnomalies() {
    const anomalies = [];
    
    Object.entries(userUsage).forEach(([userId, user]) => {
      if (user.riskScore > this.suspiciousThreshold) {
        anomalies.push({
          userId,
          riskScore: user.riskScore,
          suspiciousFlags: user.suspiciousFlags,
          blockedAttempts: user.blockedAttempts,
          lastActivity: user.activities[user.activities.length - 1]
        });
      }
    });

    return anomalies;
  }
}

module.exports = new RateLimiter();
