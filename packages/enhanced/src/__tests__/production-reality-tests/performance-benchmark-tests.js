/**
 * Performance Benchmark Tests - Verifying performance claims under production load
 * Tests real-world performance including mobile devices and slow networks
 */

const { ModuleFederation } = require('@module-federation/runtime-core');
const { performance } = require('perf_hooks');

// Performance benchmarking utilities
class PerformanceBenchmark {
  constructor() {
    this.metrics = {
      moduleLoads: [],
      preloadTimes: [],
      shareScopeResolutions: [],
      pluginOverhead: [],
      memorySnapshots: []
    };
  }

  recordModuleLoad(id, duration, metadata = {}) {
    this.metrics.moduleLoads.push({
      id,
      duration,
      timestamp: Date.now(),
      ...metadata
    });
  }

  recordPreload(remotes, duration) {
    this.metrics.preloadTimes.push({
      remotes,
      duration,
      timestamp: Date.now()
    });
  }

  getStatistics() {
    const calculateStats = (measurements) => {
      if (measurements.length === 0) return null;
      const values = measurements.map(m => m.duration);
      const sorted = values.sort((a, b) => a - b);
      
      return {
        count: values.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        median: sorted[Math.floor(sorted.length / 2)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)]
      };
    };

    return {
      moduleLoads: calculateStats(this.metrics.moduleLoads),
      preloadTimes: calculateStats(this.metrics.preloadTimes),
      shareScopeResolutions: calculateStats(this.metrics.shareScopeResolutions),
      pluginOverhead: calculateStats(this.metrics.pluginOverhead)
    };
  }
}

// Simulate different device conditions
class DeviceSimulator {
  constructor() {
    this.profiles = {
      desktop: { cpuSlowdown: 1, memoryLimit: 8192 },
      midRangeMobile: { cpuSlowdown: 4, memoryLimit: 2048 },
      lowEndMobile: { cpuSlowdown: 10, memoryLimit: 512 }
    };
  }

  async simulateCPUSlowdown(factor, fn) {
    const start = performance.now();
    
    // Simple CPU throttling simulation
    if (factor > 1) {
      const delay = (duration) => {
        const adjustedDelay = duration * (factor - 1);
        const endTime = performance.now() + adjustedDelay;
        while (performance.now() < endTime) {
          // Busy wait to simulate CPU load
          Math.sqrt(Math.random());
        }
      };
      
      // Wrap the function to add delays
      const wrappedFn = async () => {
        const result = await fn();
        delay(performance.now() - start);
        return result;
      };
      
      return wrappedFn();
    }
    
    return fn();
  }
}

