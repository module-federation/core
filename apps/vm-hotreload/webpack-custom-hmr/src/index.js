console.log('index.js evaluated');

// const { applyHotUpdateFromStrings } = require('./custom-hmr-helpers.js'); // Old
const {
  applyHotUpdateFromStringsByPatching,
} = require('./custom-hmr-helpers.js'); // Correct new export name

let entrypoint1 = require('./entrypoint1.js');
let entrypoint2 = require('./entrypoint2.js');

let iteration = 0;
const maxIterations = 4;
let continueDemo = null;

// Pre-defined custom HMR update chunks for each test message
// Aligned with wrapper-based example test scenario
const customHMRChunks = [
  {
    manifestJsonString: JSON.stringify({ c: ['index'], r: [], m: [] }),
    chunkJsString: `exports.id = 'index';
exports.ids = null;
exports.modules = {
  "./src/entrypoint1.js":
    (module, exports, __webpack_require__) => {
      console.log('🎉✨ HMR Update 1: Entrypoint 1 updated! 🚀🔥');
      const state = {
        name: 'Entrypoint 1',
        counter: 1,
        createdAt: new Date().toISOString(),
      };
      module.exports = {
        getName: () => state.name,
        increment: () => ++state.counter,
        getCounter: () => state.counter,
        getCreatedAt: () => state.createdAt,
        greet: (name = 'World') => \`Hello \${name} from \${state.name}! Counter: \${state.counter}\`,
        reset: () => {
          state.counter = 0;
          return 'Counter reset';
        },
        customUpdateApplied: true,
        updateMessage: 'Hello'
      };
    },
  "./src/entrypoint2.js":
    (module, exports, __webpack_require__) => {
      console.log('🎉✨ HMR Update 1: Entrypoint 2 updated! 🚀🔥');
      const state = {
        name: 'Entrypoint 2',
        counter: 101,
        createdAt: new Date().toISOString(),
      };
      module.exports = {
        getName: () => state.name,
        increment: () => ++state.counter,
        getCounter: () => state.counter,
        getCreatedAt: () => state.createdAt,
        greet: (name = 'Universe') => \`Greetings \${name} from \${state.name}! Counter: \${state.counter}\`,
        reset: () => {
          state.counter = 100;
          return 'Counter reset to 100';
        },
        customUpdateApplied: true,
        updateMessage: 'Greetings'
      };
    },
};
exports.runtime = /******/ function (__webpack_require__) {
  /******/ /* webpack/runtime/getFullHash */
  /******/ (() => {
    /******/ __webpack_require__.h = () => 'custom-update-1';
    /******/
  })();
  /******/
};`,
  },
  {
    manifestJsonString: JSON.stringify({ c: ['index'], r: [], m: [] }),
    chunkJsString: `exports.id = 'index';
exports.ids = null;
exports.modules = {
  "./src/entrypoint1.js":
    (module, exports, __webpack_require__) => {
      console.log('🎉✨ HMR Update 2: Entrypoint 1 hot reloaded! 🚀🔥');
      const state = {
        name: 'Entrypoint 1',
        counter: 2,
        createdAt: new Date().toISOString(),
      };
      module.exports = {
        getName: () => state.name,
        increment: () => ++state.counter,
        getCounter: () => state.counter,
        getCreatedAt: () => state.createdAt,
        greet: (name = 'World') => \`🔥 HOT RELOADED: Hey \${name}! Iteration \${state.counter}\`,
        reset: () => {
          state.counter = 0;
          return 'Counter reset';
        },
        customUpdateApplied: true,
        updateMessage: 'Hot Reloaded'
      };
    },
  "./src/entrypoint2.js":
    (module, exports, __webpack_require__) => {
      console.log('🎉✨ HMR Update 2: Entrypoint 2 hot reloaded! 🚀🔥');
      const state = {
        name: 'Entrypoint 2',
        counter: 102,
        createdAt: new Date().toISOString(),
      };
      module.exports = {
        getName: () => state.name,
        increment: () => ++state.counter,
        getCounter: () => state.counter,
        getCreatedAt: () => state.createdAt,
        greet: (name = 'Universe') => \`Welcome \${name} to \${state.name}!\`,
        reset: () => {
          state.counter = 100;
          return 'Counter reset to 100';
        },
        customUpdateApplied: true,
        updateMessage: 'Welcome'
      };
    },
};
exports.runtime = /******/ function (__webpack_require__) {
  /******/ /* webpack/runtime/getFullHash */
  /******/ (() => {
    /******/ __webpack_require__.h = () => 'custom-update-2';
    /******/
  })();
  /******/
};`,
  },
  {
    manifestJsonString: JSON.stringify({ c: ['index'], r: [], m: [] }),
    chunkJsString: `exports.id = 'index';
exports.ids = null;
exports.modules = {
  "./src/entrypoint1.js":
    (module, exports, __webpack_require__) => {
      console.log('🎉✨ HMR Update 3: Entrypoint 1 final update! 🚀🔥');
      const state = {
        name: 'Entrypoint 1',
        counter: 3,
        createdAt: new Date().toISOString(),
      };
      module.exports = {
        getName: () => state.name,
        increment: () => ++state.counter,
        getCounter: () => state.counter,
        getCreatedAt: () => state.createdAt,
        greet: (name = 'World') => \`✨ FINAL: Greetings \${name}! Count is \${state.counter}\`,
        reset: () => {
          state.counter = 0;
          return 'Counter reset';
        },
        customUpdateApplied: true,
        updateMessage: 'Final'
      };
    },
  "./src/entrypoint2.js":
    (module, exports, __webpack_require__) => {
      console.log('🎉✨ HMR Update 3: Entrypoint 2 final update! 🚀🔥');
      const state = {
        name: 'Entrypoint 2',
        counter: 103,
        createdAt: new Date().toISOString(),
      };
      module.exports = {
        getName: () => state.name,
        increment: () => ++state.counter,
        getCounter: () => state.counter,
        getCreatedAt: () => state.createdAt,
        greet: (name = 'Universe') => \`🌟 Universe says hi to \${name}! Counter: \${state.counter}\`,
        reset: () => {
          state.counter = 100;
          return 'Counter reset to 100';
        },
        customUpdateApplied: true,
        updateMessage: 'Universe'
      };
    },
};
exports.runtime = /******/ function (__webpack_require__) {
  /******/ /* webpack/runtime/getFullHash */
  /******/ (() => {
    /******/ __webpack_require__.h = () => 'custom-update-3';
    /******/
  })();
  /******/
};`,
  },
  {
    manifestJsonString: JSON.stringify({ c: ['index'], r: [], m: [] }),
    chunkJsString: `exports.id = 'index';
exports.ids = null;
exports.modules = {
  "./src/index.js":
    (module, exports, __webpack_require__) => {
      console.log('🎉✨ HMR Update 4: Final completion via hot reload! 🚀🔥');
      console.log('\\n✅ Completed all iterations. Exiting...');
      process.exit(0);
    },
};
exports.runtime = /******/ function (__webpack_require__) {
  /******/ /* webpack/runtime/getFullHash */
  /******/ (() => {
    /******/ __webpack_require__.h = () => 'custom-update-4';
    /******/
  })();
  /******/
};`,
  },
];

