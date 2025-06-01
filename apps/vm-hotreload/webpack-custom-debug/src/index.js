// Simple HMR Test - Basic counter increment demo
// This demonstrates how to trigger Webpack HMR with a simple counter

const {
  applyHotUpdateFromStringsByPatching,
} = require('./custom-hmr-helpers.js');

// Import utilities
const timestampModule = require('./utils/timestamp');
const dashboard = require('./dashboard.js');
const analytics = require('./analytics.js');

// Simple counter state
let counter = 0;
let initialTimestamp = timestampModule.getModuleLoadTime();
let lastKnownTimestamp = initialTimestamp;

function incrementCounter() {
  counter++;
  return counter;
}

function getCounter() {
  return counter;
}

function testTimestampUpdate() {
  const currentTimestamp = timestampModule.getModuleLoadTime();

  if (currentTimestamp === lastKnownTimestamp) {
    throw new Error('HMR TIMESTAMP TEST FAILED: Timestamp has not updated!');
  } else {
    lastKnownTimestamp = currentTimestamp;
    return true;
  }
}
function displayCurrentState() {
  return {
    counter: counter,
    timestamp: timestampModule.getModuleLoadTime(),
    dashboardCounter: dashboard.getCounter(),
    analyticsCounter: analytics.getCounter(),
  };
}

function modifyState() {
  incrementCounter();
  dashboard.incrementCounter();
  analytics.incrementCounter();
}

function createForceReloadUpdate() {
  const modulesToReload = Object.keys(__webpack_require__.c);

  return {
    manifestJsonString: JSON.stringify({
      c: Object.keys(__webpack_require__.hmrS_readFileVm),
      r: Object.keys(__webpack_require__.hmrS_readFileVm),
      m: modulesToReload,
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
    return;
  }

  applyHotUpdateFromStringsByPatching(
    module,
    __webpack_require__,
    updatePayload.manifestJsonString,
    updatePayload.chunkJsStringsMap,
  )
    .then((updatedModules) => {
      // Force reload complete
    })
    .catch((err) => {
      // Error applying force reload
    });
}

let iteration = 0;
let continueDemo = null;
let demoCompleted = false;

function runDemo() {
  if (demoCompleted) {
    return;
  }

  iteration++;

  switch (iteration) {
    case 1:
      // Step 1: Display initial state
      break;

    case 2:
      // Step 2: Modify state
      modifyState();
      break;

    case 3:
      // Step 3: Trigger force reload
      triggerForceReload();
      return;

    default:
      // Test timestamp update after force reload
      try {
        testTimestampUpdate();
      } catch (error) {
        // Timestamp test failed
      }

      demoCompleted = true;
      setTimeout(() => {
        process.exit(0);
      }, 2000);
      return;
  }

  // Continue for steps 1-3
  if (iteration < 3) {
    setTimeout(() => {
      continueDemo = runDemo;
      runDemo();
    }, 2000);
  } else if (iteration === 3) {
    continueDemo = runDemo;
  }
}

if (module.hot) {
  module.hot.accept(() => {
    console.log('ACCEPT HOT UPDATE SELF');
    if (demoCompleted) {
      return;
    }

    // Test timestamp update after hot reload
    setTimeout(() => {
      try {
        testTimestampUpdate();
      } catch (error) {
        // Timestamp test failed
      }

      // Re-run demo after hot reload if continueDemo is set
      if (typeof continueDemo === 'function') {
        const fn = continueDemo;
        continueDemo = null;
        setTimeout(() => {
          fn();
          continueDemo = null;
        }, 500);
      }
    }, 100);
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
      // Re-require modules
      require('./dashboard.js');
      require('./analytics.js');

      demoCompleted = true;
      setTimeout(() => {
        process.exit(0);
      }, 2000);
    },
  );
}

// Start the demo
runDemo();

// Export functions for testing
module.exports = {
  incrementCounter,
  getCounter,
  displayCurrentState,
  testTimestampUpdate,
};
