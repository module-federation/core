// HMR Testing Module - Designed for Webpack Bundle Testing

const {
  applyHotUpdateFromStringsByPatching,
} = require('../custom-hmr-helpers.js');

// Test state that persists across HMR reloads
let moduleState = {
  version: '1.0.0',
  reloadCount: 0,
  lastReload: null,
  moduleId: Math.random().toString(36).substr(2, 9),
  isUpdated: false,
};

// HMR Test Functions
function getModuleState() {
  return { ...moduleState };
}

function updateModuleState(newState) {
  moduleState = { ...moduleState, ...newState };
  moduleState.lastReload = new Date().toISOString();
  return moduleState;
}

function incrementReloadCount() {
  moduleState.reloadCount++;
  moduleState.lastReload = new Date().toISOString();
  return moduleState.reloadCount;
}

function resetModuleState() {
  const oldModuleId = moduleState.moduleId;
  moduleState = {
    version: '1.0.0',
    reloadCount: 0,
    lastReload: null,
    moduleId: Math.random().toString(36).substr(2, 9),
    isUpdated: false,
  };
  return { oldModuleId, newModuleId: moduleState.moduleId };
}

// Update Provider System
let updateProvider = null;

function setUpdateProvider(provider) {
  updateProvider = provider;
}

function getUpdateProvider() {
  return updateProvider;
}

// Provider factories
function createDefaultUpdateProvider() {
  return async function defaultUpdateProvider() {
    return { update: null };
  };
}

function createQueueUpdateProvider(updates = []) {
  let index = 0;
  return async function queueUpdateProvider() {
    if (index < updates.length) {
      const update = updates[index];
      index++;
      return { update };
    }
    return { update: null };
  };
}

function createCallbackUpdateProvider(callback) {
  return async function callbackUpdateProvider() {
    try {
      const currentHash =
        typeof __webpack_require__ !== 'undefined'
          ? __webpack_require__.h()
          : '0';
      const result = await callback(currentHash);
      return result || { update: null };
    } catch (error) {
      return { update: null };
    }
  };
}

// Core HMR Testing Functions
async function fetchUpdates() {
  if (!updateProvider) {
    console.log('Failed to fetch updates: No provider set');
    return { update: null };
  }

  try {
    const result = await updateProvider();
    if (result && result.update) {
      console.log('Applying update from provider');
    }
    return result;
  } catch (error) {
    console.log('Failed to fetch updates:', error.message);
    return { update: null };
  }
}

async function applyUpdates(updatesData, force = false) {
  if (!updatesData || !updatesData.update) {
    if (!force) {
      return { success: false, reason: 'no_update_data' };
    }

    console.log('Force mode: creating minimal update for testing');
    // Force mode: create minimal update for testing
    updatesData = {
      update: {
        manifest: {
          h:
            typeof __webpack_require__ !== 'undefined'
              ? __webpack_require__.h()
              : 'force-hash',
          c: [],
          r: [],
          m: [],
        },
        script: `
          exports.modules = {};
          exports.runtime = function(__webpack_require__) {
            // Force runtime update for testing
          };
        `,
        originalInfo: {
          updateId: 'force-update-' + Date.now(),
          webpackHash:
            typeof __webpack_require__ !== 'undefined'
              ? __webpack_require__.h()
              : 'force-hash',
        },
      },
    };
  }

  const update = updatesData.update;
  console.log('Applying update from provider');

  try {
    // For testing: populate manifest with current webpack state
    if (typeof __webpack_require__ !== 'undefined') {
      update.manifest.c =
        update.manifest.c.length === 0
          ? Object.keys(__webpack_require__.hmrS_readFileVm || {})
          : update.manifest.c;
      update.manifest.r =
        update.manifest.r.length === 0
          ? Object.keys(__webpack_require__.hmrS_readFileVm || {})
          : update.manifest.r;
      update.manifest.m =
        update.manifest.m.length === 0
          ? Object.keys(__webpack_require__.c || {})
          : update.manifest.m;
    }

    const manifestJsonString = JSON.stringify(update.manifest);
    const chunkJsStringsMap = { index: update.script };

    // Apply the HMR update
    await applyHotUpdateFromStringsByPatching(
      module,
      __webpack_require__,
      manifestJsonString,
      chunkJsStringsMap,
    );

    // Update module state to reflect successful HMR
    incrementReloadCount();
    updateModuleState({
      isUpdated: true,
      lastUpdateId: update.originalInfo?.updateId,
    });

    return {
      success: true,
      updateId: update.originalInfo?.updateId,
      moduleState: getModuleState(),
    };
  } catch (error) {
    return {
      success: false,
      reason: 'apply_failed',
      error: error.message,
    };
  }
}

async function forceUpdate() {
  try {
    console.log('Force mode');
    console.log('Applying forced update');
    const result = await applyUpdates(null, true);
    return result;
  } catch (error) {
    return {
      success: false,
      reason: 'force_failed',
      error: error.message,
    };
  }
}

// Update polling functionality
async function startUpdatePolling(intervalMs = 1000, forceMode = false) {
  const pollingFunction = async () => {
    try {
      if (forceMode) {
        await forceUpdate();
      } else {
        const updateData = await fetchUpdates();
        if (updateData && updateData.update) {
          await applyUpdates(updateData);
        }
      }
    } catch (error) {
      console.log('Polling error:', error.message);
    }
  };

  // Run initial check
  await pollingFunction();

  // Start interval
  const interval = setInterval(pollingFunction, intervalMs);

  return interval;
}

// Test utilities
function testModuleReinstall() {
  const beforeState = getModuleState();
  const newId = resetModuleState();
  const afterState = getModuleState();

  return {
    beforeState,
    afterState,
    moduleIdChanged: newId.oldModuleId !== newId.newModuleId,
    stateReset: beforeState.reloadCount !== afterState.reloadCount,
  };
}

function getHMRStatus() {
  return {
    hasWebpackRequire: typeof __webpack_require__ !== 'undefined',
    hasModuleHot: typeof module !== 'undefined' && !!module.hot,
    hotStatus:
      typeof module !== 'undefined' && module.hot
        ? module.hot.status()
        : 'unavailable',
    moduleState: getModuleState(),
    webpackHash:
      typeof __webpack_require__ !== 'undefined'
        ? __webpack_require__.h()
        : null,
  };
}

// Initialize
if (!updateProvider) {
  setUpdateProvider(createDefaultUpdateProvider());
}

// HMR acceptance for testing
if (module.hot) {
  module.hot.accept(() => {
    // When HMR updates this module, increment reload count
    incrementReloadCount();
    updateModuleState({ isUpdated: true, hotReloaded: true });
  });
}

// Only run demo if executed directly (not imported)
if (require.main === module) {
  console.log('HMR Test Module Started');
  console.log('Initial State:', getModuleState());
  console.log('HMR Status:', getHMRStatus());
}

// Export all testing functions
module.exports = {
  // State management
  getModuleState,
  updateModuleState,
  incrementReloadCount,
  resetModuleState,

  // Update providers
  setUpdateProvider,
  getUpdateProvider,
  createDefaultUpdateProvider,
  createQueueUpdateProvider,
  createCallbackUpdateProvider,

  // HMR operations
  fetchUpdates,
  applyUpdates,
  forceUpdate,
  startUpdatePolling,

  // Test utilities
  testModuleReinstall,
  getHMRStatus,
};
