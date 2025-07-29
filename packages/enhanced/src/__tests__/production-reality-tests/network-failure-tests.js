/**
 * Network Failure Tests - Simulating real production network conditions
 * Tests if error recovery and retry mechanisms actually work
 */

const { ModuleFederation } = require('@module-federation/runtime-core');

// Simulate various network conditions
class NetworkSimulator {
  constructor() {
    this.originalFetch = global.fetch;
    this.failureCount = 0;
    this.conditions = {
      latency: 0,
      failureRate: 0,
      corsFailures: false,
      timeoutMs: null,
      intermittentFailures: false
    };
  }

  enable(conditions) {
    this.conditions = { ...this.conditions, ...conditions };
    global.fetch = this.simulatedFetch.bind(this);
  }

  disable() {
    global.fetch = this.originalFetch;
  }

  async simulatedFetch(url, options) {
    // Simulate latency
    if (this.conditions.latency > 0) {
      await new Promise(resolve => setTimeout(resolve, this.conditions.latency));
    }

    // Simulate timeout
    if (this.conditions.timeoutMs) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.conditions.timeoutMs);
      
      try {
        const response = await this.originalFetch(url, {
          ...options,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error('Network timeout');
        }
        throw error;
      }
    }

    // Simulate CORS failures
    if (this.conditions.corsFailures && url.includes('remoteEntry')) {
      throw new Error('CORS error: No \'Access-Control-Allow-Origin\' header');
    }

    // Simulate intermittent failures
    if (this.conditions.intermittentFailures) {
      this.failureCount++;
      if (this.failureCount % 3 === 0) {
        throw new Error('Network error: Connection refused');
      }
    }

    // Simulate failure rate
    if (Math.random() < this.conditions.failureRate) {
      throw new Error('Network error: Random failure');
    }

    return this.originalFetch(url, options);
  }
}

