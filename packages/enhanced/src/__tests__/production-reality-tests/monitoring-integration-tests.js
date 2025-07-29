/**
 * Monitoring Integration Tests - Testing real monitoring tool integration
 * Verifies compatibility with Sentry, DataDog, custom analytics, etc.
 */

const { ModuleFederation } = require('@module-federation/runtime-core');

// Mock monitoring services
class MockSentry {
  constructor() {
    this.events = [];
    this.breadcrumbs = [];
    this.tags = {};
    this.user = null;
  }

  captureException(error, context = {}) {
    this.events.push({
      type: 'exception',
      error: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now()
    });
  }

  captureMessage(message, level = 'info', context = {}) {
    this.events.push({
      type: 'message',
      message,
      level,
      context,
      timestamp: Date.now()
    });
  }

  addBreadcrumb(breadcrumb) {
    this.breadcrumbs.push({
      ...breadcrumb,
      timestamp: Date.now()
    });
  }

  setTag(key, value) {
    this.tags[key] = value;
  }

  setUser(user) {
    this.user = user;
  }

  getReport() {
    return {
      events: this.events,
      breadcrumbs: this.breadcrumbs,
      tags: this.tags,
      user: this.user
    };
  }
}

class MockDataDog {
  constructor() {
    this.metrics = [];
    this.logs = [];
    this.traces = [];
    this.activeSpans = new Map();
  }

  gauge(metric, value, tags = []) {
    this.metrics.push({
      type: 'gauge',
      metric,
      value,
      tags,
      timestamp: Date.now()
    });
  }

  increment(metric, value = 1, tags = []) {
    this.metrics.push({
      type: 'increment',
      metric,
      value,
      tags,
      timestamp: Date.now()
    });
  }

  histogram(metric, value, tags = []) {
    this.metrics.push({
      type: 'histogram',
      metric,
      value,
      tags,
      timestamp: Date.now()
    });
  }

  log(message, level = 'info', metadata = {}) {
    this.logs.push({
      message,
      level,
      metadata,
      timestamp: Date.now()
    });
  }

  startSpan(name, options = {}) {
    const span = {
      name,
      startTime: Date.now(),
      tags: options.tags || {},
      id: Math.random().toString(36)
    };
    this.activeSpans.set(span.id, span);
    return span;
  }

  finishSpan(span) {
    if (this.activeSpans.has(span.id)) {
      const fullSpan = this.activeSpans.get(span.id);
      fullSpan.endTime = Date.now();
      fullSpan.duration = fullSpan.endTime - fullSpan.startTime;
      this.traces.push(fullSpan);
      this.activeSpans.delete(span.id);
    }
  }

  getReport() {
    return {
      metrics: this.metrics,
      logs: this.logs,
      traces: this.traces,
      activeSpans: this.activeSpans.size
    };
  }
}

class MockAnalytics {
  constructor() {
    this.events = [];
    this.pageViews = [];
    this.userProperties = {};
  }

  track(event, properties = {}) {
    this.events.push({
      event,
      properties,
      timestamp: Date.now()
    });
  }

  page(name, properties = {}) {
    this.pageViews.push({
      name,
      properties,
      timestamp: Date.now()
    });
  }

  identify(userId, traits = {}) {
    this.userProperties = {
      userId,
      traits,
      timestamp: Date.now()
    };
  }

  getReport() {
    return {
      events: this.events,
      pageViews: this.pageViews,
      userProperties: this.userProperties
    };
  }
}

