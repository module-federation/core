// Basic Hello World for HMR Testing

const {
  applyHotUpdateFromStringsByPatching,
} = require('./custom-hmr-helpers.js');

console.log('Hello World!');

let counter = 0;

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

// Simple demo function
function runDemo() {
  console.log('Running demo...');
  incrementCounter();

  // Trigger hot update patching
  console.log('Triggering applyHotUpdateFromStringsByPatching...');

  // Only call if webpack require is available
  if (typeof __webpack_require__ !== 'undefined') {
    const { manifestJsonString, chunkJsString } = createForceReloadUpdate();
    const chunkJsStringsMap = { main: chunkJsString };

    applyHotUpdateFromStringsByPatching(
      module,
      __webpack_require__,
      manifestJsonString,
      chunkJsStringsMap,
    ).then(() => {});
  } else {
    console.log('Webpack require not available, skipping hot update');
  }

  console.log('Demo completed');
}
// HMR acceptance
if (module.hot) {
  console.log('🔥 Debug demo has module.hot support');

  module.hot.accept(() => {
    setDidAcceptUpdate(true);
    console.log('\n♻️  HMR: Index module reloaded!');

    // Small delay to ensure module is fully reloaded
    setTimeout(() => {
      console.log('✅ HMR Accept: Module successfully reloaded!');
    }, 100);
  });
}

// Start the demo
runDemo();
setTimeout(() => {
  if (getDidAcceptUpdate()) {
    console.log(
      '✅ HMR test completed successfully - accept callback was executed!',
    );
  } else {
    console.log('❌ HMR test failed - accept callback was not executed');
    throw new Error('HMR test failed');
  }
}, 1000);
// Export functions for testing
module.exports = {
  incrementCounter,
  getCounter,
  runDemo,
};
