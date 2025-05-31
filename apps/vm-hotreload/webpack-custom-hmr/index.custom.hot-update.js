exports.id = 'index';
exports.ids = null;
exports.modules = {
  /***/ './src/entrypoint2.js': /***/ (module) => {
    console.log(
      '🎉✨ Congrats, you triggered a virtual HMR update FOR ENTRYPOINT 2! 🚀🔥',
    );
    module.exports = {
      getName: () => '🌟 Updated Entrypoint 2 🌟',
      getCounter: () => 999,
      increment: () => 1000,
      getCreatedAt: () => new Date().toISOString(),
      greet: (name = 'Universe') =>
        `🎊 Hello ${name} from the UPDATED custom entrypoint2! 🎊 Counter is now AMAZING! 🚀✨`,
      reset: () => 'Counter reset to 999 🔄',
      customUpdateApplied: true,
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
