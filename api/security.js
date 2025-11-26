const rateLimit = {};
const userUsage = {};

class RateLimiter {
  constructor() {
    this.limits = {
      'starter': 100,
      'pro': 500,
      'enterprise': 5000
    };
    this.delayBetweenRequests = 30000;
  }

  checkRateLimit(userId, plan = 'starter') {
    const now = Date.now();
    
    if (!userUsage[userId]) {
      userUsage[userId] = {
        count: 0,
        lastRequest: now,
        monthStart: now,
        riskScore: 0,
        activities: []
      };
    }

    const user = userUsage[userId];
    const monthDuration = 30 * 24 * 60 * 60 * 1000;
    
    if (now - user.monthStart > monthDuration) {
      user.count = 0;
      user.monthStart = now;
      user.riskScore = 0;
    }

    const limit = this.limits[plan] || 100;
    if (user.count >= limit) {
      return { allowed: false, reason: 'Limite atteinte', limit, used: user.count };
    }

    const timeSinceLastRequest = now - user.lastRequest;
    if (timeSinceLastRequest < this.delayBetweenRequests) {
      return { allowed: false, reason: 'Délai minimum', waitSeconds: Math.ceil((this.delayBetweenRequests - timeSinceLastRequest) / 1000) };
    }

    user.riskScore = this.calculateRiskScore(user);
    if (user.riskScore > 80) {
      return { allowed: false, reason: 'Comportement suspect', riskScore: user.riskScore };
    }

    user.count++;
    user.lastRequest = now;
    this.logActivity(userId, 'script_generated');

    return { allowed: true, used: user.count, limit, remaining: limit - user.count };
  }

  calculateRiskScore(user) {
    let score = 0;
    if (user.count > 50 && (Date.now() - user.monthStart) < 3600000) score += 40;
    if (user.count > 20 && user.count < 25) score += 20;
    return Math.min(score, 100);
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
    return userUsage[userId] || null;
  }
}

module.exports = new RateLimiter();
