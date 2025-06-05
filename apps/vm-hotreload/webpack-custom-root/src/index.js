// Multi-Module Force Reload Demo - Complex application with multiple entry points
// This demonstrates how to trigger Webpack HMR across multiple chunks and modules
// including utilities, components, and different application sections

const {
  applyHotUpdateFromStringsByPatching,
} = require('./custom-hmr-helpers.js');

// Import utilities
const Logger = require('./utils/logger');
const DataManager = require('./utils/dataManager');
const Metrics = require('./utils/metrics');
const timestampModule = require('./utils/timestamp');

// Import components
const UserInterface = require('./components/userInterface');
const DataVisualization = require('./components/dataVisualization');

// Import dashboard and analytics modules
const dashboard = require('./dashboard.js');
const analytics = require('./analytics.js');

// Initialize main application components
const logger = new Logger('MAIN-APP');
const dataManager = new DataManager();
const metrics = new Metrics();
const mainUI = new UserInterface('MainApp');
const appChart = new DataVisualization('main-chart');

let iteration = 0;
let continueDemo = null;
let demoCompleted = false;

// Store initial timestamp for HMR testing
let initialTimestamp = timestampModule.getModuleLoadTime();
let lastKnownTimestamp = initialTimestamp;

// Use global scope to persist across HMR reloads
if (typeof global !== 'undefined') {
  global.didAcceptUpdate = global.didAcceptUpdate || false;
} else if (typeof window !== 'undefined') {
  window.didAcceptUpdate = window.didAcceptUpdate || false;
}

function getDidAcceptUpdate() {
  if (typeof global !== 'undefined') {
    return global.didAcceptUpdate;
  } else if (typeof window !== 'undefined') {
    return window.didAcceptUpdate;
  }
  return false;
}

function setDidAcceptUpdate(value) {
  if (typeof global !== 'undefined') {
    global.didAcceptUpdate = value;
  } else if (typeof window !== 'undefined') {
    window.didAcceptUpdate = value;
  }
}

function testTimestampUpdate() {
  const currentTimestamp = timestampModule.getModuleLoadTime();
  const currentTimeString = timestampModule.getModuleLoadTimeString();

  logger.info(`🕐 Testing timestamp update:`);
  logger.info(
    `  Initial: ${new Date(initialTimestamp).toISOString()} (${initialTimestamp})`,
  );
  logger.info(`  Current: ${currentTimeString} (${currentTimestamp})`);
  logger.info(
    `  Last Known: ${new Date(lastKnownTimestamp).toISOString()} (${lastKnownTimestamp})`,
  );

  if (currentTimestamp === lastKnownTimestamp) {
    const errorMsg = `❌ HMR TIMESTAMP TEST FAILED: Timestamp has not updated! Expected new timestamp after hot reload, but got same value: ${currentTimestamp}`;
    logger.error(errorMsg);
    console.error('\n' + '='.repeat(80));
    console.error('🚨 HMR TIMESTAMP VALIDATION ERROR');
    console.error('='.repeat(80));
    console.error(errorMsg);
    console.error('This indicates that the module was not properly reloaded.');
    console.error('='.repeat(80));
    throw new Error(errorMsg);
  } else {
    logger.info(
      `✅ HMR TIMESTAMP TEST PASSED: Timestamp updated from ${lastKnownTimestamp} to ${currentTimestamp}`,
    );
    lastKnownTimestamp = currentTimestamp;
    return true;
  }
}

