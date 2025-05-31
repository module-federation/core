exports.id = 'index';
exports.ids = null;
exports.modules = {
  /***/ './src/entrypoint2.js': /***/ (module) => {
    console.log(
      '🎉 Congrats, you triggered a virtual HMR update FOR ENTRYPOINT 2!',
    );
    module.exports = {
      customUpdateApplied: true,
      greet: () => 'Hello from custom entrypoint2 update!',
    };
  },
};
exports.runtime = /******/ function (__webpack_require__) {
  // webpackRuntimeModules
  /******/ /* webpack/runtime/getFullHash */
  /******/ (() => {
    /******/ __webpack_require__.h = () => 'custom';
    /******/
  })();
  /******/
  /******/
};
