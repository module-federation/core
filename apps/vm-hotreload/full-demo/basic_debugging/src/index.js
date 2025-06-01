// Basic Hello World for HMR Testing

const {
  applyHotUpdateFromStringsByPatching,
} = require('../custom-hmr-helpers.js');

console.log('Hello World!');

let counter = 0;
const BACKEND_URL = 'http://localhost:3000';

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
    const response = await fetch(
      `${BACKEND_URL}/api/updates?lastUpdateId=${__webpack_require__.h()}`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Only log if there are actual updates to avoid noise
    if (data.updates && data.updates.length > 0) {
      console.log('📡 Fetched updates from backend');
    }
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch updates from backend:', error);
    return null;
  }
}

// Apply updates received from backend
async function applyBackendUpdates(updatesData) {
  if (
    !updatesData ||
    !updatesData.updates ||
    updatesData.updates.length === 0
  ) {
    // Silently return when no updates to reduce noise
    return;
  }

  console.log(`🔄 Applying ${updatesData.updates.length} updates from backend`);

  for (const update of updatesData.updates) {
    try {
      update.manifest.c = Object.keys(__webpack_require__.hmrS_readFileVm);
      update.manifest.r = Object.keys(__webpack_require__.hmrS_readFileVm);
      update.manifest.m = Object.keys(__webpack_require__.c);

      const manifestJsonString = JSON.stringify(update.manifest);
      const chunkJsStringsMap = { index: update.script };

      console.log('📦 Applying update:', {
        manifest: update.manifest,
        originalInfo: update.originalUpdateInfo,
      });

      await applyHotUpdateFromStringsByPatching(
        module,
        __webpack_require__,
        manifestJsonString,
        chunkJsStringsMap,
      );

      console.log(
        '✅ Successfully applied update:',
        update.originalUpdateInfo?.id,
      );
    } catch (error) {
      console.error('❌ Failed to apply update:', error);
    }
  }

  // Update last applied ID
  lastUpdateId = updatesData.lastUpdateId;
  console.log('📝 Updated lastUpdateId to:', lastUpdateId);
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

// Function to continuously poll for updates
async function startUpdatePolling(intervalMs = 5000) {
  console.log(`🔄 Starting update polling every ${intervalMs}ms`);

  const pollForUpdates = async () => {
    if (typeof __webpack_require__ !== 'undefined') {
      try {
        const updatesData = await fetchUpdatesFromBackend();
        await applyBackendUpdates(updatesData);
      } catch (error) {
        console.error('❌ Error during polling update:', error);
      }
    }
  };

  // Initial poll
  await pollForUpdates();

  // Set up interval polling
  setInterval(pollForUpdates, intervalMs);
}
// HMR acceptance
if (module.hot) {
  console.log('🔥 Debug demo has module.hot support');

  module.hot.accept(() => {
    setDidAcceptUpdate(true);
    console.log('\n♻️  HMR: Index module reloaded!');

    process.exit();
  });
}

// Start the demo
(async () => {
  await runDemo();

  // Start polling for updates from backend
  await startUpdatePolling(3000); // Poll every 3 seconds

  console.log('🎯 Basic debugging demo is running and polling for updates...');
  console.log('💡 Use the backend admin interface to trigger test updates');
})();
// Export functions for testing
module.exports = {
  incrementCounter,
  getCounter,
  runDemo,
};
