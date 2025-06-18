/**
 * HMR Client - Usage Examples
 * 
 * This file demonstrates various ways to use the HMR Client library
 * for controlling custom Hot Module Replacement operations.
 */

const { HMRClient, createHMRClient } = require('./hmr-client');

console.log('🚀 HMR Client Library Examples\n');

// Example 1: Basic Usage - Simple Attachment and Force Update
console.log('=== Example 1: Basic Usage ===');

async function basicUsageExample() {
  // Create and attach HMR client
  const hmrClient = createHMRClient({
    logging: true,
    autoAttach: true
  });

  console.log('📊 Initial Status:', hmrClient.getStatus());

  // Force an update to test the system
  console.log('\n🔧 Testing force update...');
  const forceResult = await hmrClient.forceUpdate();
  console.log('Force update result:', forceResult);

  console.log('📊 Status after force update:', hmrClient.getStatus());
  
  return hmrClient;
}

// Example 2: Using Update Providers
console.log('\n=== Example 2: Update Providers ===');

async function updateProviderExample() {
  const hmrClient = createHMRClient();

  // 2a. Queue-based Provider
  console.log('\n📋 Testing Queue Provider...');
  const testUpdates = [
    {
      manifest: {
        h: 'hash1',
        c: ['index'],
        r: ['index'],
        m: ['./src/index.js']
      },
      script: `
        exports.modules = {
          './src/index.js': function(module, exports, require) {
            console.log('✨ Queue Update 1 Applied!');
            module.exports = { version: '1.1.0' };
          }
        };
      `,
      originalInfo: {
        updateId: 'queue-update-1',
        webpackHash: 'hash1'
      }
    },
    {
      manifest: {
        h: 'hash2',
        c: ['index'],
        r: ['index'],
        m: ['./src/index.js']
      },
      script: `
        exports.modules = {
          './src/index.js': function(module, exports, require) {
            console.log('✨ Queue Update 2 Applied!');
            module.exports = { version: '1.2.0' };
          }
        };
      `,
      originalInfo: {
        updateId: 'queue-update-2',
        webpackHash: 'hash2'
      }
    }
  ];

  const queueProvider = HMRClient.createQueueUpdateProvider(testUpdates);
  hmrClient.setUpdateProvider(queueProvider);

  // Apply first update
  const result1 = await hmrClient.checkForUpdates();
  console.log('Queue Update 1 Result:', result1.success ? '✅ Success' : '❌ Failed');

  // Apply second update
  const result2 = await hmrClient.checkForUpdates();
  console.log('Queue Update 2 Result:', result2.success ? '✅ Success' : '❌ Failed');

  // Try third update (should be no updates available)
  const result3 = await hmrClient.checkForUpdates();
  console.log('Queue Update 3 Result:', result3.reason);

  // 2b. Callback-based Provider
  console.log('\n🔄 Testing Callback Provider...');
  let callbackCounter = 0;
  const callbackProvider = HMRClient.createCallbackUpdateProvider(async (currentHash) => {
    callbackCounter++;
    console.log(`📞 Callback called ${callbackCounter} times with hash: ${currentHash}`);
    
    // Return update on every other call
    if (callbackCounter % 2 === 1) {
      return {
        update: {
          manifest: {
            h: `callback-hash-${callbackCounter}`,
            c: ['index'],
            r: ['index'],
            m: ['./src/index.js']
          },
          script: `
            exports.modules = {
              './src/index.js': function(module, exports, require) {
                console.log('📞 Callback Update ${callbackCounter} Applied!');
                module.exports = { callbackVersion: ${callbackCounter} };
              }
            };
          `,
          originalInfo: {
            updateId: `callback-update-${callbackCounter}`,
            webpackHash: `callback-hash-${callbackCounter}`
          }
        }
      };
    }
    
    return { update: null };
  });

  hmrClient.setUpdateProvider(callbackProvider);

  for (let i = 1; i <= 3; i++) {
    const result = await hmrClient.checkForUpdates();
    console.log(`Callback check ${i}:`, result.success ? '✅ Applied' : `ℹ️ ${result.reason}`);
  }

  return hmrClient;
}

// Example 3: HTTP Update Provider
console.log('\n=== Example 3: HTTP Update Provider ===');

function httpProviderExample() {
  console.log('🌐 HTTP Provider Example (mock)...');
  
  // This would work with a real server endpoint
  const httpProvider = HMRClient.createHttpUpdateProvider('http://localhost:3001/hmr/updates', {
    headers: {
      'Authorization': 'Bearer your-token-here'
    },
    timeout: 5000
  });

  const hmrClient = createHMRClient();
  hmrClient.setUpdateProvider(httpProvider);

  console.log('✅ HTTP provider configured');
  console.log('ℹ️ In real usage, this would fetch updates from your server');
  
  return hmrClient;
}

// Example 4: Polling for Updates
console.log('\n=== Example 4: Polling Updates ===');

async function pollingExample() {
  const hmrClient = createHMRClient();
  
  // Set up a simple provider that occasionally has updates
  let pollCount = 0;
  const pollingProvider = HMRClient.createCallbackUpdateProvider(async () => {
    pollCount++;
    
    // Provide an update every 3rd poll
    if (pollCount % 3 === 0) {
      return {
        update: {
          manifest: {
            h: `poll-hash-${pollCount}`,
            c: ['index'],
            r: ['index'],
            m: ['./src/index.js']
          },
          script: `
            exports.modules = {
              './src/index.js': function(module, exports, require) {
                console.log('🔄 Polling Update ${pollCount} Applied!');
                module.exports = { pollVersion: ${pollCount} };
              }
            };
          `,
          originalInfo: {
            updateId: `poll-update-${pollCount}`,
            webpackHash: `poll-hash-${pollCount}`
          }
        }
      };
    }
    
    return { update: null };
  });

  hmrClient.setUpdateProvider(pollingProvider);

  console.log('⏰ Starting polling (every 2 seconds)...');
  
  const pollingControl = hmrClient.startPolling({
    interval: 2000,
    onUpdate: (result) => {
      console.log('📦 Poll Update Applied:', result.updateId);
    },
    onError: (result) => {
      console.log('❌ Poll Error:', result.reason);
    }
  });

  // Stop polling after 10 seconds
  setTimeout(() => {
    pollingControl.stop();
    console.log('⏰ Polling stopped');
  }, 10000);

  return hmrClient;
}