function runDemo() {
  iteration++;
  console.log(
    `\n🎭 Running Demo (Iteration ${iteration}/${maxIterations})...\n`,
  );

  try {
    console.log('=== Entrypoint 1 Demo ===');
    console.log('Name:', entrypoint1.getName());
    console.log('Counter:', entrypoint1.getCounter());
    console.log('Increment:', entrypoint1.increment());
    console.log('Greet:', entrypoint1.greet('Developer'));
    console.log('Created at:', entrypoint1.getCreatedAt());
    console.log('Update Message:', entrypoint1.updateMessage || 'Original');
    console.log(
      'Custom Update Applied:',
      entrypoint1.customUpdateApplied || false,
    );

    console.log('\n=== Entrypoint 2 Demo ===');
    console.log('Name:', entrypoint2.getName());
    console.log('Counter:', entrypoint2.getCounter());
    console.log('Increment:', entrypoint2.increment());
    console.log('Greet:', entrypoint2.greet('Universe'));
    console.log('Created at:', entrypoint2.getCreatedAt());
    console.log('Update Message:', entrypoint2.updateMessage || 'Original');
    console.log(
      'Custom Update Applied:',
      entrypoint2.customUpdateApplied || false,
    );
  } catch (error) {
    console.error('❌ Demo error:', error);
    process.exit(1);
  }

  if (iteration >= maxIterations) {
    // Trigger final HMR update that will handle completion
    setTimeout(() => {
      triggerNextHMRUpdate();
    }, 1500);
  } else {
    setTimeout(() => {
      // Trigger the next HMR update programmatically
      triggerNextHMRUpdate();
      continueDemo = runDemo;
    }, 1500);
  }
}

function triggerNextHMRUpdate() {
  if (iteration <= customHMRChunks.length) {
    const hmrContent = customHMRChunks[iteration - 1];
    const updatePayloadForPatcher = {
      hash: `custom-update-${iteration}`,
      manifestJsonString: hmrContent.manifestJsonString,
      chunkJsStringsMap: {
        index: hmrContent.chunkJsString,
      },
    };

    console.log(
      `\n🔄 Triggering HMR Update ${iteration}/${customHMRChunks.length} using Patched HMR Flow...`,
    );

    if (
      typeof __webpack_require__ === 'undefined' ||
      typeof module === 'undefined' ||
      !module.hot
    ) {
      console.error(
        '[HMR Main] Cannot apply update: Webpack internals (__webpack_require__) or module.hot not available.',
      );
      return;
    }

    applyHotUpdateFromStringsByPatching(
      module,
      __webpack_require__,
      updatePayloadForPatcher.manifestJsonString,
      updatePayloadForPatcher.chunkJsStringsMap,
    )
      .then((updatedModules) => {
        console.log(
          `[HMR Main] Patched HMR flow complete. Updated modules: ${updatedModules && updatedModules.length > 0 ? updatedModules.join(', ') : 'none'}`,
        );
      })
      .catch((err) => {
        console.error(
          '[HMR Main] Error applying update via patched HMR flow:',
          err,
        );
      });
  }
}

if (module.hot) {
  console.log('index.js has module.hot');
  module.hot.accept();
  module.hot.accept(['./entrypoint1.js', './entrypoint2.js'], () => {
    require('./entrypoint1.js');
    require('./entrypoint2.js');
    console.log('HMR accept handler called');
    console.log('\n♻️  HMR: Modules reloaded!');
    if (typeof continueDemo === 'function') {
      const fn = continueDemo;
      continueDemo = null;
      fn();
    }
  });
}

runDemo();
