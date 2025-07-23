/**
 * HMR Client Demo - Webpack Entry Point
 *
 * This entry point demonstrates the HMR Client library in a real webpack bundle.
 * It showcases various HMR Client features and provides a working example
 * of how to integrate the library into a production application.
 */

console.log('🚀 HMR Client Demo Starting...');

// Import the HMR Client
const {
  HMRClient,
  createHMRClient,
} = require('@module-federation/node/utils/hmr-client');

// Demo state to track updates and showcase stateful hot reloading
let demoState = {
  version: '1.0.0',
  updateCount: 0,
  features: ['basic-hmr', 'client-library'],
  startTime: new Date().toISOString(),
  lastUpdate: null,
};

// Create the HMR client with custom configuration
const hmrClient = createHMRClient({
  autoAttach: true,
  logging: true,
  pollingInterval: 2000,
  maxRetries: 3,
});

console.log('📊 Initial HMR Client Status:', hmrClient.getStatus());
console.log('🎯 Initial Demo State:', demoState);

// Demo function that can be hot-reloaded
function calculateBusinessLogic(input) {
  return {
    originalInput: input,
    processed: input * 2 + 10,
    timestamp: new Date().toISOString(),
    version: demoState.version,
  };
}

// Demo API object that can be hot-reloaded
const demoAPI = {
  greet: (name) => `Hello, ${name}! (v${demoState.version})`,
  calculate: calculateBusinessLogic,
  getStatus: () => ({
    ...demoState,
    hmrStatus: hmrClient.getStatus(),
    uptime: Date.now() - new Date(demoState.startTime).getTime(),
  }),
  processData: (data) => {
    return data.map((item) => ({
      ...item,
      processed: true,
      version: demoState.version,
      updateCount: demoState.updateCount,
    }));
  },
};

