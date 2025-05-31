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
        return `🔥 HOT RELOADED: Hey ${name}! Iteration ${state.counter}`;
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
    /******/ __webpack_require__.h = () => '7c2669c0c77598a9d5e6';
    /******/
  })();
  /******/
  /******/
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguOWQzZDU1OWM5ZmY2OTc4YTEyZmQuaG90LXVwZGF0ZS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMsS0FBSyxjQUFjLGNBQWM7QUFDbEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG1CQUFtQjs7QUFFbkIsSUFBSSxJQUFVO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQywrQkFBK0I7QUFDakUsNEJBQTRCO0FBQzVCOztBQUVBO0FBQ0E7Ozs7Ozs7OztVQy9DQSIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYnBhY2staG1yLWRlbW8vLi9zcmMvZW50cnlwb2ludDEuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay1obXItZGVtby93ZWJwYWNrL3J1bnRpbWUvZ2V0RnVsbEhhc2giXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgc3RhdGUgPSB7XG4gIG5hbWU6ICdFbnRyeXBvaW50IDEnLFxuICBjb3VudGVyOiAwLFxuICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbn07XG5cbmZ1bmN0aW9uIGdldE5hbWUoKSB7XG4gIHJldHVybiBzdGF0ZS5uYW1lO1xufVxuXG5mdW5jdGlvbiBpbmNyZW1lbnQoKSB7XG4gIHJldHVybiArK3N0YXRlLmNvdW50ZXI7XG59XG5mdW5jdGlvbiBnZXRDb3VudGVyKCkge1xuICByZXR1cm4gc3RhdGUuY291bnRlcjtcbn1cbmZ1bmN0aW9uIGdldENyZWF0ZWRBdCgpIHtcbiAgcmV0dXJuIHN0YXRlLmNyZWF0ZWRBdDtcbn1cbmZ1bmN0aW9uIGdyZWV0KG5hbWUgPSAnV29ybGQnKSB7XG4gIHJldHVybiBg8J+UpSBIT1QgUkVMT0FERUQ6IEhleSAke25hbWV9ISBJdGVyYXRpb24gJHtzdGF0ZS5jb3VudGVyfWA7XG59XG5mdW5jdGlvbiByZXNldCgpIHtcbiAgc3RhdGUuY291bnRlciA9IDA7XG4gIHJldHVybiAnQ291bnRlciByZXNldCc7XG59XG5cbmNvbnNvbGUubG9nKCdlbnRyeXBvaW50MS5qcyBqdXN0IGRpZCBzb21ldGhpbmcgaSBlZGl0ZWQgZW50cnlwb2l0bjEnKTtcbm1vZHVsZS5leHBvcnRzID0geyBnZXROYW1lLCBpbmNyZW1lbnQsIGdldENvdW50ZXIsIGdldENyZWF0ZWRBdCwgZ3JlZXQsIHJlc2V0IH07XG5cbmlmIChtb2R1bGUuaG90KSB7XG4gIGNvbnNvbGUubG9nKCdlbnRyeXBvaW50MS5qcyBob3QgcmVsb2FkIGhhcyBtb2R1bGUuaG90Jyk7XG4gIC8vIC0tLSBITVIgc2VsZi1hY2NlcHQgcGF0dGVybiAoY29tbWVudGVkIG91dCkgLS0tXG4gIC8vIElmIHlvdSB3YW50IHRoaXMgbW9kdWxlIHRvIGhhbmRsZSBpdHMgb3duIGhvdCB1cGRhdGVzIChhbmQgTk9UIG5vdGlmeSB0aGUgcGFyZW50KSxcbiAgLy8gdW5jb21tZW50IHRoZSBmb2xsb3dpbmcgbGluZS4gVGhpcyBpcyB1c2VmdWwgZm9yIG1vZHVsZXMgd2l0aCBvbmx5IHNpZGUgZWZmZWN0cyBvclxuICAvLyB3aGVuIHlvdSB3YW50IHRvIGhhbmRsZSBITVIgbG9naWMgbG9jYWxseS4gSWYgc2VsZi1hY2NlcHQgaXMgZW5hYmxlZCwgdGhlIHBhcmVudFxuICAvLyB3aWxsIE5PVCBiZSBub3RpZmllZCBvZiB1cGRhdGVzIHRvIHRoaXMgbW9kdWxlLCBhbmQgcGFyZW50IEhNUiBoYW5kbGVycyB3aWxsIG5vdCBydW4uXG4gIC8vIG1vZHVsZS5ob3QuYWNjZXB0KCk7XG4gIC8vXG4gIC8vIEluIHRoaXMgZGVtbywgd2Ugd2FudCB0aGUgcGFyZW50IHRvIGJlIG5vdGlmaWVkIHNvIGl0IGNhbiByZS1yZXF1aXJlIGFuZCByZWZyZXNoIHN0YXRlLlxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBJZiB5b3Ugd2FudCB0byBwcmVzZXJ2ZSBzdGF0ZSwgdXNlIGRpc3Bvc2UvZGF0YTpcbiAgLy8gbW9kdWxlLmhvdC5kaXNwb3NlKGRhdGEgPT4geyBkYXRhLmNvdW50ZXIgPSBzdGF0ZS5jb3VudGVyOyB9KTtcbiAgLy8gaWYgKG1vZHVsZS5ob3QuZGF0YSkgeyBzdGF0ZS5jb3VudGVyID0gbW9kdWxlLmhvdC5kYXRhLmNvdW50ZXIgfHwgMDsgfVxufVxuXG4vLyBTaW11bGF0ZWQgZWRpdCBhdCAyMDI1LTA1LTMxVDAwOjQ2OjU1LjU0N1pcbi8vIFNpbXVsYXRlZCBlZGl0IGF0IDIwMjUtMDUtMzFUMDA6NTI6NDMuMjc4WiIsIl9fd2VicGFja19yZXF1aXJlX18uaCA9ICgpID0+IChcIjdjMjY2OWMwYzc3NTk4YTlkNWU2XCIpIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
