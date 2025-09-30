/*
 * Singleton store to track whether the app is currently being built
 * Used by the dev tools indicator of the new overlay to show build status
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    initialize: null,
    useIsDevBuilding: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    initialize: function() {
        return initialize;
    },
    useIsDevBuilding: function() {
        return useIsDevBuilding;
    }
});
const _devbuildindicator = require("./dev-build-indicator");
const _react = require("react");
let isVisible = false;
let listeners = [];
const subscribe = (listener)=>{
    listeners.push(listener);
    return ()=>{
        listeners = listeners.filter((l)=>l !== listener);
    };
};
const getSnapshot = ()=>isVisible;
function useIsDevBuilding() {
    return (0, _react.useSyncExternalStore)(subscribe, getSnapshot);
}
function initialize() {
    _devbuildindicator.devBuildIndicator.show = ()=>{
        isVisible = true;
        listeners.forEach((listener)=>listener());
    };
    _devbuildindicator.devBuildIndicator.hide = ()=>{
        isVisible = false;
        listeners.forEach((listener)=>listener());
    };
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=initialize.js.map