// Basic Hello World for HMR Testing

const {
  applyHotUpdateFromStringsByPatching,
} = require('../custom-hmr-helpers.js');

console.log('Hello World!');

let counter = 0;
const BACKEND_URL = 'http://localhost:3000';
// No need to track lastUpdateId - we'll use webpack hash directly

function incrementCounter() {
  counter++;
  console.log(`Counter: ${counter}`);
  return counter;
}

function getCounter() {
  return counter;
}
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

// Fetch updates from backend API
async function fetchUpdatesFromBackend() {
  try {
    const currentHash =
      typeof __webpack_require__ !== 'undefined'
        ? __webpack_require__.h()
        : '0';
    const response = await fetch(
      `${BACKEND_URL}/api/updates?currentHash=${currentHash}`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Only log if there is an actual update to avoid noise
    if (data.update) {
      console.log('📡 Fetched update from backend');
    }
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch updates from backend:', error);
    return null;
  }
}

// Apply updates received from backend
async function applyBackendUpdates(updatesData) {
  if (!updatesData || !updatesData.update) {
    // Silently return when no update to reduce noise
    return;
  }

  const update = updatesData.update;
  console.log('🔄 Applying update from backend');

  try {
    // Store the original hash before applying update
    const originalHash =
      typeof __webpack_require__ !== 'undefined'
        ? __webpack_require__.h()
        : '0';

    update.manifest.c = Object.keys(__webpack_require__.hmrS_readFileVm);
    update.manifest.r = Object.keys(__webpack_require__.hmrS_readFileVm);
    update.manifest.m = Object.keys(__webpack_require__.c);

    const manifestJsonString = JSON.stringify(update.manifest);
    const chunkJsStringsMap = { index: update.script };

    console.log('📦 Applying update:', {
      manifest: update.manifest,
      originalInfo: update.originalInfo,
    });

    await applyHotUpdateFromStringsByPatching(
      module,
      __webpack_require__,
      manifestJsonString,
      chunkJsStringsMap,
    );

    // Ensure the webpack hash is properly updated from the update
    if (update.originalInfo && update.originalInfo.webpackHash) {
      // Force webpack to use the hash from the update
      if (
        typeof __webpack_require__ !== 'undefined' &&
        typeof __webpack_require__.hmrF !== 'undefined'
      ) {
        // Override the hash function to return the new hash
        const originalHmrF = __webpack_require__.hmrF;
        __webpack_require__.hmrF = function () {
          return update.originalInfo.webpackHash;
        };
        // Restore after a short delay
        setTimeout(() => {
          __webpack_require__.hmrF = originalHmrF;
        }, 100);
      }
    }

    console.log(
      '✅ Successfully applied update:',
      update.originalInfo?.updateId,
    );
  } catch (error) {
    console.error('❌ Failed to apply update:', error);
  }

  // Hash will be automatically updated by webpack after hot update
  const newHash =
    typeof __webpack_require__ !== 'undefined' ? __webpack_require__.h() : '0';
  console.log('📝 Webpack hash updated to:', newHash);
}

// Simple demo function
async function runDemo() {
  console.log('Running demo...');
  incrementCounter();

  // Fetch and apply updates from backend API
  console.log('🔍 Checking for updates from backend API...');

  // Only call if webpack require is available
  if (typeof __webpack_require__ !== 'undefined') {
    try {
      const updatesData = await fetchUpdatesFromBackend();
      await applyBackendUpdates(updatesData);
    } catch (error) {
      console.error('❌ Error during backend update process:', error);
    }
  } else {
    console.log('Webpack require not available, skipping hot update');
  }

  console.log('Demo completed');
}

// Track the last applied update to prevent reload loops
let lastAppliedUpdateId = null;
let appliedUpdatesCount = 0;

// Function to continuously poll for updates
async function startUpdatePolling(intervalMs = 5000) {
  console.log(`🔄 Starting update polling every ${intervalMs}ms`);

  const pollForUpdates = async () => {
    if (typeof __webpack_require__ !== 'undefined') {
      try {
        const updatesData = await fetchUpdatesFromBackend();
        if (updatesData && updatesData.update) {
          const updateId = updatesData.update.originalInfo?.updateId;

          // Only apply if this is a new update we haven't seen before
          if (updateId && updateId !== lastAppliedUpdateId) {
            await applyBackendUpdates(updatesData);
            lastAppliedUpdateId = updateId;
            appliedUpdatesCount++;
            console.log(`📊 Applied ${appliedUpdatesCount} updates total`);
          } else if (updateId === lastAppliedUpdateId) {
            // Silently skip - we already have this update
            // This prevents reload loops while allowing continuous polling
          }
        } else {
          // No update available - continue polling silently
        }
      } catch (error) {
        console.error('❌ Error during polling update:', error);
      }
    }
  };

  // Initial poll
  await pollForUpdates();

  // Set up continuous interval polling
  const pollingInterval = setInterval(pollForUpdates, intervalMs);

  // Return interval ID so it can be cleared if needed
  return pollingInterval;
}
// HMR acceptance

// Start the demo
(async () => {
  await runDemo();

  // Start polling for updates from backend
  await startUpdatePolling(3000); // Poll every 3 seconds

  console.log('🎯 Basic debugging demo is running and polling for updates...');
  console.log('💡 Use the backend admin interface to trigger test updates');
})();

if (module.hot) {
  console.log('🔥 Debug demo has module.hot support');
  // module.hot.invalidate()
  module.hot.accept(() => {
    setDidAcceptUpdate(true);
    console.log('\n♻️  HMR: Index module reloaded!');

    process.exit();
  });
}

// Export functions for testing
module.exports = {
  incrementCounter,
  getCounter,
  runDemo,
};
