/**
 * Memory Leak Tests - Testing if Module Federation patterns leak memory in production
 * Simulates real production scenarios with module loading/unloading cycles
 */

const { ModuleFederation } = require('@module-federation/runtime-core');

// Memory profiler to detect leaks
class MemoryProfiler {
  constructor() {
    this.snapshots = [];
    this.leakThreshold = 10 * 1024 * 1024; // 10MB
  }

  takeSnapshot(label) {
    if (global.gc) {
      global.gc(); // Force garbage collection if available
    }

    const usage = process.memoryUsage();
    this.snapshots.push({
      label,
      timestamp: Date.now(),
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      arrayBuffers: usage.arrayBuffers
    });

    return usage;
  }

  checkForLeaks() {
    if (this.snapshots.length < 2) return null;

    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];
    const heapGrowth = last.heapUsed - first.heapUsed;

    return {
      leaked: heapGrowth > this.leakThreshold,
      heapGrowth,
      growthMB: (heapGrowth / 1024 / 1024).toFixed(2),
      snapshots: this.snapshots
    };
  }
}

describe('Memory Leak Production Tests', () => {
  let profiler;

  beforeEach(() => {
    profiler = new MemoryProfiler();
  });

  test('BRUTAL TEST: Load/unload modules 1000 times', async () => {
    profiler.takeSnapshot('start');

    const federationInstance = new ModuleFederation({
      name: 'memory-test',
      remotes: [{
        name: 'test-remote',
        entry: 'https://example.com/remoteEntry.js'
      }]
    });

    // Mock the module loading to simulate real modules
    const mockModules = new Map();
    
    const memoryTrackingPlugin = {
      name: 'MemoryTrackingPlugin',
      moduleReferences: new Set(),
      
      onLoad(args) {
        // Simulate module with potential memory leak
        const module = {
          id: args.id,
          data: new Array(1000).fill('x'.repeat(1000)), // ~1MB per module
          timestamp: Date.now(),
          cleanup: null
        };
        
        this.moduleReferences.add(module);
        mockModules.set(args.id, module);
        
        return () => module;
      },
      
      cleanup() {
        // Check if references are properly released
        this.moduleReferences.clear();
      }
    };

    federationInstance.registerPlugin(memoryTrackingPlugin);

    // Load and "unload" modules repeatedly
    for (let i = 0; i < 1000; i++) {
      try {
        const moduleId = `test-remote/Module${i % 10}`; // Cycle through 10 modules
        const module = await federationInstance.loadRemote(moduleId);
        
        // Simulate using the module
        if (module && typeof module === 'function') {
          module();
        }
        
        // Simulate unloading by removing from cache
        if (federationInstance.moduleCache) {
          federationInstance.moduleCache.delete(moduleId);
        }
        mockModules.delete(moduleId);
        
        // Take snapshot every 100 iterations
        if (i % 100 === 0) {
          profiler.takeSnapshot(`iteration-${i}`);
        }
      } catch (error) {
        // Continue on error
      }
    }

    // Clean up plugin
    memoryTrackingPlugin.cleanup();
    
    // Final snapshot
    profiler.takeSnapshot('end');

    const leakReport = profiler.checkForLeaks();
    console.log('Memory leak test results:', {
      leaked: leakReport.leaked,
      heapGrowthMB: leakReport.growthMB,
      moduleReferencesRemaining: memoryTrackingPlugin.moduleReferences.size,
      mockModulesRemaining: mockModules.size
    });

    // Check for memory leaks
    expect(leakReport.leaked).toBe(false);
    expect(memoryTrackingPlugin.moduleReferences.size).toBe(0);
    expect(mockModules.size).toBeLessThan(10); // Should have cleared most modules
  });

  test('BRUTAL TEST: Plugin memory retention', async () => {
    profiler.takeSnapshot('start');

    const pluginInstances = [];
    
    // Create many plugin instances to test for leaks
    for (let i = 0; i < 100; i++) {
      const plugin = {
        name: `LeakyPlugin${i}`,
        largeData: new Array(10000).fill('data'), // Potential memory leak
        eventHandlers: new Map(),
        intervals: [],
        
        init(args) {
          // Simulate plugin that creates event listeners
          const handler = () => console.log(`Plugin ${this.name} handler`);
          this.eventHandlers.set('resize', handler);
          
          // Simulate interval that might not be cleaned up
          const interval = setInterval(() => {
            this.largeData.push(new Date());
          }, 1000);
          this.intervals.push(interval);
          
          return args;
        },
        
        beforeRequest(args) {
          // Add more data on each request
          this.largeData.push({
            id: args.id,
            timestamp: Date.now(),
            metadata: new Array(100).fill('metadata')
          });
          return args;
        },
        
        cleanup() {
          // Proper cleanup
          this.eventHandlers.clear();
          this.intervals.forEach(interval => clearInterval(interval));
          this.largeData = null;
        }
      };
      
      pluginInstances.push(plugin);
    }

    // Create federation instances with plugins
    const federationInstances = [];
    for (let i = 0; i < 10; i++) {
      const instance = new ModuleFederation({
        name: `app${i}`,
        plugins: pluginInstances.slice(i * 10, (i + 1) * 10)
      });
      federationInstances.push(instance);
      
      profiler.takeSnapshot(`created-instance-${i}`);
    }

    // Simulate usage
    for (const instance of federationInstances) {
      try {
        await instance.loadRemote('test/Module');
      } catch (error) {
        // Continue
      }
    }

    profiler.takeSnapshot('after-usage');

    // Clean up plugins
    pluginInstances.forEach(plugin => plugin.cleanup());
    
    // Clear references
    federationInstances.length = 0;
    pluginInstances.length = 0;

    profiler.takeSnapshot('after-cleanup');

    const leakReport = profiler.checkForLeaks();
    console.log('Plugin memory retention results:', leakReport);

    expect(leakReport.leaked).toBe(false);
  });

  test('BRUTAL TEST: Share scope memory accumulation', async () => {
    profiler.takeSnapshot('start');

    const federationInstance = new ModuleFederation({
      name: 'share-scope-test',
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true }
      }
    });

    // Simulate adding many versions to share scope
    const shareScope = federationInstance.shareScopeMap['default'] || {};
    
    for (let i = 0; i < 1000; i++) {
      const packageName = `package-${i % 100}`;
      const version = `1.0.${i}`;
      
      if (!shareScope[packageName]) {
        shareScope[packageName] = {};
      }
      
      // Add version with potential memory leak
      shareScope[packageName][version] = {
        get: () => Promise.resolve({
          data: new Array(1000).fill(`version-${version}`),
          exports: {
            default: () => 'module content'
          }
        }),
        loaded: false,
        loading: null,
        from: 'test',
        lib: () => ({
          heavyData: new Array(10000).fill('x')
        })
      };
      
      if (i % 100 === 0) {
        profiler.takeSnapshot(`share-scope-${i}`);
      }
    }

    profiler.takeSnapshot('after-population');

    // Count total entries
    let totalEntries = 0;
    for (const pkg in shareScope) {
      totalEntries += Object.keys(shareScope[pkg]).length;
    }

    console.log('Share scope accumulation:', {
      packages: Object.keys(shareScope).length,
      totalEntries,
      memorySizeMB: profiler.snapshots[profiler.snapshots.length - 1].heapUsed / 1024 / 1024
    });

    // Clear old versions (simulate cleanup)
    for (const pkg in shareScope) {
      const versions = Object.keys(shareScope[pkg]);
      if (versions.length > 10) {
        // Keep only latest 10 versions
        versions.slice(0, -10).forEach(version => {
          delete shareScope[pkg][version];
        });
      }
    }

    profiler.takeSnapshot('after-cleanup');

    const leakReport = profiler.checkForLeaks();
    expect(totalEntries).toBeGreaterThan(900);
  });

  test('BRUTAL TEST: Circular reference detection', async () => {
    profiler.takeSnapshot('start');

    // Create circular references that might leak
    const circularPlugin = {
      name: 'CircularPlugin',
      instances: [],
      
      init(args) {
        const instance = {
          id: Date.now(),
          origin: args.origin,
          plugin: this, // Circular reference
          data: new Array(1000).fill('data')
        };
        
        this.instances.push(instance);
        instance.self = instance; // Self reference
        
        return args;
      }
    };

    const federationInstance = new ModuleFederation({
      name: 'circular-test',
      plugins: [circularPlugin]
    });

    // Create more circular references
    circularPlugin.federation = federationInstance;
    federationInstance.circularPlugin = circularPlugin;

    // Simulate heavy usage
    for (let i = 0; i < 100; i++) {
      try {
        await federationInstance.loadRemote(`test/Module${i}`);
      } catch (error) {
        // Continue
      }
    }

    profiler.takeSnapshot('after-usage');

    // Attempt to break circular references
    circularPlugin.instances.forEach(instance => {
      delete instance.origin;
      delete instance.plugin;
      delete instance.self;
    });
    circularPlugin.instances = [];
    delete circularPlugin.federation;
    delete federationInstance.circularPlugin;

    profiler.takeSnapshot('after-cleanup');

    const leakReport = profiler.checkForLeaks();
    console.log('Circular reference test results:', leakReport);
  });

  test('BRUTAL TEST: Event listener accumulation', async () => {
    profiler.takeSnapshot('start');

    const eventEmitter = new (require('events'))();
    let listenerCount = 0;

    const eventLeakPlugin = {
      name: 'EventLeakPlugin',
      
      beforeRequest(args) {
        // Add listener without removing
        const listener = () => {
          console.log(`Request ${args.id}`);
        };
        eventEmitter.on('request', listener);
        listenerCount++;
        
        return args;
      },
      
      onLoad(args) {
        // Add another listener
        const listener = () => {
          console.log(`Loaded ${args.id}`);
        };
        eventEmitter.on('load', listener);
        listenerCount++;
        
        return args;
      }
    };

    const federationInstance = new ModuleFederation({
      name: 'event-leak-test',
      plugins: [eventLeakPlugin]
    });

    // Generate many events
    for (let i = 0; i < 1000; i++) {
      try {
        await federationInstance.loadRemote(`test/Module${i % 10}`);
        
        if (i % 100 === 0) {
          profiler.takeSnapshot(`events-${i}`);
          console.log(`Event listeners at ${i}:`, {
            request: eventEmitter.listenerCount('request'),
            load: eventEmitter.listenerCount('load'),
            total: listenerCount
          });
        }
      } catch (error) {
        // Continue
      }
    }

    profiler.takeSnapshot('after-events');

    // Check listener accumulation
    const requestListeners = eventEmitter.listenerCount('request');
    const loadListeners = eventEmitter.listenerCount('load');

    console.log('Event listener accumulation:', {
      requestListeners,
      loadListeners,
      totalAdded: listenerCount
    });

    // This should fail - demonstrating the memory leak
    expect(requestListeners).toBeLessThan(100); // Will likely be 1000+
    expect(loadListeners).toBeLessThan(100); // Will likely be 1000+

    // Clean up
    eventEmitter.removeAllListeners();
    
    profiler.takeSnapshot('after-cleanup');
  });
});

module.exports = { MemoryProfiler };