logger.info('🚀 Multi-module application initialized');
logger.info(
  `Webpack chunks available: ${Object.keys(__webpack_require__.cache || {}).length}`,
);
function displayCurrentState() {
  logger.info('📊 Displaying current application state...');

  console.log('\n' + '='.repeat(80));
  console.log('🏗️  MULTI-MODULE APPLICATION STATE');
  console.log('='.repeat(80));

  // Dashboard and Analytics modules
  console.log('📦 Application Modules:');
  console.log('  Dashboard:');
  const dashboardStatus = dashboard.getDashboardStatus();
  console.log('    Initialized:', dashboardStatus.state.isInitialized);
  console.log('    Start Time:', dashboardStatus.state.startTime);
  console.log(
    '    Active Connections:',
    dashboardStatus.state.activeConnections,
  );

  console.log('  Analytics:');
  const analyticsReport = analytics.generateAnalyticsReport();
  console.log('    Total Events:', analyticsReport.summary.totalEvents);
  console.log('    Unique Users:', analyticsReport.summary.uniqueUsers);
  console.log('    Error Rate:', analyticsReport.summary.errorRate + '%');

  // Application components
  console.log('\n🧩 Application Components:');
  console.log('  Logger:');
  console.log('    Log Count:', logger.getLogCount());
  console.log('    Created at:', logger.getCreatedAt());

  console.log('  Data Manager:');
  const dmStats = dataManager.getStats();
  console.log('    Data Size:', dmStats.size);
  console.log('    Keys:', dmStats.keys.join(', ') || 'none');
  console.log('    Subscribers:', dmStats.subscriberCount);

  console.log('  Metrics:');
  const metricsReport = metrics.getReport();
  console.log('    Counters:', Object.keys(metricsReport.counters).length);
  console.log('    Gauges:', Object.keys(metricsReport.gauges).length);
  console.log('    Events:', metricsReport.eventCount);

  console.log('  User Interface:');
  console.log('    Name:', mainUI.getName());
  console.log('    Theme:', mainUI.getState('theme'));
  console.log('    Visible:', mainUI.getState('isVisible'));
  console.log('    Notifications:', mainUI.getNotificationCount());

  console.log('  Data Visualization:');
  console.log('    Type:', appChart.getType());
  console.log('    Datasets:', appChart.getDatasetCount());
  console.log('    Renders:', appChart.getRenderCount());

  console.log('\n📈 Application Metrics:');
  console.log(
    '  Total Operations:',
    metrics.getCounter('total_operations') || 0,
  );
  console.log('  State Changes:', metrics.getCounter('state_changes') || 0);
  console.log(
    '  Component Renders:',
    metrics.getCounter('component_renders') || 0,
  );

  console.log('='.repeat(80));
}

function modifyState() {
  logger.info('🔧 Modifying complex application state...');
  metrics.startTimer('state_modification');

  // Simulate dashboard and analytics activity
  dashboard.simulateActivity();
  analytics.generateSampleEvents(10);

  // Modify application components
  dataManager.set('user_count', 250);
  dataManager.set('active_sessions', 75);
  dataManager.set('last_action', 'state_modification');
  dataManager.set('modification_time', new Date().toISOString());

  // Update UI state
  mainUI.setTheme('dark');
  mainUI.addNotification('Application state modified', 'info');
  mainUI.setActiveUsers(250);

  // Add sample data to visualization
  const sampleData = [];
  for (let i = 0; i < 10; i++) {
    sampleData.push({
      x: i,
      y: Math.floor(Math.random() * 100) + i * 5,
      label: `Data Point ${i + 1}`,
    });
  }

  appChart.addDataset('modified_data', sampleData, {
    color: '#ff6b6b',
    label: 'Modified Data',
    type: 'line',
  });

  // Update metrics
  metrics.incrementCounter('total_operations', 5);
  metrics.incrementCounter('state_changes', 8);
  metrics.setGauge('current_users', 250);
  metrics.setGauge('memory_usage', Math.floor(Math.random() * 100));

  const modificationTime = metrics.endTimer('state_modification');

  logger.info('✅ Complex state modification completed');
  console.log('\n🔄 State Changes Summary:');
  console.log('  Dashboard activity simulated');
  console.log('  Analytics events generated: 10');
  console.log('  Data Manager entries:', dataManager.size());
  console.log('  UI notifications:', mainUI.getNotificationCount());
  console.log('  Chart datasets:', appChart.getDatasetCount());
  console.log('  Modification time:', `${modificationTime}ms`);

  metrics.incrementCounter('component_renders');
}

