"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "useMeasureHeight", {
    enumerable: true,
    get: function() {
        return useMeasureHeight;
    }
});
const _react = require("react");
function useMeasureHeight(ref) {
    const [pristine, setPristine] = (0, _react.useState)(true);
    const [height, setHeight] = (0, _react.useState)(0);
    (0, _react.useEffect)(()=>{
        const el = ref.current;
        if (!el) {
            return;
        }
        const observer = new ResizeObserver(()=>{
            const { height: h } = el.getBoundingClientRect();
            setHeight((prevHeight)=>{
                if (prevHeight !== 0) {
                    setPristine(false);
                }
                return h;
            });
        });
        observer.observe(el);
        return ()=>{
            observer.disconnect();
            setPristine(true);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return [
        height,
        pristine
    ];
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=use-measure-height.js.map