describe('Network Failure Production Tests', () => {
  let networkSim;
  let federationInstance;

  beforeEach(() => {
    networkSim = new NetworkSimulator();
  });

  afterEach(() => {
    networkSim.disable();
  });

  test('BRUTAL TEST: 500ms+ latency with retry plugin', async () => {
    networkSim.enable({ latency: 550 });

    const retryPlugin = {
      name: 'RetryPlugin',
      errorCount: 0,
      
      async fetch(url, options) {
        try {
          const start = performance.now();
          const response = await fetch(url, options);
          const duration = performance.now() - start;
          
          if (duration > 500) {
            console.warn(`Slow fetch: ${url} took ${duration}ms`);
          }
          
          return response;
        } catch (error) {
          this.errorCount++;
          throw error;
        }
      }
    };

    federationInstance = new ModuleFederation({
      name: 'latency-test',
      remotes: [{
        name: 'slow-remote',
        entry: 'https://example.com/remoteEntry.js'
      }],
      plugins: [retryPlugin]
    });

    const start = performance.now();
    
    try {
      await federationInstance.loadRemote('slow-remote/Module');
    } catch (error) {
      const duration = performance.now() - start;
      expect(duration).toBeGreaterThan(500);
      expect(retryPlugin.errorCount).toBeGreaterThan(0);
    }
  });

  test('BRUTAL TEST: Intermittent network failures', async () => {
    networkSim.enable({ intermittentFailures: true });

    let successCount = 0;
    let failureCount = 0;
    
    const errorRecoveryPlugin = {
      name: 'ErrorRecoveryPlugin',
      errorLoadRemote(args) {
        failureCount++;
        console.error(`Failed attempt ${failureCount} for ${args.id}`);
        
        // The plugin claims to provide fallback - let's see if it works
        if (args.lifecycle === 'onLoad') {
          return () => ({ default: 'Fallback Module' });
        }
        return null;
      }
    };

    federationInstance = new ModuleFederation({
      name: 'intermittent-test',
      remotes: [{
        name: 'flaky-remote',
        entry: 'https://example.com/remoteEntry.js'
      }],
      plugins: [errorRecoveryPlugin]
    });

    // Try loading 10 times to test intermittent failures
    const results = [];
    for (let i = 0; i < 10; i++) {
      try {
        const module = await federationInstance.loadRemote('flaky-remote/Module');
        successCount++;
        results.push({ attempt: i, success: true, module });
      } catch (error) {
        results.push({ attempt: i, success: false, error: error.message });
      }
    }

    console.log('Intermittent failure test results:', {
      successCount,
      failureCount,
      successRate: successCount / 10,
      results
    });

    // With intermittent failures, we should see both successes and failures
    expect(failureCount).toBeGreaterThan(0);
  });

  test('BRUTAL TEST: CORS violations', async () => {
    networkSim.enable({ corsFailures: true });

    const corsErrors = [];
    
    const corsPlugin = {
      name: 'CORSPlugin',
      errorLoadRemote(args) {
        if (args.error.message.includes('CORS')) {
          corsErrors.push({
            id: args.id,
            error: args.error.message,
            lifecycle: args.lifecycle
          });
        }
        return null;
      }
    };

    federationInstance = new ModuleFederation({
      name: 'cors-test',
      remotes: [{
        name: 'cors-blocked',
        entry: 'https://different-origin.com/remoteEntry.js'
      }],
      plugins: [corsPlugin]
    });

    try {
      await federationInstance.loadRemote('cors-blocked/Module');
    } catch (error) {
      expect(error.message).toContain('CORS');
      expect(corsErrors.length).toBeGreaterThan(0);
    }
  });

  test('BRUTAL TEST: Network timeouts', async () => {
    networkSim.enable({ timeoutMs: 100, latency: 200 });

    const timeoutErrors = [];
    
    const timeoutPlugin = {
      name: 'TimeoutPlugin',
      errorLoadRemote(args) {
        if (args.error.message.includes('timeout')) {
          timeoutErrors.push({
            id: args.id,
            timestamp: Date.now()
          });
        }
        return null;
      }
    };

    federationInstance = new ModuleFederation({
      name: 'timeout-test',
      remotes: [{
        name: 'slow-remote',
        entry: 'https://example.com/remoteEntry.js'
      }],
      plugins: [timeoutPlugin]
    });

    const start = Date.now();
    
    try {
      await federationInstance.loadRemote('slow-remote/Module');
    } catch (error) {
      const duration = Date.now() - start;
      expect(error.message).toContain('timeout');
      expect(duration).toBeLessThan(150); // Should timeout quickly
      expect(timeoutErrors.length).toBeGreaterThan(0);
    }
  });

  test('BRUTAL TEST: Complete network failure recovery', async () => {
    // Start with network completely down
    networkSim.enable({ failureRate: 1.0 });

    const recoveryAttempts = [];
    
    const aggressiveRecoveryPlugin = {
      name: 'AggressiveRecoveryPlugin',
      errorLoadRemote(args) {
        recoveryAttempts.push({
          id: args.id,
          lifecycle: args.lifecycle,
          timestamp: Date.now()
        });

        // Try alternative URLs
        if (args.lifecycle === 'beforeRequest') {
          const alternativeUrls = [
            'https://cdn1.example.com/remoteEntry.js',
            'https://cdn2.example.com/remoteEntry.js',
            'https://fallback.example.com/remoteEntry.js'
          ];

          const attemptIndex = recoveryAttempts.length - 1;
          if (attemptIndex < alternativeUrls.length) {
            return {
              ...args,
              id: args.id.replace(/https:\/\/[^\/]+/, alternativeUrls[attemptIndex])
            };
          }
        }

        return null;
      }
    };

    federationInstance = new ModuleFederation({
      name: 'recovery-test',
      remotes: [{
        name: 'unreachable',
        entry: 'https://primary.example.com/remoteEntry.js'
      }],
      plugins: [aggressiveRecoveryPlugin]
    });

    try {
      await federationInstance.loadRemote('unreachable/Module');
    } catch (error) {
      console.log('Recovery attempts:', recoveryAttempts);
      expect(recoveryAttempts.length).toBeGreaterThan(1);
    }
  });

  test('BRUTAL TEST: Mixed failure conditions', async () => {
    // Simulate the worst: high latency + intermittent failures + CORS issues
    networkSim.enable({
      latency: 300,
      failureRate: 0.3,
      intermittentFailures: true,
      corsFailures: true
    });

    const metrics = {
      attempts: 0,
      successes: 0,
      failures: 0,
      errorTypes: {}
    };

    const metricsPlugin = {
      name: 'MetricsPlugin',
      beforeRequest(args) {
        metrics.attempts++;
        return args;
      },
      onLoad(args) {
        metrics.successes++;
        return args;
      },
      errorLoadRemote(args) {
        metrics.failures++;
        const errorType = args.error.message.split(':')[0];
        metrics.errorTypes[errorType] = (metrics.errorTypes[errorType] || 0) + 1;
        return null;
      }
    };

    federationInstance = new ModuleFederation({
      name: 'mixed-failure-test',
      remotes: [{
        name: 'problematic',
        entry: 'https://unstable.example.com/remoteEntry.js'
      }],
      plugins: [metricsPlugin]
    });

    // Attempt multiple loads to gather metrics
    const loadPromises = [];
    for (let i = 0; i < 5; i++) {
      loadPromises.push(
        federationInstance.loadRemote('problematic/Module')
          .catch(error => ({ error: error.message }))
      );
    }

    await Promise.all(loadPromises);

    console.log('Mixed failure metrics:', metrics);
    expect(metrics.failures).toBeGreaterThan(0);
    expect(Object.keys(metrics.errorTypes).length).toBeGreaterThan(1);
  });
});

module.exports = { NetworkSimulator };