// Example 5: Force Mode Polling
console.log('\n=== Example 5: Force Mode Polling ===');

function forceModeExample() {
  const hmrClient = createHMRClient();

  console.log('💪 Starting force mode polling (every 3 seconds)...');
  console.log('ℹ️ This will continuously reinstall modules even when no updates are available');

  const forcePollingControl = hmrClient.startPolling({
    interval: 3000,
    forceMode: true,
    onUpdate: (result) => {
      console.log('🔧 Force Update Applied:', result.updateId);
    },
    onError: (result) => {
      console.log('❌ Force Error:', result.reason);
    }
  });

  // Stop force polling after 8 seconds
  setTimeout(() => {
    forcePollingControl.stop();
    console.log('💪 Force polling stopped');
  }, 8000);

  return hmrClient;
}

// Example 6: Advanced Configuration and Error Handling
console.log('\n=== Example 6: Advanced Configuration ===');

async function advancedExample() {
  // Create client with custom configuration
  const hmrClient = new HMRClient({
    autoAttach: false,    // Manual attachment
    logging: true,
    pollingInterval: 5000,
    maxRetries: 5
  });

  console.log('🔧 Manual attachment...');
  const attached = hmrClient.attach();
  console.log('Attachment result:', attached ? '✅ Success' : '❌ Failed');

  // Set up error-prone provider for testing error handling
  const errorProvider = HMRClient.createCallbackUpdateProvider(async () => {
    // Randomly succeed or fail
    if (Math.random() > 0.5) {
      throw new Error('Simulated provider error');
    }
    
    return {
      update: {
        manifest: { h: 'error-test', c: ['index'], r: ['index'], m: [] },
        script: 'exports.modules = {}; console.log("Error test update");',
        originalInfo: { updateId: 'error-test', webpackHash: 'error-test' }
      }
    };
  });

  hmrClient.setUpdateProvider(errorProvider);

  // Test error handling
  console.log('🧪 Testing error handling...');
  for (let i = 1; i <= 3; i++) {
    const result = await hmrClient.checkForUpdates();
    console.log(`Error test ${i}:`, result.success ? '✅ Success' : `❌ ${result.reason}`);
  }

  // Show final statistics
  console.log('📊 Final Statistics:', hmrClient.getStats());
  console.log('📊 Final Status:', hmrClient.getStatus());

  // Cleanup
  hmrClient.detach();
  console.log('🧹 Client detached');

  return hmrClient;
}

// Example 7: Custom Update Creation
console.log('\n=== Example 7: Custom Update Creation ===');

async function customUpdateExample() {
  const hmrClient = createHMRClient();

  // Create a custom update manually
  const customUpdate = {
    update: {
      manifest: {
        h: 'custom-' + Date.now(),
        c: ['index'],
        r: ['index'],
        m: ['./src/custom-module.js']
      },
      script: `
        exports.modules = {
          './src/custom-module.js': function(module, exports, require) {
            console.log('🎨 Custom Update Applied!');
            
            // Custom module functionality
            const customAPI = {
              greet: (name) => console.log(\`Hello, \${name}! From custom module.\`),
              getTimestamp: () => new Date().toISOString(),
              customData: { version: '2.0.0', features: ['custom', 'hmr', 'hot-reload'] }
            };
            
            module.exports = customAPI;
          }
        };
        
        exports.runtime = function(__webpack_require__) {
          console.log('🎨 Custom runtime executed');
        };
      `,
      originalInfo: {
        updateId: 'custom-update-' + Date.now(),
        webpackHash: 'custom-' + Date.now()
      }
    }
  };

  console.log('🎨 Applying custom update...');
  const result = await hmrClient.applyUpdate(customUpdate);
  console.log('Custom update result:', result.success ? '✅ Success' : '❌ Failed');

  if (result.success) {
    console.log('📊 Update Stats:', result.stats);
  }

  return hmrClient;
}

// Main execution function
async function runAllExamples() {
  try {
    console.log('🏁 Starting HMR Client Examples...\n');

    // Run examples (comment out any you don't want to run)
    await basicUsageExample();
    await updateProviderExample();
    httpProviderExample();
    
    // Note: Polling examples are time-based, uncomment to test
    // await pollingExample();
    // forceModeExample();
    
    await advancedExample();
    await customUpdateExample();

    console.log('\n✅ All examples completed successfully!');
    console.log('\n💡 HMR Client Library Usage Tips:');
    console.log('   • Use createHMRClient() for quick setup');
    console.log('   • Set update providers with setUpdateProvider()');
    console.log('   • Use checkForUpdates() for on-demand checking');
    console.log('   • Use forceUpdate() for testing or forced reloads');
    console.log('   • Use polling for automatic updates');
    console.log('   • Check getStatus() and getStats() for monitoring');

  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Export for use in other files
module.exports = {
  basicUsageExample,
  updateProviderExample,
  httpProviderExample,
  pollingExample,
  forceModeExample,
  advancedExample,
  customUpdateExample,
  runAllExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}