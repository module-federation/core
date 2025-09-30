// TODO-APP: hydration warning
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
require("./app-webpack");
const _appbootstrap = require("./app-bootstrap");
const _initializeforapprouter = require("./dev/dev-build-indicator/initialize-for-app-router");
const instrumentationHooks = require('../lib/require-instrumentation-client');
(0, _appbootstrap.appBootstrap)(()=>{
    const { hydrate } = require('./app-index');
    hydrate(instrumentationHooks);
    (0, _initializeforapprouter.initializeDevBuildIndicatorForAppRouter)();
});

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=app-next-dev.js.map