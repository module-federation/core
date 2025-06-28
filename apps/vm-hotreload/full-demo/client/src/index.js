/**
 * HMR Client Demo - Main Entry Point
 *
 * This is the main entry point for the HMR client demo that uses the HMR Client Library
 * to poll the backend for hot updates instead of using inline custom runtime code.
 */

console.log('🚀 HMR Client Demo Starting...');

// Import the HMR Client library from the basic_debugging implementation
const {
  HMRClient,
  createHMRClient,
} = require('../../basic_debugging/lib/hmr-client');

// Import our demo module that can be hot-reloaded
const demo = require('./demo');

// Create the HMR client with custom configuration
const hmrClient = createHMRClient({
  autoAttach: true,
  logging: true,
  pollingInterval: 3000, // Poll every 3 seconds
  maxRetries: 3,
});

console.log('📊 Initial HMR Client Status:', hmrClient.getStatus());
console.log('🎯 Initial Demo State:', demo.demoState);

// Create HTTP update provider that polls our backend
const httpUpdateProvider = HMRClient.createHttpUpdateProvider(
  'http://localhost:3000/api/updates',
);

// Set up the update provider
hmrClient.setUpdateProvider(httpUpdateProvider);

// WebSocket connection for real-time notifications
let ws;

function connectWebSocket() {
  try {
    ws = new (require('ws'))('ws://localhost:3001');

    ws.on('open', () => {
      console.log('📡 Connected to WebSocket server for real-time updates');
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        console.log('📦 WebSocket notification:', message);

        if (message.type === 'update-triggered') {
          console.log(`🚀 Real-time update notification: ${message.updateId}`);
          // Trigger immediate check for updates
          checkForUpdatesNow();
        }
      } catch (error) {
        console.error('📡 Failed to parse WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log(
        '📡 WebSocket connection closed. Reconnecting in 3 seconds...',
      );
      setTimeout(connectWebSocket, 3000);
    });

    ws.on('error', (error) => {
      console.error('📡 WebSocket error:', error.message);
      // Will trigger close event and reconnect
    });
  } catch (error) {
    console.error('📡 Failed to connect to WebSocket:', error.message);
    setTimeout(connectWebSocket, 5000);
  }
}

// Function to manually check for updates
async function checkForUpdatesNow() {
  try {
    const result = await hmrClient.checkForUpdates();

    if (result.success) {
      console.log(`✅ Update applied successfully: ${result.updateId}`);
      console.log('📊 New HMR Stats:', hmrClient.getStats());

      // Re-run tests to show the updated functionality
      setTimeout(() => {
        console.log('\n🔄 Running tests after update...');
        demo.runDemoTests();
      }, 100);
    } else if (result.reason !== 'no_updates') {
      console.log(
        `ℹ️ Update check result: ${result.reason} - ${result.message}`,
      );
    }
  } catch (error) {
    console.error('❌ Error checking for updates:', error);
  }
}

// Start automatic polling for updates
function startPolling() {
  console.log('⏰ Starting automatic update polling...');

  const pollingControl = hmrClient.startPolling({
    interval: 3000,
    onUpdate: (result) => {
      console.log(`📦 Polling Update Applied: ${result.updateId}`);

      // Re-run tests to show the updated functionality
      setTimeout(() => {
        console.log('\n🔄 Running tests after polling update...');
        demo.runDemoTests();
      }, 100);
    },
    onError: (result) => {
      if (result.reason !== 'no_updates') {
        console.log(`ℹ️ Polling info: ${result.reason}`);
      }
    },
  });

  // Make polling control available globally for debugging
  global.pollingControl = pollingControl;

  return pollingControl;
}

// Main demo execution
async function runHMRClientDemo() {
  try {
    console.log('\n🎬 HMR Client Demo Starting...');

    // Make hmrClient globally available for updates and debugging
    global.hmrClient = hmrClient;
    global.demo = demo;

    // Initial functionality tests
    demo.runDemoTests();

    // Connect to WebSocket for real-time notifications
    connectWebSocket();

    // Start automatic polling
    const pollingControl = startPolling();

    console.log('\n🎉 HMR Client Demo initialized successfully!');
    console.log('\n💡 HMR Client Demo Features:');
    console.log('   ✅ Automatic polling for updates (every 3 seconds)');
    console.log('   ✅ Real-time WebSocket notifications');
    console.log('   ✅ Hot module replacement using HMR Client library');
    console.log('   ✅ Stateful hot reloading preservation');
    console.log('   ✅ Automatic functionality testing after updates');
    console.log('\n🔧 Available commands:');
    console.log('   - global.hmrClient: Access to HMR client instance');
    console.log('   - global.demo: Access to demo module');
    console.log('   - global.pollingControl.stop(): Stop automatic polling');
    console.log('\n📚 Backend API: http://localhost:3000');
    console.log('🎛️  Admin Interface: http://localhost:3000/admin');
    console.log('📡 WebSocket: ws://localhost:3001');

    // Keep the process running
    console.log('\n⏳ HMR Client Demo is running. Press Ctrl+C to exit.');
  } catch (error) {
    console.error('❌ HMR Client Demo failed to start:', error);
    process.exit(1);
  }
}

// Handle module.hot if available
if (module.hot) {
  module.hot.accept('./demo', () => {
    console.log('🔄 Main module detected demo module hot reload!');
  });

  module.hot.accept(() => {
    console.log('🔄 Main module hot reloaded!');
  });

  module.hot.dispose((data) => {
    console.log('🧹 Main module disposing...');

    // Cleanup WebSocket connection
    if (ws) {
      ws.close();
    }

    // Stop polling
    if (global.pollingControl) {
      global.pollingControl.stop();
    }

    data.preserved = {
      demoState: demo.demoState,
      startTime: demo.demoState.startTime,
    };
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down HMR Client Demo...');

  // Cleanup WebSocket connection
  if (ws) {
    ws.close();
  }

  // Stop polling
  if (global.pollingControl) {
    global.pollingControl.stop();
  }

  // Detach HMR client
  if (hmrClient) {
    hmrClient.detach();
  }

  console.log('✅ HMR Client Demo shutdown complete');
  process.exit(0);
});

// Export for testing and external access
module.exports = {
  hmrClient,
  demo,
  runHMRClientDemo,
  checkForUpdatesNow,
  startPolling,
};

// Auto-start the demo
runHMRClientDemo().catch((error) => {
  console.error('❌ Failed to start HMR Client Demo:', error);
  process.exit(1);
});