// Set up update providers for demonstration
function setupDemoUpdateProviders() {
  console.log('🔧 Setting up demo update providers...');

  // Create a queue of demo updates
  const demoUpdates = [
    {
      manifest: {
        h: 'demo-v1.1.0',
        c: ['hmr-client-demo'],
        r: [],
        m: ['./src/hmr-client-demo.js'],
      },
      script: `
        exports.modules = {
          './src/hmr-client-demo.js': function(module, exports, require) {
            console.log('🔄 HMR Client Demo Update v1.1.0 Applied!');
            
            // Updated demo state
            const updatedState = {
              version: '1.1.0',
              updateCount: 1,
              features: ['basic-hmr', 'client-library', 'auto-updates'],
              startTime: '${demoState.startTime}',
              lastUpdate: new Date().toISOString()
            };
            
            // Updated business logic
            function enhancedCalculation(input) {
              return {
                originalInput: input,
                processed: input * 3 + 20, // Enhanced algorithm
                timestamp: new Date().toISOString(),
                version: updatedState.version,
                enhanced: true
              };
            }
            
            // Updated API
            const updatedAPI = {
              greet: (name) => \`🎉 Hello, \${name}! Welcome to v\${updatedState.version}!\`,
              calculate: enhancedCalculation,
              getStatus: () => ({
                ...updatedState,
                hmrStatus: global.hmrClient ? global.hmrClient.getStatus() : null,
                uptime: Date.now() - new Date(updatedState.startTime).getTime()
              }),
              processData: (data) => {
                return data.map(item => ({
                  ...item,
                  processed: true,
                  enhanced: true,
                  version: updatedState.version,
                  updateCount: updatedState.updateCount
                }));
              },
              newFeature: () => 'This is a new feature added via HMR!'
            };
            
            module.exports = {
              demoState: updatedState,
              demoAPI: updatedAPI,
              hmrClient: global.hmrClient
            };
          }
        };
        
        exports.runtime = function(__webpack_require__) {
          console.log('🚀 HMR Client Demo Runtime v1.1.0 Executed');
        };
      `,
      originalInfo: {
        updateId: 'demo-update-v1.1.0',
        webpackHash: 'demo-v1.1.0',
      },
    },
    {
      manifest: {
        h: 'demo-v1.2.0',
        c: ['hmr-client-demo'],
        r: [],
        m: ['./src/hmr-client-demo.js'],
      },
      script: `
        exports.modules = {
          './src/hmr-client-demo.js': function(module, exports, require) {
            console.log('🚀 HMR Client Demo Update v1.2.0 Applied!');
            
            // Further updated demo state
            const finalState = {
              version: '1.2.0',
              updateCount: 2,
              features: ['basic-hmr', 'client-library', 'auto-updates', 'production-ready'],
              startTime: '${demoState.startTime}',
              lastUpdate: new Date().toISOString()
            };
            
            // Production-ready business logic
            function productionCalculation(input) {
              const validation = input != null && typeof input === 'number';
              if (!validation) {
                throw new Error('Invalid input: expected number');
              }
              
              return {
                originalInput: input,
                processed: Math.round((input * 3.14 + 42) * 100) / 100, // More sophisticated
                timestamp: new Date().toISOString(),
                version: finalState.version,
                enhanced: true,
                validated: true
              };
            }
            
            // Production API
            const productionAPI = {
              greet: (name) => \`🎯 Hello, \${name}! Production v\${finalState.version} ready!\`,
              calculate: productionCalculation,
              getStatus: () => ({
                ...finalState,
                hmrStatus: global.hmrClient ? global.hmrClient.getStatus() : null,
                uptime: Date.now() - new Date(finalState.startTime).getTime(),
                isProduction: true
              }),
              processData: (data) => {
                if (!Array.isArray(data)) {
                  throw new Error('processData expects an array');
                }
                return data.map((item, index) => ({
                  ...item,
                  processed: true,
                  enhanced: true,
                  validated: true,
                  index,
                  version: finalState.version,
                  updateCount: finalState.updateCount
                }));
              },
              newFeature: () => 'Enhanced new feature with validation!',
              productionFeature: () => ({
                message: 'This is a production-ready feature',
                timestamp: new Date().toISOString(),
                reliability: 'high'
              })
            };
            
            module.exports = {
              demoState: finalState,
              demoAPI: productionAPI,
              hmrClient: global.hmrClient
            };
          }
        };
        
        exports.runtime = function(__webpack_require__) {
          console.log('🎯 HMR Client Demo Runtime v1.2.0 Executed - Production Ready!');
        };
      `,
      originalInfo: {
        updateId: 'demo-update-v1.2.0',
        webpackHash: 'demo-v1.2.0',
      },
    },
  ];

  // Create queue provider
  const queueProvider = HMRClient.createQueueUpdateProvider(demoUpdates);
  hmrClient.setUpdateProvider(queueProvider);

  console.log('✅ Demo update providers configured');
}

// Test the demo functionality
function runDemoTests() {
  console.log('\n🧪 Running demo functionality tests...');

  try {
    // Test the API
    console.log('👋 Greeting test:', demoAPI.greet('Developer'));

    // Test calculation
    const calcResult = demoAPI.calculate(5);
    console.log('🧮 Calculation test:', calcResult);

    // Test data processing
    const testData = [
      { id: 1, name: 'Test Item 1' },
      { id: 2, name: 'Test Item 2' },
    ];
    const processedData = demoAPI.processData(testData);
    console.log('📊 Data processing test:', processedData);

    // Get status
    const status = demoAPI.getStatus();
    console.log('📊 Current status:', status);

    console.log('✅ All demo tests passed');
  } catch (error) {
    console.error('❌ Demo test failed:', error);
  }
}

