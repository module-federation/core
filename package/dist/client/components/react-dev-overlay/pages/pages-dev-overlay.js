"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PagesDevOverlay", {
    enumerable: true,
    get: function() {
        return PagesDevOverlay;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _react = require("react");
const _pagesdevoverlayerrorboundary = require("./pages-dev-overlay-error-boundary");
const _hooks = require("./hooks");
const _fontstyles = require("../font/font-styles");
const _devoverlay = require("../ui/dev-overlay");
function PagesDevOverlay(param) {
    let { children } = param;
    const { state, onComponentError } = (0, _hooks.usePagesDevOverlay)();
    const [isErrorOverlayOpen, setIsErrorOverlayOpen] = (0, _react.useState)(true);
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_pagesdevoverlayerrorboundary.PagesDevOverlayErrorBoundary, {
                onError: onComponentError,
                children: children != null ? children : null
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_fontstyles.FontStyles, {}),
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_devoverlay.DevOverlay, {
                state: state,
                isErrorOverlayOpen: isErrorOverlayOpen,
                setIsErrorOverlayOpen: setIsErrorOverlayOpen
            })
        ]
    });
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=pages-dev-overlay.js.map