// Metrics utility for tracking performance and usage
class Metrics {
  constructor() {
    this.counters = new Map();
    this.timers = new Map();
    this.gauges = new Map();
    this.events = [];
    this.createdAt = new Date().toISOString();
  }

  // Counter methods
  incrementCounter(name, value = 1) {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);
    this.recordEvent('counter_increment', {
      name,
      value,
      newTotal: current + value,
    });
  }

  getCounter(name) {
    return this.counters.get(name) || 0;
  }

  resetCounter(name) {
    this.counters.set(name, 0);
    this.recordEvent('counter_reset', { name });
  }

  // Timer methods
  startTimer(name) {
    this.timers.set(name, Date.now());
    this.recordEvent('timer_start', { name });
  }

  endTimer(name) {
    const startTime = this.timers.get(name);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.timers.delete(name);
      this.recordEvent('timer_end', { name, duration });
      return duration;
    }
    return null;
  }

  // Gauge methods (current value)
  setGauge(name, value) {
    this.gauges.set(name, value);
    this.recordEvent('gauge_set', { name, value });
  }

  getGauge(name) {
    return this.gauges.get(name);
  }

  // Event recording
  recordEvent(type, data = {}) {
    this.events.push({
      type,
      data,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 100 events
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }
  }

  // Reporting methods
  getReport() {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      activeTimers: Array.from(this.timers.keys()),
      eventCount: this.events.length,
      createdAt: this.createdAt,
      reportGeneratedAt: new Date().toISOString(),
    };
  }

  getEvents(limit = 10) {
    return this.events.slice(-limit);
  }

  clear() {
    this.counters.clear();
    this.timers.clear();
    this.gauges.clear();
    this.events = [];
    this.recordEvent('metrics_cleared');
  }

  // Memory usage tracking
  trackMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      this.setGauge('memory_rss', usage.rss);
      this.setGauge('memory_heap_used', usage.heapUsed);
      this.setGauge('memory_heap_total', usage.heapTotal);
      this.setGauge('memory_external', usage.external);
      return usage;
    }
    return null;
  }
}

module.exports = Metrics;