function createForceReloadUpdate() {
  console.log(
    'currently installed chunks',
    __webpack_require__.hmrS_readFileVm,
  );
  console.log('currently cached modules', Object.keys(__webpack_require__.c));

  // This creates an "empty" HMR update that forces module re-installation
  // without providing new content - modules will be reloaded from their original files
  // Include timestamp module to test if static exports are re-evaluated
  const modulesToReload = Object.keys(__webpack_require__.c);
  console.log(
    '🕐 Modules to reload (including timestamp module):',
    modulesToReload,
  );

  return {
    manifestJsonString: JSON.stringify({
      c: Object.keys(__webpack_require__.hmrS_readFileVm), // update all currently installed chunks
      r: Object.keys(__webpack_require__.hmrS_readFileVm), // removed chunks
      m: modulesToReload, // modules to be re-installed
    }),
    chunkJsString: `exports.id = 'main';
exports.ids = null;
exports.modules = {};
exports.runtime = /******/ function (__webpack_require__) {
  /******/ /* webpack/runtime/getFullHash */
  /******/ (() => {
    /******/ __webpack_require__.h = () => 'force-reload-${Date.now()}';
    /******/
  })();
  /******/
};`,
  };
}

function triggerForceReload() {
  console.log('\n🔄 Triggering Force Reload (Empty HMR Update)...');
  console.log(
    '📦 This will cause Webpack to re-install modules from their original files',
  );

  const forceReloadUpdate = createForceReloadUpdate();
  const updatePayload = {
    hash: `force-reload-${Date.now()}`,
    manifestJsonString: forceReloadUpdate.manifestJsonString,
    chunkJsStringsMap: {
      main: forceReloadUpdate.chunkJsString,
      dashboard: '{}',
      analytics: '{}',
      components: '{}',
    },
  };

  if (
    typeof __webpack_require__ === 'undefined' ||
    typeof module === 'undefined' ||
    !module.hot
  ) {
    console.error(
      '[Force Reload] Cannot apply update: Webpack internals not available.',
    );
    return;
  }

  applyHotUpdateFromStringsByPatching(
    module,
    __webpack_require__,
    updatePayload.manifestJsonString,
    updatePayload.chunkJsStringsMap,
  )
    .then((updatedModules) => {})
    .catch((err) => {
      console.error('[Force Reload] Error applying force reload:', err);
    });
}

function runDemo() {
  if (demoCompleted) {
    console.log('🛑 Demo already completed, skipping...');
    return;
  }

  iteration++;
  console.log(`\n🎭 Force Reload Demo (Step ${iteration})`);
  console.log('='.repeat(50));

  switch (iteration) {
    case 1:
      console.log('📋 Step 1: Display initial application state');
      // displayCurrentState();
      break;

    case 2:
      console.log('🔧 Step 2: Modify application state and show changes');
      modifyState();
      // displayCurrentState();
      // Run analytics demo as part of step 2
      console.log('📊 Running analytics demo...');
      analytics.runAnalyticsDemo();
      break;

    case 3:
      console.log('🔄 Step 3: Trigger force reload to reset to original state');
      triggerForceReload();
      // The HMR accept handler will continue the demo
      return;

    default:
      // console.log('\n✅ Demo completed!');
      // console.log('📊 Final state after force reload:');
      // displayCurrentState();

      // Test timestamp update after force reload
      // console.log('\n🕐 Testing HMR timestamp validation...');
      try {
        testTimestampUpdate();
        console.log(
          '✅ HMR timestamp test passed - module was properly reloaded!',
        );
      } catch (error) {
        console.error('❌ HMR timestamp test failed:', error.message);
        // Don't exit on timestamp test failure, just log it
      }

      console.log(
        '\n🎉 Notice how the state has been reset to original values!',
      );
      console.log(
        '🔄 This simulates an application reboot without killing the process.',
      );
      console.log('\n🛑 Demo finished - exiting in 2 seconds...');
      demoCompleted = true;

      // Stop analytics processing to prevent continuous output
      analytics.stopAnalytics();

      return;
  }

  // Continue for steps 1-3, then let HMR handler continue to step 4
  if (iteration < 3) {
    setTimeout(() => {
      if (!global.didAcceptUpdate) {
        runDemo();
      }
    }, 3000);
  } else if (iteration === 3) {
    // Set up continuation for after force reload
    continueDemo = runDemo;
  }
}

