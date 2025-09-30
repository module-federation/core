"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "initializeDevBuildIndicatorForAppRouter", {
    enumerable: true,
    get: function() {
        return initializeDevBuildIndicatorForAppRouter;
    }
});
const _devbuildindicator = require("./internal/dev-build-indicator");
const initializeDevBuildIndicatorForAppRouter = ()=>{
    if (!process.env.__NEXT_DEV_INDICATOR) {
        return;
    }
    _devbuildindicator.devBuildIndicator.initialize();
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=initialize-for-app-router.js.map