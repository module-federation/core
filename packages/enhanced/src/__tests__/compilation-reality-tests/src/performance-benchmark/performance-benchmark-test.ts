/**
 * Performance Benchmark Test - Testing if performance measurement code compiles
 */

// Issue: The example imports from 'perf_hooks' which is Node.js specific
import { performance } from 'perf_hooks';
import { ModuleFederation } from '@module-federation/runtime-core';

// Performance benchmarking utilities
class PerformanceBenchmark {
  metrics = {
    moduleLoads: [] as Array<{
      id: string;
      duration: number;
      timestamp: number;
      [key: string]: any;
    }>,
    preloadTimes: [] as Array<{
      remotes: string[];
      duration: number;
      timestamp: number;
    }>,
    shareScopeResolutions: [] as Array<{
      duration: number;
      timestamp: number;
    }>,
    pluginOverhead: [] as Array<{
      duration: number;
      [key: string]: any;
    }>,
    memorySnapshots: [] as Array<any>
  };

  recordModuleLoad(id: string, duration: number, metadata: Record<string, any> = {}) {
    this.metrics.moduleLoads.push({
      id,
      duration,
      timestamp: Date.now(),
      ...metadata
    });
  }

  recordPreload(remotes: string[], duration: number) {
    this.metrics.preloadTimes.push({
      remotes,
      duration,
      timestamp: Date.now()
    });
  }

  getStatistics() {
    const calculateStats = (measurements: Array<{ duration: number }>) => {
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

// Test the performance benchmark
async function testPerformanceBenchmark() {
  console.log('Testing PerformanceBenchmark compilation and functionality...\n');
  
  const benchmark = new PerformanceBenchmark();
  
  // Test recording various metrics
  benchmark.recordModuleLoad('test-module-1', 150.5, { cached: false });
  benchmark.recordModuleLoad('test-module-2', 50.2, { cached: true });
  benchmark.recordModuleLoad('test-module-3', 200.1, { cached: false });
  
  benchmark.recordPreload(['remote1', 'remote2'], 300.5);
  
  // Add some share scope resolutions
  for (let i = 0; i < 10; i++) {
    benchmark.metrics.shareScopeResolutions.push({
      duration: Math.random() * 20,
      timestamp: Date.now()
    });
  }
  
  // Get statistics
  const stats = benchmark.getStatistics();
  console.log('Performance statistics:', JSON.stringify(stats, null, 2));
  
  // Verify statistics calculation
  if (stats.moduleLoads) {
    console.log('\nModule load statistics:');
    console.log(`  Count: ${stats.moduleLoads.count}`);
    console.log(`  Average: ${stats.moduleLoads.avg.toFixed(2)}ms`);
    console.log(`  Median: ${stats.moduleLoads.median.toFixed(2)}ms`);
    console.log(`  95th percentile: ${stats.moduleLoads.p95.toFixed(2)}ms`);
  }
  
  return benchmark;
}

// Device simulator from the example
class DeviceSimulator {
  profiles = {
    desktop: { cpuSlowdown: 1, memoryLimit: 8192 },
    midRangeMobile: { cpuSlowdown: 4, memoryLimit: 2048 },
    lowEndMobile: { cpuSlowdown: 10, memoryLimit: 512 }
  };

  async simulateCPUSlowdown(factor: number, fn: () => Promise<any>) {
    // Issue: performance might not be available in all environments
    const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
    
    // Simple CPU throttling simulation
    if (factor > 1) {
      const delay = (duration: number) => {
        const adjustedDelay = duration * (factor - 1);
        const endTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) + adjustedDelay;
        
        // Issue: This busy wait will block the event loop
        while ((typeof performance !== 'undefined' ? performance.now() : Date.now()) < endTime) {
          // Busy wait to simulate CPU load
          Math.sqrt(Math.random());
        }
      };
      
      // Wrap the function to add delays
      const wrappedFn = async () => {
        const result = await fn();
        const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start;
        delay(elapsed);
        return result;
      };
      
      return wrappedFn();
    }
    
    return fn();
  }
}

// Test device simulation
async function testDeviceSimulation() {
  console.log('\nTesting DeviceSimulator...');
  
  const deviceSim = new DeviceSimulator();
  
  // Test CPU slowdown simulation
  const testFunction = async () => {
    let sum = 0;
    for (let i = 0; i < 1000; i++) {
      sum += Math.sqrt(i);
    }
    return sum;
  };
  
  // Test with different device profiles
  for (const [device, profile] of Object.entries(deviceSim.profiles)) {
    const start = Date.now();
    
    const result = await deviceSim.simulateCPUSlowdown(profile.cpuSlowdown, testFunction);
    
    const duration = Date.now() - start;
    console.log(`${device}: ${duration}ms (${profile.cpuSlowdown}x slowdown)`);
  }
}

// Heavy plugin example
const heavyPlugin = {
  name: 'HeavyPlugin',
  
  beforeRequest(args: any) {
    // Simulate heavy computation
    let sum = 0;
    for (let i = 0; i < 100000; i++) {
      sum += Math.sqrt(i);
    }
    return args;
  },
  
  onLoad(args: any) {
    // More heavy computation
    const data = new Array(1000).fill(0).map((_, i) => ({
      id: i,
      value: Math.random(),
      nested: { deep: { data: 'x'.repeat(100) } }
    }));
    return args;
  },
  
  errorLoadRemote(args: any) {
    // Even error handling has overhead
    console.error('Heavy error processing');
    return null;
  }
};

// Test share scope with many packages
async function testShareScopePerformance() {
  console.log('\nTesting share scope performance...');
  
  // Create many shared dependencies
  const sharedDeps: Record<string, any> = {};
  for (let i = 0; i < 100; i++) {
    sharedDeps[`package-${i}`] = {
      singleton: true,
      eager: i % 2 === 0,
      requiredVersion: `^1.${i}.0`
    };
  }
  
  try {
    const federation = new ModuleFederation({
      name: 'share-scope-test',
      shared: sharedDeps,
      remotes: [{ name: 'app', entry: 'https://example.com/remoteEntry.js' }]
    } as any);
    
    console.log('Created federation with 100 shared dependencies');
    
    // Issue: shareScopeMap might not be accessible
    if ('shareScopeMap' in federation) {
      const shareScope = (federation as any).shareScopeMap['default'] || {};
      console.log('Share scope packages:', Object.keys(shareScope).length);
    }
    
  } catch (error) {
    console.error('Failed to create federation with shared deps:', error);
  }
}

if (require.main === module) {
  (async () => {
    await testPerformanceBenchmark();
    await testDeviceSimulation();
    await testShareScopePerformance();
  })().catch(console.error);
}

export { PerformanceBenchmark, DeviceSimulator, heavyPlugin };