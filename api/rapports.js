class ReportGenerator {
  constructor() {
    this.reports = {};
  }

  generateReport(brandId, brandName, activityData) {
    const report = {
      id: Date.now(),
      brandId,
      brandName,
      generatedAt: new Date().toISOString(),
      totalScripts: activityData.totalScripts || 0,
      totalActivities: activityData.activities?.length || 0,
      byNetwork: activityData.byNetwork || {},
      byType: activityData.byType || {},
      successRate: this.calculateSuccessRate(activityData),
      trends: this.calculateTrends(activityData)
    };

    this.reports[brandId] = report;
    return report;
  }

  calculateSuccessRate(data) {
    if (!data.activities || data.activities.length === 0) return 0;
    const successful = data.activities.filter(a => a.status === 'success').length;
    return Math.round((successful / data.activities.length) * 100);
  }

  calculateTrends(data) {
    const trends = {
      mostUsedNetwork: null,
      mostActiveDay: null,
      averageScriptsPerDay: 0
    };

    if (data.byNetwork) {
      trends.mostUsedNetwork = Object.keys(data.byNetwork).reduce((a, b) => 
        data.byNetwork[a] > data.byNetwork[b] ? a : b
      );
    }

    return trends;
  }

  exportJSON(brandId) {
    return this.reports[brandId] || null;
  }

  exportCSV(brandId, activities) {
    if (!activities || activities.length === 0) return '';

    let csv = 'Timestamp,Type,Network,Scripts,Status\n';
    activities.forEach(activity => {
      csv += `${activity.timestamp},"${activity.type}","${activity.network}",${activity.scriptCount || 0},"${activity.status}"\n`;
    });

    return csv;
  }

  getReport(brandId) {
    return this.reports[brandId] || null;
  }
}

module.exports = new ReportGenerator();
