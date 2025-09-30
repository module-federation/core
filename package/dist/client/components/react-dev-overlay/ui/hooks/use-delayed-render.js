"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "useDelayedRender", {
    enumerable: true,
    get: function() {
        return useDelayedRender;
    }
});
const _react = require("react");
function useDelayedRender(active, options) {
    if (active === void 0) active = false;
    if (options === void 0) options = {};
    const [mounted, setMounted] = (0, _react.useState)(active);
    const [rendered, setRendered] = (0, _react.useState)(false);
    const renderTimerRef = (0, _react.useRef)(null);
    const unmountTimerRef = (0, _react.useRef)(null);
    const clearTimers = (0, _react.useCallback)(()=>{
        if (renderTimerRef.current !== null) {
            window.clearTimeout(renderTimerRef.current);
            renderTimerRef.current = null;
        }
        if (unmountTimerRef.current !== null) {
            window.clearTimeout(unmountTimerRef.current);
            unmountTimerRef.current = null;
        }
    }, []);
    (0, _react.useEffect)(()=>{
        const { enterDelay = 1, exitDelay = 0 } = options;
        clearTimers();
        if (active) {
            setMounted(true);
            if (enterDelay <= 0) {
                setRendered(true);
            } else {
                renderTimerRef.current = window.setTimeout(()=>{
                    setRendered(true);
                }, enterDelay);
            }
        } else {
            setRendered(false);
            if (exitDelay <= 0) {
                setMounted(false);
            } else {
                unmountTimerRef.current = window.setTimeout(()=>{
                    setMounted(false);
                }, exitDelay);
            }
        }
        return clearTimers;
    }, [
        active,
        options,
        clearTimers
    ]);
    return {
        mounted,
        rendered
    };
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=use-delayed-render.js.map