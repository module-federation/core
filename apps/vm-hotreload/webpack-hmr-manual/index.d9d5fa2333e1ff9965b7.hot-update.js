exports.id = 'index';
exports.ids = null;
exports.modules = {
  /***/ './src/entrypoint1.js':
    /*!****************************!*\
  !*** ./src/entrypoint1.js ***!
  \****************************/
    /***/ (module) => {
      const state = {
        name: 'Entrypoint 1',
        counter: 0,
        createdAt: new Date().toISOString(),
      };

      function getName() {
        return state.name;
      }

      function increment() {
        return ++state.counter;
      }
      function getCounter() {
        return state.counter;
      }
      function getCreatedAt() {
        return state.createdAt;
      }
      function greet(name = 'World') {
        return `✨ FINAL: Greetings ${name}! Count is ${state.counter}`;
      }
      function reset() {
        state.counter = 0;
        return 'Counter reset';
      }

      console.log('entrypoint1.js just did something i edited entrypoitn1');
      module.exports = {
        getName,
        increment,
        getCounter,
        getCreatedAt,
        greet,
        reset,
      };

      if (true) {
        console.log('entrypoint1.js hot reload has module.hot');
        // --- HMR self-accept pattern (commented out) ---
        // If you want this module to handle its own hot updates (and NOT notify the parent),
        // uncomment the following line. This is useful for modules with only side effects or
        // when you want to handle HMR logic locally. If self-accept is enabled, the parent
        // will NOT be notified of updates to this module, and parent HMR handlers will not run.
        // module.hot.accept();
        //
        // In this demo, we want the parent to be notified so it can re-require and refresh state.
        // -----------------------------------------------
        // If you want to preserve state, use dispose/data:
        // module.hot.dispose(data => { data.counter = state.counter; });
        // if (module.hot.data) { state.counter = module.hot.data.counter || 0; }
      }

      // Simulated edit at 2025-05-31T00:46:55.547Z
      // Simulated edit at 2025-05-31T00:52:43.278Z

      /***/
    },
};
exports.runtime = /******/ function (__webpack_require__) {
  // webpackRuntimeModules
  /******/ /* webpack/runtime/getFullHash */
  /******/ (() => {
    /******/ __webpack_require__.h = () => '9d3d559c9ff6978a12fd';
    /******/
  })();
  /******/
  /******/
};