// Demonstrate automatic updates
async function demonstrateAutoUpdates() {
  console.log('\n⏰ Starting automatic update demonstration...');

  // Apply updates one by one with delays
  for (let i = 0; i < 2; i++) {
    console.log(`\n🔄 Applying demo update ${i + 1}...`);

    const result = await hmrClient.checkForUpdates();

    if (result.success) {
      console.log(`✅ Update ${i + 1} applied successfully!`);
      console.log('📊 New Stats:', hmrClient.getStats());

      // Re-run tests to show the updated functionality
      setTimeout(runDemoTests, 100);
    } else {
      console.log(`ℹ️ Update ${i + 1} result:`, result.reason);
    }

    // Wait between updates
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('\n📈 Final HMR Client Statistics:', hmrClient.getStats());
  console.log('📊 Final Status:', hmrClient.getStatus());
}

// Demonstrate polling (commented out to avoid interference with demo)
function demonstratePolling() {
  console.log('\n⏰ Polling demonstration available (commented out)');

  /*
  // Uncomment to test polling
  console.log('⏰ Starting polling demonstration...');
  
  const pollingControl = hmrClient.startPolling({
    interval: 3000,
    onUpdate: (result) => {
      console.log('📦 Polling Update Applied:', result.updateId);
      runDemoTests();
    },
    onError: (result) => {
      console.log('ℹ️ Polling Info:', result.reason);
    }
  });
  
  // Stop after 15 seconds
  setTimeout(() => {
    pollingControl.stop();
    console.log('⏰ Polling demonstration completed');
  }, 15000);
  */
}

// Main demo execution
async function runHMRClientDemo() {
  try {
    console.log('\n🎬 HMR Client Demo Starting...');

    // Make hmrClient globally available for updates
    global.hmrClient = hmrClient;

    // Initial tests
    runDemoTests();

    // Set up update providers
    setupDemoUpdateProviders();

    // Demonstrate automatic updates
    await demonstrateAutoUpdates();

    // Show polling capability
    demonstratePolling();

    console.log('\n🎉 HMR Client Demo completed successfully!');
    console.log('\n💡 HMR Client Demo Features Demonstrated:');
    console.log('   ✅ HMR Client initialization and configuration');
    console.log('   ✅ Update provider setup (queue-based)');
    console.log('   ✅ Automatic update checking and application');
    console.log('   ✅ Stateful hot reloading preservation');
    console.log('   ✅ Business logic updates via HMR');
    console.log('   ✅ API enhancement through hot updates');
    console.log('   ✅ Statistics and status monitoring');
    console.log('   ✅ Error handling and graceful degradation');
  } catch (error) {
    console.error('❌ HMR Client Demo failed:', error);
  }
}

// Handle module.hot if available
if (module.hot) {
  module.hot.accept(() => {
    console.log('🔄 HMR Client Demo module hot reloaded!');
  });

  module.hot.dispose((data) => {
    console.log('🧹 HMR Client Demo module disposing...');
    data.preserved = {
      demoState,
      startTime: demoState.startTime,
    };
  });
}

// Export for testing and external access
const exports = {
  demoState,
  demoAPI,
  hmrClient,
  runHMRClientDemo,
  runDemoTests,
  demonstrateAutoUpdates,
  calculateBusinessLogic,
};

module.exports = exports;

// Auto-start the demo only if executed directly (not when required)
// Check environment variable to control auto-start behavior
const shouldAutoStart =
  process.env.HMR_DEMO_AUTOSTART !== 'false' && process.env.NODE_ENV !== 'test';
const isDirectExecution = require.main === module;
const isWebpackBundle = typeof __webpack_require__ !== 'undefined';

// In webpack bundles, we want to export the module without auto-starting
// unless explicitly requested via environment variable
if (isWebpackBundle) {
  // Don't auto-start in webpack bundles by default - let the consumer decide
  if (process.env.HMR_DEMO_AUTOSTART === 'true') {
    console.log('🎬 Auto-starting HMR Client Demo (webpack bundle)...');
    runHMRClientDemo().catch((error) => {
      console.error('❌ Failed to start HMR Client Demo:', error);
    });
  }
} else if (shouldAutoStart && isDirectExecution) {
  console.log('🎬 Auto-starting HMR Client Demo...');
  runHMRClientDemo().catch((error) => {
    console.error('❌ Failed to start HMR Client Demo:', error);
  });
}