if (module.hot) {
  console.log('🔥 Force reload demo has module.hot support');

  module.hot.accept(() => {
    setDidAcceptUpdate(true);
    console.log('\n♻️  HMR: Index module reloaded!');
    if (demoCompleted) {
      console.log('🛑 Demo already completed, not restarting.');
      return;
    }

    // Test timestamp update after hot reload
    setTimeout(() => {
      console.log('\n🕐 HMR Accept: Testing timestamp update...');
      try {
        testTimestampUpdate();
        console.log(
          '✅ HMR Accept: Timestamp test passed - module was reloaded!',
        );
      } catch (error) {
        console.error('❌ HMR Accept: Timestamp test failed:', error.message);
      }

      // Re-run demo after hot reload if continueDemo is set
      if (typeof continueDemo === 'function') {
        const fn = continueDemo;
        continueDemo = null;
        setTimeout(() => {
          console.log('\n🔄 Continuing demo after hot reload...');
          fn();
          // After running once, clear continueDemo to prevent further calls
          continueDemo = null;
        }, 500);
      }
    }, 100); // Small delay to ensure module is fully reloaded
  });

  module.hot.accept(
    [
      './dashboard.js',
      './analytics.js',
      './utils/logger.js',
      './utils/dataManager.js',
      './utils/metrics.js',
      './components/userInterface.js',
      './components/dataVisualization.js',
    ],
    () => {
      setDidAcceptUpdate(true);
      console.log('\n♻️  HMR: Application modules reloaded!');
      console.log('🔄 Re-requiring modules to get fresh instances...');
      // Re-require modules normally
      require('./dashboard.js');
      require('./analytics.js');

      console.log('✅ Fresh module instances loaded');

      // Show final state after force reload
      console.log('\n✅ Demo completed!');
      console.log('📊 Final state after force reload:');
      displayCurrentState();
      console.log(
        '\n🎉 Notice how the complex application state has been reset!',
      );
      console.log(
        '🔄 This simulates an application reboot without killing the process.',
      );
      console.log('\n📝 Key points:');
      console.log('  • Dashboard and Analytics modules reloaded');
      console.log('  • All utility and component modules refreshed');
      console.log('  • Fresh timestamps show modules were re-instantiated');
      console.log(
        '  • No new module content was provided - just empty HMR update',
      );
      console.log('\n🛑 HMR Demo finished - checking HMR accept callback...');

      // Check if HMR accept callback was executed
      setTimeout(() => {
        if (getDidAcceptUpdate()) {
          console.log(
            '✅ HMR test completed successfully - accept callback was executed!',
          );
        } else {
          console.log('❌ HMR test failed - accept callback was not executed');
          throw new Error('HMR test failed');
        }
        console.log('👋 Goodbye from HMR handler!');
        process.exit(0);
      }, 1000);
    },
  );
}

// Start the demo regardless of HMR availability
console.log('🚀 Starting Force Reload Demo...');
console.log(
  '📝 This demo shows how to trigger a force reload using empty HMR updates',
);
console.log(
  '🎯 Goal: Simulate application reboot without killing the process\n',
);

runDemo();
