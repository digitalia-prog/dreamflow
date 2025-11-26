class ActivityHistory {
  constructor() {
    this.history = {};
  }

  addActivity(brandId, activity) {
    if (!this.history[brandId]) {
      this.history[brandId] = [];
    }

    this.history[brandId].push({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: activity.type,
      network: activity.network,
      scriptCount: activity.scriptCount,
      status: activity.status,
      details: activity.details || {}
    });

    // Garder juste 1000 dernières activités
    if (this.history[brandId].length > 1000) {
      this.history[brandId].shift();
    }
  }

  getHistory(brandId, limit = 50) {
    if (!this.history[brandId]) return [];
    return this.history[brandId].slice(-limit).reverse();
  }

  getStats(brandId) {
    if (!this.history[brandId]) return { total: 0, byType: {}, byNetwork: {} };

    const activities = this.history[brandId];
    const stats = {
      total: activities.length,
      byType: {},
      byNetwork: {},
      lastActivity: activities[activities.length - 1]?.timestamp
    };

    activities.forEach(activity => {
      stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1;
      stats.byNetwork[activity.network] = (stats.byNetwork[activity.network] || 0) + 1;
    });

    return stats;
  }

  clearHistory(brandId) {
    delete this.history[brandId];
  }
}

module.exports = new ActivityHistory();
