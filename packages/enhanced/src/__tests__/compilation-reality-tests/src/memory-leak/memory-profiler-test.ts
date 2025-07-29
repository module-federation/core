/**
 * Extracted Memory Profiler Test - Testing if this example compiles and runs
 */

// First issue: The example imports from '@module-federation/runtime-core' 
// but doesn't show what exports are expected
import { ModuleFederation } from '../mocks/module-federation-runtime-core';

// Memory profiler to detect leaks
class MemoryProfiler {
  private snapshots: Array<{
    label: string;
    timestamp: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
    arrayBuffers: number;
  }> = [];
  private leakThreshold = 10 * 1024 * 1024; // 10MB

  takeSnapshot(label: string) {
    // Issue: global.gc is not typed in Node.js types
    if ((global as any).gc) {
      (global as any).gc(); // Force garbage collection if available
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

// Test the basic functionality
async function testMemoryProfiler() {
  console.log('Testing MemoryProfiler compilation and basic functionality...');
  
  const profiler = new MemoryProfiler();
  
  // Take initial snapshot
  profiler.takeSnapshot('start');
  
  // Allocate some memory
  const bigArray = new Array(1000000).fill('x');
  
  // Take another snapshot
  profiler.takeSnapshot('after-allocation');
  
  const leakReport = profiler.checkForLeaks();
  console.log('Leak report:', leakReport);
  
  return leakReport;
}

// Issue: The example shows ModuleFederation being instantiated but doesn't
// show the actual implementation or types
async function testModuleFederationUsage() {
  console.log('Testing ModuleFederation instantiation...');
  
  try {
    // This will likely fail as the types/implementation might not match
    const federationInstance = new ModuleFederation({
      name: 'memory-test',
      remotes: [{
        name: 'test-remote',
        entry: 'https://example.com/remoteEntry.js'
      }]
    });
    
    console.log('ModuleFederation instance created:', federationInstance);
  } catch (error) {
    console.error('Failed to create ModuleFederation instance:', error);
    return { error: error.message };
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  (async () => {
    console.log('Running Memory Profiler Tests...\n');
    
    const memoryResult = await testMemoryProfiler();
    console.log('\nMemory test result:', memoryResult);
    
    const federationResult = await testModuleFederationUsage();
    console.log('\nFederation test result:', federationResult);
  })();
}

export { MemoryProfiler };