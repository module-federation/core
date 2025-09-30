"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "initializeDevBuildIndicatorForPageRouter", {
    enumerable: true,
    get: function() {
        return initializeDevBuildIndicatorForPageRouter;
    }
});
const _websocket = require("../../components/react-dev-overlay/pages/websocket");
const _devbuildindicator = require("./internal/dev-build-indicator");
const _handledevbuildindicatorhmrevents = require("./internal/handle-dev-build-indicator-hmr-events");
const initializeDevBuildIndicatorForPageRouter = ()=>{
    if (!process.env.__NEXT_DEV_INDICATOR) {
        return;
    }
    _devbuildindicator.devBuildIndicator.initialize();
    // Add message listener specifically for Pages Router to handle lifecycle events
    // related to dev builds (building, built, sync)
    (0, _websocket.addMessageListener)(_handledevbuildindicatorhmrevents.handleDevBuildIndicatorHmrEvents);
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=initialize-for-page-router.js.map