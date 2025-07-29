/**
 * Network Simulator Test - Testing if network simulation code compiles and runs
 */

// Issue: The example doesn't show how to handle environments without fetch
declare global {
  var fetch: typeof import('node-fetch').default;
}

// Simulate various network conditions
class NetworkSimulator {
  private originalFetch: typeof fetch;
  private failureCount = 0;
  private conditions = {
    latency: 0,
    failureRate: 0,
    corsFailures: false,
    timeoutMs: null as number | null,
    intermittentFailures: false
  };

  constructor() {
    // Issue: global.fetch might not exist in Node.js environments
    this.originalFetch = global.fetch || (() => { throw new Error('fetch not available'); }) as any;
  }

  enable(conditions: Partial<typeof this.conditions>) {
    this.conditions = { ...this.conditions, ...conditions };
    // Issue: Reassigning global.fetch might not work in all environments
    global.fetch = this.simulatedFetch.bind(this) as any;
  }

  disable() {
    global.fetch = this.originalFetch;
  }

  async simulatedFetch(url: string, options?: RequestInit): Promise<Response> {
    // Simulate latency
    if (this.conditions.latency > 0) {
      await new Promise(resolve => setTimeout(resolve, this.conditions.latency));
    }

    // Simulate timeout
    if (this.conditions.timeoutMs) {
      // Issue: AbortController might not be available in older environments
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.conditions.timeoutMs!);
      
      try {
        const response = await this.originalFetch(url, {
          ...options,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error: any) {
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

// Test the NetworkSimulator
async function testNetworkSimulator() {
  console.log('Testing NetworkSimulator compilation and functionality...\n');
  
  const simulator = new NetworkSimulator();
  
  // Test 1: Basic instantiation
  console.log('NetworkSimulator created successfully');
  
  // Test 2: Enable various conditions
  try {
    simulator.enable({ latency: 100 });
    console.log('Enabled latency simulation');
    
    simulator.enable({ failureRate: 0.5 });
    console.log('Enabled failure rate simulation');
    
    simulator.enable({ corsFailures: true });
    console.log('Enabled CORS failure simulation');
  } catch (error) {
    console.error('Failed to enable network conditions:', error);
  }
  
  // Test 3: Test simulated fetch (if fetch is available)
  if (typeof global.fetch === 'function') {
    try {
      simulator.enable({ latency: 50 });
      const start = Date.now();
      
      // This will fail but we're testing the simulation
      try {
        await global.fetch('https://example.com/test');
      } catch (fetchError) {
        // Expected to fail
      }
      
      const duration = Date.now() - start;
      console.log(`Fetch with 50ms latency took ${duration}ms`);
      
      if (duration < 50) {
        console.error('ERROR: Latency simulation did not work correctly');
      }
    } catch (error) {
      console.error('Simulated fetch test failed:', error);
    }
  } else {
    console.warn('global.fetch not available - skipping fetch simulation tests');
  }
  
  // Test 4: Disable simulation
  simulator.disable();
  console.log('Network simulation disabled');
  
  return { success: true };
}

// Test retry plugin from the example
const retryPlugin = {
  name: 'RetryPlugin',
  errorCount: 0,
  
  async fetch(url: string, options?: RequestInit) {
    try {
      // Issue: performance.now() might not be available in all environments
      const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
      
      // Issue: This assumes fetch is globally available
      const response = await fetch(url, options);
      
      const duration = typeof performance !== 'undefined' ? 
        performance.now() - start : 
        Date.now() - start;
      
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

if (require.main === module) {
  testNetworkSimulator().catch(console.error);
}

export { NetworkSimulator, retryPlugin };