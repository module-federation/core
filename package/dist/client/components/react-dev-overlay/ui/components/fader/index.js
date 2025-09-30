"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    FADER_STYLES: null,
    Fader: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    FADER_STYLES: function() {
        return FADER_STYLES;
    },
    Fader: function() {
        return Fader;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _react = require("react");
const Fader = /*#__PURE__*/ (0, _react.forwardRef)(function Fader(param, ref) {
    let { stop, blur, side, style, height } = param;
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
        ref: ref,
        "aria-hidden": true,
        "data-nextjs-scroll-fader": true,
        className: "nextjs-scroll-fader",
        "data-side": side,
        style: {
            '--stop': stop,
            '--blur': blur,
            '--height': "" + height + "px",
            ...style
        }
    });
});
const FADER_STYLES = '\n  .nextjs-scroll-fader {\n    --blur: 1px;\n    --stop: 25%;\n    --height: 150px;\n    --color-bg: var(--color-background-100);\n    position: absolute;\n    pointer-events: none;\n    user-select: none;\n    width: 100%;\n    height: var(--height);\n    left: 0;\n    backdrop-filter: blur(var(--blur));\n\n    &[data-side="top"] {\n      top: 0;\n      background: linear-gradient(to top, transparent, var(--color-bg));\n      mask-image: linear-gradient(to bottom, var(--color-bg) var(--stop), transparent);\n    }\n  }\n\n';

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=index.js.map