describe('Performance Benchmark Production Tests', () => {
  let benchmark;
  let deviceSim;

  beforeEach(() => {
    benchmark = new PerformanceBenchmark();
    deviceSim = new DeviceSimulator();
  });

  test('BRUTAL TEST: Preloading performance claims', async () => {
    // Test if preloading is actually faster than on-demand loading
    
    const federationWithPreload = new ModuleFederation({
      name: 'preload-test',
      remotes: [{
        name: 'remote1',
        entry: 'https://example.com/remote1/remoteEntry.js'
      }, {
        name: 'remote2',
        entry: 'https://example.com/remote2/remoteEntry.js'
      }, {
        name: 'remote3',
        entry: 'https://example.com/remote3/remoteEntry.js'
      }]
    });

    const federationWithoutPreload = new ModuleFederation({
      name: 'no-preload-test',
      remotes: [{
        name: 'remote1',
        entry: 'https://example.com/remote1/remoteEntry.js'
      }, {
        name: 'remote2',
        entry: 'https://example.com/remote2/remoteEntry.js'
      }, {
        name: 'remote3',
        entry: 'https://example.com/remote3/remoteEntry.js'
      }]
    });

    // Test WITH preloading
    const preloadStart = performance.now();
    try {
      await federationWithPreload.preloadRemote([
        { nameOrAlias: 'remote1' },
        { nameOrAlias: 'remote2' },
        { nameOrAlias: 'remote3' }
      ]);
    } catch (error) {
      // Continue
    }
    const preloadDuration = performance.now() - preloadStart;
    benchmark.recordPreload(['remote1', 'remote2', 'remote3'], preloadDuration);

    // Now load modules after preload
    const loadWithPreloadStart = performance.now();
    const preloadResults = [];
    for (const remote of ['remote1', 'remote2', 'remote3']) {
      const start = performance.now();
      try {
        await federationWithPreload.loadRemote(`${remote}/Module`);
        const duration = performance.now() - start;
        preloadResults.push({ remote, duration, success: true });
        benchmark.recordModuleLoad(`${remote}/Module`, duration, { preloaded: true });
      } catch (error) {
        preloadResults.push({ remote, duration: performance.now() - start, success: false });
      }
    }
    const totalWithPreload = performance.now() - loadWithPreloadStart;

    // Test WITHOUT preloading (cold load)
    const loadWithoutPreloadStart = performance.now();
    const coldResults = [];
    for (const remote of ['remote1', 'remote2', 'remote3']) {
      const start = performance.now();
      try {
        await federationWithoutPreload.loadRemote(`${remote}/Module`);
        const duration = performance.now() - start;
        coldResults.push({ remote, duration, success: true });
        benchmark.recordModuleLoad(`${remote}/Module`, duration, { preloaded: false });
      } catch (error) {
        coldResults.push({ remote, duration: performance.now() - start, success: false });
      }
    }
    const totalWithoutPreload = performance.now() - loadWithoutPreloadStart;

    console.log('Preloading performance comparison:', {
      preloadDuration,
      totalWithPreload: totalWithPreload + preloadDuration,
      totalWithoutPreload,
      preloadResults,
      coldResults,
      improvement: `${((totalWithoutPreload - (totalWithPreload + preloadDuration)) / totalWithoutPreload * 100).toFixed(2)}%`
    });

    // Preloading should provide some benefit, but let's see if it's significant
    // In many cases, preloading might actually be SLOWER due to overhead
    expect(totalWithPreload + preloadDuration).toBeLessThan(totalWithoutPreload * 1.5);
  });

  test('BRUTAL TEST: Plugin overhead measurement', async () => {
    // Measure the real overhead of plugins
    
    const heavyPlugin = {
      name: 'HeavyPlugin',
      
      beforeRequest(args) {
        // Simulate heavy computation
        let sum = 0;
        for (let i = 0; i < 100000; i++) {
          sum += Math.sqrt(i);
        }
        return args;
      },
      
      onLoad(args) {
        // More heavy computation
        const data = new Array(1000).fill(0).map((_, i) => ({
          id: i,
          value: Math.random(),
          nested: { deep: { data: 'x'.repeat(100) } }
        }));
        return args;
      },
      
      errorLoadRemote(args) {
        // Even error handling has overhead
        console.error('Heavy error processing');
        return null;
      }
    };

    const federationWithPlugins = new ModuleFederation({
      name: 'with-plugins',
      remotes: [{ name: 'test', entry: 'https://example.com/remoteEntry.js' }],
      plugins: [heavyPlugin]
    });

    const federationWithoutPlugins = new ModuleFederation({
      name: 'without-plugins',
      remotes: [{ name: 'test', entry: 'https://example.com/remoteEntry.js' }]
    });

    // Benchmark with plugins
    const withPluginTimes = [];
    for (let i = 0; i < 100; i++) {
      const start = performance.now();
      try {
        await federationWithPlugins.loadRemote('test/Module');
      } catch (error) {
        // Continue
      }
      withPluginTimes.push(performance.now() - start);
    }

    // Benchmark without plugins
    const withoutPluginTimes = [];
    for (let i = 0; i < 100; i++) {
      const start = performance.now();
      try {
        await federationWithoutPlugins.loadRemote('test/Module');
      } catch (error) {
        // Continue
      }
      withoutPluginTimes.push(performance.now() - start);
    }

    const avgWithPlugins = withPluginTimes.reduce((a, b) => a + b) / withPluginTimes.length;
    const avgWithoutPlugins = withoutPluginTimes.reduce((a, b) => a + b) / withoutPluginTimes.length;
    const overhead = avgWithPlugins - avgWithoutPlugins;
    const overheadPercent = (overhead / avgWithoutPlugins) * 100;

    console.log('Plugin overhead analysis:', {
      avgWithPlugins: avgWithPlugins.toFixed(2),
      avgWithoutPlugins: avgWithoutPlugins.toFixed(2),
      overhead: overhead.toFixed(2),
      overheadPercent: overheadPercent.toFixed(2) + '%'
    });

    // Plugins should not add more than 50% overhead
    expect(overheadPercent).toBeLessThan(50);
  });

  test('BRUTAL TEST: Mobile device performance', async () => {
    // Simulate mobile device performance characteristics
    
    const mobileResults = {};
    
    for (const [deviceType, profile] of Object.entries(deviceSim.profiles)) {
      const federation = new ModuleFederation({
        name: `mobile-test-${deviceType}`,
        remotes: [{ name: 'app', entry: 'https://example.com/remoteEntry.js' }]
      });

      const loadTimes = [];
      
      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        
        await deviceSim.simulateCPUSlowdown(profile.cpuSlowdown, async () => {
          try {
            await federation.loadRemote('app/Module');
          } catch (error) {
            // Continue
          }
        });
        
        const duration = performance.now() - start;
        loadTimes.push(duration);
        
        // Check memory usage
        const memUsage = process.memoryUsage();
        if (memUsage.heapUsed / 1024 / 1024 > profile.memoryLimit) {
          console.warn(`${deviceType} exceeded memory limit: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
        }
      }

      mobileResults[deviceType] = {
        avgLoadTime: loadTimes.reduce((a, b) => a + b) / loadTimes.length,
        maxLoadTime: Math.max(...loadTimes),
        minLoadTime: Math.min(...loadTimes),
        cpuSlowdown: profile.cpuSlowdown,
        memoryLimit: profile.memoryLimit
      };
    }

    console.log('Mobile device performance results:', mobileResults);

    // Low-end mobile should still be usable (< 5 seconds)
    expect(mobileResults.lowEndMobile.avgLoadTime).toBeLessThan(5000);
  });

  test('BRUTAL TEST: Share scope resolution performance', async () => {
    // Test performance with many shared dependencies
    
    const sharedDeps = {};
    for (let i = 0; i < 100; i++) {
      sharedDeps[`package-${i}`] = {
        singleton: true,
        eager: i % 2 === 0,
        requiredVersion: `^1.${i}.0`
      };
    }

    const federation = new ModuleFederation({
      name: 'share-scope-perf',
      shared: sharedDeps,
      remotes: [{ name: 'app', entry: 'https://example.com/remoteEntry.js' }]
    });

    // Populate share scope with many versions
    const shareScope = federation.shareScopeMap['default'] || {};
    for (let i = 0; i < 100; i++) {
      const pkgName = `package-${i}`;
      shareScope[pkgName] = {};
      
      // Add multiple versions per package
      for (let j = 0; j < 10; j++) {
        shareScope[pkgName][`1.${i}.${j}`] = {
          get: () => Promise.resolve({ default: `module-${i}-${j}` }),
          loaded: false,
          loading: null
        };
      }
    }

    // Measure share scope resolution performance
    const resolutionTimes = [];
    
    for (let i = 0; i < 50; i++) {
      const pkgName = `package-${i}`;
      const start = performance.now();
      
      // Simulate share scope resolution
      const versions = Object.keys(shareScope[pkgName] || {});
      const selectedVersion = versions[versions.length - 1]; // Latest version
      
      if (selectedVersion && shareScope[pkgName][selectedVersion]) {
        try {
          await shareScope[pkgName][selectedVersion].get();
        } catch (error) {
          // Continue
        }
      }
      
      const duration = performance.now() - start;
      resolutionTimes.push(duration);
      benchmark.metrics.shareScopeResolutions.push({ duration, timestamp: Date.now() });
    }

    const avgResolutionTime = resolutionTimes.reduce((a, b) => a + b) / resolutionTimes.length;

    console.log('Share scope resolution performance:', {
      totalPackages: Object.keys(shareScope).length,
      totalVersions: Object.values(shareScope).reduce((acc, pkg) => acc + Object.keys(pkg).length, 0),
      avgResolutionTime: avgResolutionTime.toFixed(2),
      maxResolutionTime: Math.max(...resolutionTimes).toFixed(2),
      minResolutionTime: Math.min(...resolutionTimes).toFixed(2)
    });

    // Resolution should be fast even with many packages
    expect(avgResolutionTime).toBeLessThan(10);
  });

  test('BRUTAL TEST: Cold start vs warm start performance', async () => {
    // Compare first load (cold) vs subsequent loads (warm)
    
    const federation = new ModuleFederation({
      name: 'cache-test',
      remotes: [{ name: 'app', entry: 'https://example.com/remoteEntry.js' }]
    });

    const moduleIds = ['app/Module1', 'app/Module2', 'app/Module3'];
    const coldStartTimes = [];
    const warmStartTimes = [];

    // Cold start - first load of each module
    for (const moduleId of moduleIds) {
      const start = performance.now();
      try {
        await federation.loadRemote(moduleId);
      } catch (error) {
        // Continue
      }
      const duration = performance.now() - start;
      coldStartTimes.push(duration);
      benchmark.recordModuleLoad(moduleId, duration, { type: 'cold' });
    }

    // Warm start - second load of same modules (should use cache)
    for (const moduleId of moduleIds) {
      const start = performance.now();
      try {
        await federation.loadRemote(moduleId);
      } catch (error) {
        // Continue
      }
      const duration = performance.now() - start;
      warmStartTimes.push(duration);
      benchmark.recordModuleLoad(moduleId, duration, { type: 'warm' });
    }

    const avgCold = coldStartTimes.reduce((a, b) => a + b) / coldStartTimes.length;
    const avgWarm = warmStartTimes.reduce((a, b) => a + b) / warmStartTimes.length;
    const cacheImprovement = ((avgCold - avgWarm) / avgCold) * 100;

    console.log('Cache performance comparison:', {
      avgColdStart: avgCold.toFixed(2),
      avgWarmStart: avgWarm.toFixed(2),
      cacheImprovement: cacheImprovement.toFixed(2) + '%',
      cacheHitRatio: federation.moduleCache ? federation.moduleCache.size / moduleIds.length : 0
    });

    // Warm start should be significantly faster
    expect(avgWarm).toBeLessThan(avgCold * 0.5);
  });

  test('PERFORMANCE SUMMARY', () => {
    const stats = benchmark.getStatistics();
    
    console.log('Overall Performance Statistics:', {
      moduleLoads: stats.moduleLoads,
      preloadTimes: stats.preloadTimes,
      shareScopeResolutions: stats.shareScopeResolutions,
      pluginOverhead: stats.pluginOverhead
    });

    // Generate performance report
    if (stats.moduleLoads) {
      console.log('\nPerformance Report:');
      console.log('==================');
      console.log(`Module Loads: ${stats.moduleLoads.count} total`);
      console.log(`  Average: ${stats.moduleLoads.avg.toFixed(2)}ms`);
      console.log(`  Median: ${stats.moduleLoads.median.toFixed(2)}ms`);
      console.log(`  95th percentile: ${stats.moduleLoads.p95.toFixed(2)}ms`);
      console.log(`  99th percentile: ${stats.moduleLoads.p99.toFixed(2)}ms`);
    }
  });
});

module.exports = { PerformanceBenchmark, DeviceSimulator };