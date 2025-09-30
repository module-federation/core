"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _interceptconsoleerror = require("./intercept-console-error");
(0, _interceptconsoleerror.patchConsoleError)();

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=patch-console.js.map