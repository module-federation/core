"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "handleDevBuildIndicatorHmrEvents", {
    enumerable: true,
    get: function() {
        return handleDevBuildIndicatorHmrEvents;
    }
});
const _hotreloadertypes = require("../../../../server/dev/hot-reloader-types");
const _devbuildindicator = require("./dev-build-indicator");
const handleDevBuildIndicatorHmrEvents = (obj)=>{
    try {
        if (!('action' in obj)) {
            return;
        }
        // eslint-disable-next-line default-case
        switch(obj.action){
            case _hotreloadertypes.HMR_ACTIONS_SENT_TO_BROWSER.BUILDING:
                _devbuildindicator.devBuildIndicator.show();
                break;
            case _hotreloadertypes.HMR_ACTIONS_SENT_TO_BROWSER.BUILT:
            case _hotreloadertypes.HMR_ACTIONS_SENT_TO_BROWSER.SYNC:
                _devbuildindicator.devBuildIndicator.hide();
                break;
        }
    } catch (e) {}
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=handle-dev-build-indicator-hmr-events.js.map