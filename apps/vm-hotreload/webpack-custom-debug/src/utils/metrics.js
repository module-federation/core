// Metrics utility for tracking performance and usage
class Metrics {
  constructor() {
    this.counters = new Map();
    this.gauges = new Map();
    this.createdAt = new Date().toISOString();
  }

  incrementCounter(name, value = 1) {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);
  }

  getCounter(name) {
    return this.counters.get(name) || 0;
  }

  setGauge(name, value) {
    this.gauges.set(name, value);
  }

  getGauge(name) {
    return this.gauges.get(name);
  }

  startTimer(name) {
    return Date.now();
  }

  endTimer(name) {
    return 0;
  }

  getCounters() {
    return Object.fromEntries(this.counters);
  }

  getGauges() {
    return Object.fromEntries(this.gauges);
  }

  getReport() {
    return {
      counters: this.getCounters(),
      gauges: this.getGauges(),
      eventCount: 0,
      createdAt: this.createdAt,
    };
  }
}

module.exports = Metrics;
