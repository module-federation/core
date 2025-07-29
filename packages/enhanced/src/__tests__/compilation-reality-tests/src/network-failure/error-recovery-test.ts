/**
 * Error Recovery Pattern Tests - Testing compilation and runtime behavior
 */

import { ModuleFederation } from '@module-federation/runtime-core';

// Error recovery plugin from the example
const errorRecoveryPlugin = {
  name: 'ErrorRecoveryPlugin',
  
  // Issue: The errorLoadRemote method signature is not defined
  errorLoadRemote(args: {
    id: string;
    lifecycle?: string;
    error?: Error;
  }) {
    console.error(`Failed attempt for ${args.id}`);
    
    // The plugin claims to provide fallback - but what's the expected return type?
    if (args.lifecycle === 'onLoad') {
      // Issue: Is this the correct return format?
      return () => ({ default: 'Fallback Module' });
    }
    return null;
  }
};

// CORS error handling plugin
const corsPlugin = {
  name: 'CORSPlugin',
  corsErrors: [] as Array<{
    id: string;
    error: string;
    lifecycle?: string;
  }>,
  
  errorLoadRemote(args: {
    id: string;
    error: Error;
    lifecycle?: string;
  }) {
    if (args.error.message.includes('CORS')) {
      this.corsErrors.push({
        id: args.id,
        error: args.error.message,
        lifecycle: args.lifecycle
      });
    }
    return null;
  }
};

// Aggressive recovery plugin with alternative URLs
const aggressiveRecoveryPlugin = {
  name: 'AggressiveRecoveryPlugin',
  recoveryAttempts: [] as Array<{
    id: string;
    lifecycle?: string;
    timestamp: number;
  }>,
  
  errorLoadRemote(args: {
    id: string;
    lifecycle?: string;
    error?: Error;
  }) {
    this.recoveryAttempts.push({
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

      const attemptIndex = this.recoveryAttempts.length - 1;
      if (attemptIndex < alternativeUrls.length) {
        // Issue: What's the expected return format for URL replacement?
        return {
          ...args,
          id: args.id.replace(/https:\/\/[^\/]+/, alternativeUrls[attemptIndex])
        };
      }
    }

    return null;
  }
};

// Metrics tracking plugin
const metricsPlugin = {
  name: 'MetricsPlugin',
  metrics: {
    attempts: 0,
    successes: 0,
    failures: 0,
    errorTypes: {} as Record<string, number>
  },
  
  beforeRequest(args: any) {
    this.metrics.attempts++;
    return args;
  },
  
  onLoad(args: any) {
    this.metrics.successes++;
    return args;
  },
  
  errorLoadRemote(args: {
    error: Error;
    [key: string]: any;
  }) {
    this.metrics.failures++;
    const errorType = args.error.message.split(':')[0];
    this.metrics.errorTypes[errorType] = (this.metrics.errorTypes[errorType] || 0) + 1;
    return null;
  }
};

// Test the error recovery patterns
async function testErrorRecoveryPatterns() {
  console.log('Testing error recovery patterns...\n');
  
  // Test 1: Plugin method signatures
  console.log('Testing plugin method signatures...');
  
  const testError = new Error('CORS error: No Access-Control-Allow-Origin header');
  
  // Test errorRecoveryPlugin
  const recoveryResult = errorRecoveryPlugin.errorLoadRemote({
    id: 'test-module',
    lifecycle: 'onLoad',
    error: testError
  });
  
  console.log('Recovery plugin result type:', typeof recoveryResult);
  if (typeof recoveryResult === 'function') {
    const module = recoveryResult();
    console.log('Fallback module:', module);
  }
  
  // Test corsPlugin
  corsPlugin.errorLoadRemote({
    id: 'cors-test',
    error: testError,
    lifecycle: 'beforeRequest'
  });
  
  console.log('CORS errors captured:', corsPlugin.corsErrors.length);
  console.log('CORS error details:', corsPlugin.corsErrors);
  
  // Test aggressiveRecoveryPlugin
  const urlRewriteResult = aggressiveRecoveryPlugin.errorLoadRemote({
    id: 'https://primary.example.com/remoteEntry.js',
    lifecycle: 'beforeRequest'
  });
  
  console.log('URL rewrite result:', urlRewriteResult);
  
  // Test 2: Federation integration (if possible)
  console.log('\nTesting federation integration...');
  
  try {
    const federation = new ModuleFederation({
      name: 'error-test',
      remotes: [{
        name: 'test-remote',
        entry: 'https://example.com/remoteEntry.js'
      }],
      // Issue: plugins might not be a valid option
      plugins: [errorRecoveryPlugin, corsPlugin, metricsPlugin]
    } as any);
    
    console.log('Federation with error recovery plugins created');
    
    // Try to trigger error handling
    try {
      await (federation as any).loadRemote('test-remote/Module');
    } catch (error) {
      console.log('Expected error during module load:', error);
    }
    
  } catch (error) {
    console.error('Failed to create federation with plugins:', error);
  }
  
  // Test 3: Metrics collection
  console.log('\nFinal metrics:', metricsPlugin.metrics);
}

// Test timeout handling
async function testTimeoutPlugin() {
  const timeoutPlugin = {
    name: 'TimeoutPlugin',
    timeoutErrors: [] as Array<{
      id: string;
      timestamp: number;
    }>,
    
    errorLoadRemote(args: {
      id: string;
      error: Error;
    }) {
      if (args.error.message.includes('timeout')) {
        this.timeoutErrors.push({
          id: args.id,
          timestamp: Date.now()
        });
      }
      return null;
    }
  };
  
  // Simulate timeout error
  const timeoutError = new Error('Network timeout');
  timeoutPlugin.errorLoadRemote({
    id: 'slow-module',
    error: timeoutError
  });
  
  console.log('Timeout errors captured:', timeoutPlugin.timeoutErrors);
  
  return timeoutPlugin;
}

if (require.main === module) {
  (async () => {
    await testErrorRecoveryPatterns();
    await testTimeoutPlugin();
  })().catch(console.error);
}

export { 
  errorRecoveryPlugin, 
  corsPlugin, 
  aggressiveRecoveryPlugin, 
  metricsPlugin 
};