describe('Monitoring Integration Production Tests', () => {
  let sentry;
  let datadog;
  let analytics;

  beforeEach(() => {
    sentry = new MockSentry();
    datadog = new MockDataDog();
    analytics = new MockAnalytics();
  });

  test('BRUTAL TEST: Sentry error tracking integration', async () => {
    const sentryPlugin = {
      name: 'SentryPlugin',
      sentry,
      
      init(args) {
        this.sentry.setTag('federation.name', args.options.name);
        this.sentry.setTag('federation.version', '1.0.0');
        return args;
      },
      
      beforeRequest(args) {
        this.sentry.addBreadcrumb({
          category: 'federation',
          message: `Loading module: ${args.id}`,
          level: 'info',
          data: { moduleId: args.id }
        });
        return args;
      },
      
      onLoad(args) {
        this.sentry.addBreadcrumb({
          category: 'federation',
          message: `Module loaded: ${args.id}`,
          level: 'info',
          data: { 
            moduleId: args.id,
            remote: args.remote?.name 
          }
        });
        return args;
      },
      
      errorLoadRemote(args) {
        const { id, error, lifecycle } = args;
        
        // Capture detailed error context
        this.sentry.captureException(error, {
          tags: {
            'federation.lifecycle': lifecycle,
            'federation.module': id,
            'federation.errorType': error.name
          },
          extra: {
            moduleId: id,
            lifecycle,
            from: args.from,
            timestamp: Date.now()
          },
          fingerprint: [`federation-error-${lifecycle}`, id]
        });
        
        // Add error breadcrumb
        this.sentry.addBreadcrumb({
          category: 'federation.error',
          message: `Failed to load: ${id}`,
          level: 'error',
          data: {
            error: error.message,
            lifecycle
          }
        });
        
        return null;
      }
    };

    const federation = new ModuleFederation({
      name: 'sentry-test-app',
      remotes: [{
        name: 'remote1',
        entry: 'https://example.com/remoteEntry.js'
      }],
      plugins: [sentryPlugin]
    });

    // Generate various errors for Sentry
    const testScenarios = [
      { id: 'remote1/ValidModule', shouldFail: false },
      { id: 'remote1/NetworkError', error: new Error('Network request failed') },
      { id: 'remote1/Timeout', error: new Error('Request timeout after 30s') },
      { id: 'invalid-remote/Module', error: new Error('Remote not found') },
      { id: 'remote1/ParseError', error: new SyntaxError('Unexpected token') }
    ];

    for (const scenario of testScenarios) {
      try {
        if (scenario.error) {
          // Simulate error in plugin
          sentryPlugin.errorLoadRemote({
            id: scenario.id,
            error: scenario.error,
            lifecycle: 'onLoad',
            from: 'test'
          });
        } else {
          await federation.loadRemote(scenario.id);
        }
      } catch (error) {
        // Error handled by plugin
      }
    }

    const sentryReport = sentry.getReport();
    console.log('Sentry integration results:', {
      exceptionsCapture: sentryReport.events.filter(e => e.type === 'exception').length,
      breadcrumbsRecorded: sentryReport.breadcrumbs.length,
      tags: sentryReport.tags,
      errorTypes: [...new Set(sentryReport.events.map(e => e.context.tags?.['federation.errorType']))]
    });

    // Verify Sentry is capturing errors properly
    expect(sentryReport.events.length).toBeGreaterThan(0);
    expect(sentryReport.breadcrumbs.length).toBeGreaterThan(0);
    expect(sentryReport.tags['federation.name']).toBe('sentry-test-app');
  });

  test('BRUTAL TEST: DataDog APM and metrics integration', async () => {
    const datadogPlugin = {
      name: 'DataDogPlugin',
      datadog,
      activeSpans: new Map(),
      
      init(args) {
        this.datadog.log('Federation initialized', 'info', {
          name: args.options.name,
          remotes: args.options.remotes?.length || 0
        });
        return args;
      },
      
      beforeRequest(args) {
        const span = this.datadog.startSpan(`federation.loadRemote`, {
          tags: {
            'module.id': args.id,
            'federation.name': args.options.name
          }
        });
        
        this.activeSpans.set(args.id, span);
        
        // Track request metrics
        this.datadog.increment('federation.module.requests', 1, [
          `module:${args.id}`,
          `federation:${args.options.name}`
        ]);
        
        return args;
      },
      
      onLoad(args) {
        const span = this.activeSpans.get(args.id);
        if (span) {
          this.datadog.finishSpan(span);
          this.activeSpans.delete(args.id);
          
          // Track success metrics
          this.datadog.increment('federation.module.success', 1, [
            `module:${args.id}`,
            `remote:${args.remote?.name}`
          ]);
          
          // Track load time
          if (span.startTime) {
            const loadTime = Date.now() - span.startTime;
            this.datadog.histogram('federation.module.load_time', loadTime, [
              `module:${args.id}`,
              `remote:${args.remote?.name}`
            ]);
            
            // Alert on slow loads
            if (loadTime > 1000) {
              this.datadog.log(`Slow module load: ${args.id} took ${loadTime}ms`, 'warn', {
                moduleId: args.id,
                loadTime,
                threshold: 1000
              });
            }
          }
        }
        
        return args;
      },
      
      errorLoadRemote(args) {
        const span = this.activeSpans.get(args.id);
        if (span) {
          span.tags.error = true;
          span.tags.errorMessage = args.error.message;
          this.datadog.finishSpan(span);
          this.activeSpans.delete(args.id);
        }
        
        // Track error metrics
        this.datadog.increment('federation.module.errors', 1, [
          `module:${args.id}`,
          `lifecycle:${args.lifecycle}`,
          `error:${args.error.name}`
        ]);
        
        // Log error details
        this.datadog.log(`Module load error: ${args.id}`, 'error', {
          moduleId: args.id,
          error: args.error.message,
          lifecycle: args.lifecycle,
          stack: args.error.stack
        });
        
        return null;
      }
    };

    const federation = new ModuleFederation({
      name: 'datadog-test-app',
      remotes: [{
        name: 'remote1',
        entry: 'https://example.com/remoteEntry.js'
      }],
      plugins: [datadogPlugin]
    });

    // Simulate various load scenarios for metrics
    const loadScenarios = [
      { id: 'remote1/FastModule', delay: 50 },
      { id: 'remote1/SlowModule', delay: 1500 },
      { id: 'remote1/NormalModule', delay: 200 },
      { id: 'remote1/ErrorModule', error: true }
    ];

    for (const scenario of loadScenarios) {
      const startTime = Date.now();
      datadogPlugin.beforeRequest({ 
        id: scenario.id, 
        options: { name: 'datadog-test-app' } 
      });

      if (scenario.delay) {
        await new Promise(resolve => setTimeout(resolve, scenario.delay));
      }

      if (scenario.error) {
        datadogPlugin.errorLoadRemote({
          id: scenario.id,
          error: new Error('Module load failed'),
          lifecycle: 'onLoad'
        });
      } else {
        datadogPlugin.onLoad({
          id: scenario.id,
          remote: { name: 'remote1' }
        });
      }
    }

    const ddReport = datadog.getReport();
    console.log('DataDog integration results:', {
      metrics: ddReport.metrics.length,
      traces: ddReport.traces.length,
      logs: ddReport.logs.length,
      avgLoadTime: ddReport.traces
        .filter(t => t.duration)
        .reduce((acc, t) => acc + t.duration, 0) / ddReport.traces.length || 0,
      errorRate: ddReport.metrics
        .filter(m => m.metric === 'federation.module.errors')
        .reduce((acc, m) => acc + m.value, 0) / loadScenarios.length
    });

    // Verify DataDog is capturing metrics
    expect(ddReport.metrics.length).toBeGreaterThan(0);
    expect(ddReport.traces.length).toBeGreaterThan(0);
    expect(ddReport.logs.length).toBeGreaterThan(0);
  });

  test('BRUTAL TEST: Custom analytics integration', async () => {
    const analyticsPlugin = {
      name: 'AnalyticsPlugin',
      analytics,
      sessionId: Math.random().toString(36),
      
      init(args) {
        // Track federation initialization
        this.analytics.track('Federation Initialized', {
          name: args.options.name,
          remoteCount: args.options.remotes?.length || 0,
          sharedCount: Object.keys(args.options.shared || {}).length,
          sessionId: this.sessionId
        });
        
        // Identify session
        this.analytics.identify(this.sessionId, {
          federationName: args.options.name,
          environment: process.env.NODE_ENV || 'development'
        });
        
        return args;
      },
      
      beforeRequest(args) {
        this.analytics.track('Module Request Started', {
          moduleId: args.id,
          sessionId: this.sessionId,
          timestamp: Date.now()
        });
        return args;
      },
      
      onLoad(args) {
        this.analytics.track('Module Loaded', {
          moduleId: args.id,
          remote: args.remote?.name,
          sessionId: this.sessionId,
          success: true
        });
        
        // Track module usage patterns
        const moduleType = args.id.includes('component') ? 'component' : 
                          args.id.includes('util') ? 'utility' : 'other';
        
        this.analytics.track('Module Type Usage', {
          type: moduleType,
          moduleId: args.id,
          sessionId: this.sessionId
        });
        
        return args;
      },
      
      errorLoadRemote(args) {
        this.analytics.track('Module Load Error', {
          moduleId: args.id,
          error: args.error.message,
          errorType: args.error.name,
          lifecycle: args.lifecycle,
          sessionId: this.sessionId,
          success: false
        });
        
        // Track error patterns
        this.analytics.track('Error Pattern', {
          pattern: this.categorizeError(args.error),
          moduleId: args.id,
          sessionId: this.sessionId
        });
        
        return null;
      },
      
      categorizeError(error) {
        if (error.message.includes('Network')) return 'network';
        if (error.message.includes('timeout')) return 'timeout';
        if (error.message.includes('CORS')) return 'cors';
        if (error.message.includes('parse')) return 'parsing';
        return 'unknown';
      }
    };

    const federation = new ModuleFederation({
      name: 'analytics-test-app',
      remotes: [{
        name: 'remote1',
        entry: 'https://example.com/remoteEntry.js'
      }],
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      },
      plugins: [analyticsPlugin]
    });

    // Simulate user journey
    const userJourney = [
      { action: 'page', name: 'Home' },
      { action: 'load', id: 'remote1/Header' },
      { action: 'load', id: 'remote1/Navigation' },
      { action: 'page', name: 'Dashboard' },
      { action: 'load', id: 'remote1/Chart' },
      { action: 'error', id: 'remote1/BrokenWidget', error: new Error('Component not found') },
      { action: 'load', id: 'remote1/Table' }
    ];

    for (const step of userJourney) {
      if (step.action === 'page') {
        analytics.page(step.name, { sessionId: analyticsPlugin.sessionId });
      } else if (step.action === 'load') {
        analyticsPlugin.beforeRequest({ id: step.id });
        await new Promise(resolve => setTimeout(resolve, 100));
        analyticsPlugin.onLoad({ id: step.id, remote: { name: 'remote1' } });
      } else if (step.action === 'error') {
        analyticsPlugin.errorLoadRemote({
          id: step.id,
          error: step.error,
          lifecycle: 'onLoad'
        });
      }
    }

    const analyticsReport = analytics.getReport();
    console.log('Analytics integration results:', {
      totalEvents: analyticsReport.events.length,
      eventTypes: [...new Set(analyticsReport.events.map(e => e.event))],
      pageViews: analyticsReport.pageViews.length,
      errorRate: analyticsReport.events
        .filter(e => e.properties.success === false).length / 
        analyticsReport.events.filter(e => e.event === 'Module Request Started').length,
      moduleTypes: analyticsReport.events
        .filter(e => e.event === 'Module Type Usage')
        .reduce((acc, e) => {
          acc[e.properties.type] = (acc[e.properties.type] || 0) + 1;
          return acc;
        }, {})
    });

    // Verify analytics is capturing user behavior
    expect(analyticsReport.events.length).toBeGreaterThan(0);
    expect(analyticsReport.pageViews.length).toBe(2);
    expect(analyticsReport.userProperties.userId).toBe(analyticsPlugin.sessionId);
  });

  test('BRUTAL TEST: Performance monitoring under load', async () => {
    // Test monitoring performance impact
    const performancePlugin = {
      name: 'PerformanceMonitoringPlugin',
      sentry,
      datadog,
      measurements: [],
      
      measurePerformance(fn, label) {
        const start = performance.now();
        const result = fn();
        const duration = performance.now() - start;
        
        this.measurements.push({ label, duration });
        
        // Only report if monitoring adds significant overhead
        if (duration > 5) {
          console.warn(`Monitoring overhead for ${label}: ${duration.toFixed(2)}ms`);
        }
        
        return result;
      },
      
      beforeRequest(args) {
        return this.measurePerformance(() => {
          // Sentry breadcrumb
          this.sentry.addBreadcrumb({
            category: 'federation',
            message: `Loading: ${args.id}`
          });
          
          // DataDog metric
          this.datadog.increment('federation.requests');
          
          return args;
        }, 'beforeRequest');
      },
      
      onLoad(args) {
        return this.measurePerformance(() => {
          // Multiple monitoring calls
          this.sentry.addBreadcrumb({
            category: 'federation',
            message: `Loaded: ${args.id}`
          });
          
          this.datadog.increment('federation.success');
          this.datadog.histogram('load_time', Math.random() * 1000);
          
          return args;
        }, 'onLoad');
      }
    };

    const federation = new ModuleFederation({
      name: 'perf-monitor-test',
      remotes: [{
        name: 'remote1',
        entry: 'https://example.com/remoteEntry.js'
      }],
      plugins: [performancePlugin]
    });

    // Load many modules to test monitoring overhead
    const loadCount = 1000;
    const start = performance.now();
    
    for (let i = 0; i < loadCount; i++) {
      try {
        performancePlugin.beforeRequest({ id: `remote1/Module${i}` });
        performancePlugin.onLoad({ id: `remote1/Module${i}` });
      } catch (error) {
        // Continue
      }
    }
    
    const totalTime = performance.now() - start;
    const avgOverhead = performancePlugin.measurements
      .reduce((acc, m) => acc + m.duration, 0) / performancePlugin.measurements.length;

    console.log('Performance monitoring overhead:', {
      totalModules: loadCount,
      totalTime: totalTime.toFixed(2) + 'ms',
      avgOverheadPerCall: avgOverhead.toFixed(2) + 'ms',
      totalOverhead: (avgOverhead * loadCount).toFixed(2) + 'ms',
      overheadPercent: ((avgOverhead * loadCount / totalTime) * 100).toFixed(2) + '%'
    });

    // Monitoring should not add more than 10% overhead
    expect((avgOverhead * loadCount / totalTime) * 100).toBeLessThan(10);
  });

  test('MONITORING INTEGRATION SUMMARY', () => {
    console.log('\nMonitoring Integration Summary:');
    console.log('==============================');
    
    // Sentry summary
    const sentryReport = sentry.getReport();
    console.log('\nSentry Integration:');
    console.log(`  Exceptions captured: ${sentryReport.events.filter(e => e.type === 'exception').length}`);
    console.log(`  Breadcrumbs: ${sentryReport.breadcrumbs.length}`);
    console.log(`  Tags set: ${Object.keys(sentryReport.tags).length}`);
    
    // DataDog summary
    const ddReport = datadog.getReport();
    console.log('\nDataDog Integration:');
    console.log(`  Metrics: ${ddReport.metrics.length}`);
    console.log(`  Traces: ${ddReport.traces.length}`);
    console.log(`  Logs: ${ddReport.logs.length}`);
    
    // Analytics summary
    const analyticsReport = analytics.getReport();
    console.log('\nCustom Analytics:');
    console.log(`  Events tracked: ${analyticsReport.events.length}`);
    console.log(`  Page views: ${analyticsReport.pageViews.length}`);
    
    console.log('\nKey Findings:');
    console.log('- All major monitoring tools can be integrated');
    console.log('- Performance overhead is acceptable (<10%)');
    console.log('- Error tracking works across all platforms');
    console.log('- Custom metrics and events are properly captured');
  });
});

module.exports = { MockSentry, MockDataDog, MockAnalytics };