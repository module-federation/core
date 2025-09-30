/*
 * Singleton store to track whether the app is currently being rendered
 * Used by the dev tools indicator to show render status
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    devRenderIndicator: null,
    useIsDevRendering: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    devRenderIndicator: function() {
        return devRenderIndicator;
    },
    useIsDevRendering: function() {
        return useIsDevRendering;
    }
});
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
const show = ()=>{
    isVisible = true;
    listeners.forEach((listener)=>listener());
};
const hide = ()=>{
    isVisible = false;
    listeners.forEach((listener)=>listener());
};
function useIsDevRendering() {
    return (0, _react.useSyncExternalStore)(subscribe, getSnapshot);
}
const devRenderIndicator = {
    show,
    hide
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=dev-render-indicator.js.map