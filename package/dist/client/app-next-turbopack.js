// TODO-APP: hydration warning
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _appbootstrap = require("./app-bootstrap");
window.next.version += '-turbo';
self.__webpack_hash__ = '';
const instrumentationHooks = require('../lib/require-instrumentation-client');
(0, _appbootstrap.appBootstrap)(()=>{
    const { hydrate } = require('./app-index');
    hydrate(instrumentationHooks);
    if (process.env.NODE_ENV !== 'production') {
        const { initializeDevBuildIndicatorForAppRouter } = require('./dev/dev-build-indicator/initialize-for-app-router');
        initializeDevBuildIndicatorForAppRouter();
    }
});

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=app-next-turbopack.js.map