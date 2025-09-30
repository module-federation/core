"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    DEV_TOOLS_INFO_STYLES: null,
    DevToolsInfo: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    DEV_TOOLS_INFO_STYLES: function() {
        return DEV_TOOLS_INFO_STYLES;
    },
    DevToolsInfo: function() {
        return DevToolsInfo;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _react = require("react");
const _utils = require("../utils");
const _usedelayedrender = require("../../../../hooks/use-delayed-render");
function DevToolsInfo(param) {
    let { title, children, learnMoreLink, isOpen, triggerRef, close, ...props } = param;
    const ref = (0, _react.useRef)(null);
    const closeButtonRef = (0, _react.useRef)(null);
    const { mounted, rendered } = (0, _usedelayedrender.useDelayedRender)(isOpen, {
        // Intentionally no fade in, makes the UI feel more immediate
        enterDelay: 0,
        // Graceful fade out to confirm that the UI did not break
        exitDelay: _utils.MENU_DURATION_MS
    });
    (0, _utils.useFocusTrap)(ref, triggerRef, isOpen, ()=>{
        var // Bring focus to close button, so the user can easily close the overlay
        _closeButtonRef_current;
        (_closeButtonRef_current = closeButtonRef.current) == null ? void 0 : _closeButtonRef_current.focus();
    });
    (0, _utils.useClickOutside)(ref, triggerRef, isOpen, close);
    if (!mounted) {
        return null;
    }
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
        tabIndex: -1,
        role: "dialog",
        ref: ref,
        "data-info-popover": true,
        ...props,
        "data-rendered": rendered,
        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            className: "dev-tools-info-container",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsx)("h1", {
                    className: "dev-tools-info-title",
                    children: title
                }),
                children,
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "dev-tools-info-button-container",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            ref: closeButtonRef,
                            className: "dev-tools-info-close-button",
                            onClick: close,
                            children: "Close"
                        }),
                        learnMoreLink && /*#__PURE__*/ (0, _jsxruntime.jsx)("a", {
                            className: "dev-tools-info-learn-more-button",
                            href: learnMoreLink,
                            target: "_blank",
                            rel: "noreferrer noopener",
                            children: "Learn More"
                        })
                    ]
                })
            ]
        })
    });
}
const DEV_TOOLS_INFO_STYLES = "\n  [data-info-popover] {\n    -webkit-font-smoothing: antialiased;\n    display: flex;\n    flex-direction: column;\n    align-items: flex-start;\n    background: var(--color-background-100);\n    border: 1px solid var(--color-gray-alpha-400);\n    background-clip: padding-box;\n    box-shadow: var(--shadow-menu);\n    border-radius: var(--rounded-xl);\n    position: absolute;\n    font-family: var(--font-stack-sans);\n    z-index: 1000;\n    overflow: hidden;\n    opacity: 0;\n    outline: 0;\n    min-width: 350px;\n    transition: opacity var(--animate-out-duration-ms)\n      var(--animate-out-timing-function);\n\n    &[data-rendered='true'] {\n      opacity: 1;\n      scale: 1;\n    }\n\n    button:focus-visible {\n      outline: var(--focus-ring);\n    }\n  }\n\n  .dev-tools-info-container {\n    padding: 12px;\n  }\n\n  .dev-tools-info-title {\n    padding: 8px 6px;\n    color: var(--color-gray-1000);\n    font-size: var(--size-16);\n    font-weight: 600;\n    line-height: var(--size-20);\n    margin: 0;\n  }\n\n  .dev-tools-info-article {\n    padding: 8px 6px;\n    color: var(--color-gray-1000);\n    font-size: var(--size-14);\n    line-height: var(--size-20);\n    margin: 0;\n  }\n  .dev-tools-info-paragraph {\n    &:last-child {\n      margin-bottom: 0;\n    }\n  }\n\n  .dev-tools-info-button-container {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    padding: 8px 6px;\n  }\n\n  .dev-tools-info-close-button {\n    padding: 0 8px;\n    height: var(--size-28);\n    font-size: var(--size-14);\n    font-weight: 500;\n    line-height: var(--size-20);\n    transition: background var(--duration-short) ease;\n    color: var(--color-gray-1000);\n    border-radius: var(--rounded-md-2);\n    border: 1px solid var(--color-gray-alpha-400);\n    background: var(--color-background-200);\n  }\n\n  .dev-tools-info-close-button:hover {\n    background: var(--color-gray-400);\n  }\n\n  .dev-tools-info-learn-more-button {\n    align-content: center;\n    padding: 0 8px;\n    height: var(--size-28);\n    font-size: var(--size-14);\n    font-weight: 500;\n    line-height: var(--size-20);\n    transition: background var(--duration-short) ease;\n    color: var(--color-background-100);\n    border-radius: var(--rounded-md-2);\n    background: var(--color-gray-1000);\n  }\n\n  .dev-tools-info-learn-more-button:hover {\n    text-decoration: none;\n    color: var(--color-background-100);\n    opacity: 0.9;\n  }\n";

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=dev-tools-info.js.map