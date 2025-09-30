"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "devBuildIndicator", {
    enumerable: true,
    get: function() {
        return devBuildIndicator;
    }
});
const _initialize = require("./initialize");
const NOOP = ()=>{};
const devBuildIndicator = {
    /** Shows build indicator when Next.js is compiling. Requires initialize() first. */ show: NOOP,
    /** Hides build indicator when Next.js finishes compiling. Requires initialize() first. */ hide: NOOP,
    /** Sets up the build indicator UI component. Call this before using show/hide. */ initialize: _initialize.initialize
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=dev-build-indicator.js.map