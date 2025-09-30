"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "useMinimumLoadingTimeMultiple", {
    enumerable: true,
    get: function() {
        return useMinimumLoadingTimeMultiple;
    }
});
const _react = require("react");
function useMinimumLoadingTimeMultiple(isLoadingTrigger, interval) {
    if (interval === void 0) interval = 750;
    const [isLoading, setIsLoading] = (0, _react.useState)(false);
    const loadStartTimeRef = (0, _react.useRef)(null);
    const timeoutIdRef = (0, _react.useRef)(null);
    (0, _react.useEffect)(()=>{
        // Clear any pending timeout to avoid overlap
        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
            timeoutIdRef.current = null;
        }
        if (isLoadingTrigger) {
            // If we enter "loading" state, record start time if not already
            if (loadStartTimeRef.current === null) {
                loadStartTimeRef.current = Date.now();
            }
            setIsLoading(true);
        } else {
            // If we're exiting the "loading" state:
            if (loadStartTimeRef.current === null) {
                // No start time was recorded, so just stop loading immediately
                setIsLoading(false);
            } else {
                // How long we've been "loading"
                const timeDiff = Date.now() - loadStartTimeRef.current;
                // Next multiple of `interval` after `timeDiff`
                const nextMultiple = interval * Math.ceil(timeDiff / interval);
                // Remaining time needed to reach that multiple
                const remainingTime = nextMultiple - timeDiff;
                if (remainingTime > 0) {
                    // If not yet at that multiple, schedule the final step
                    timeoutIdRef.current = setTimeout(()=>{
                        setIsLoading(false);
                        loadStartTimeRef.current = null;
                    }, remainingTime);
                } else {
                    // We're already past the multiple boundary
                    setIsLoading(false);
                    loadStartTimeRef.current = null;
                }
            }
        }
        // Cleanup when effect is about to re-run or component unmounts
        return ()=>{
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
            }
        };
    }, [
        isLoadingTrigger,
        interval
    ]);
    return isLoading;
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=use-minimum-loading-time-multiple.js.map