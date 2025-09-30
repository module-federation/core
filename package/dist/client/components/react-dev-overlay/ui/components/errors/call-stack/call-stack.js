"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    CALL_STACK_STYLES: null,
    CallStack: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    CALL_STACK_STYLES: function() {
        return CALL_STACK_STYLES;
    },
    CallStack: function() {
        return CallStack;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _react = require("react");
const _callstackframe = require("../../call-stack-frame/call-stack-frame");
function CallStack(param) {
    let { frames, dialogResizerRef } = param;
    const initialDialogHeight = (0, _react.useRef)(NaN);
    const [isIgnoreListOpen, setIsIgnoreListOpen] = (0, _react.useState)(false);
    const ignoredFramesTally = (0, _react.useMemo)(()=>{
        return frames.reduce((tally, frame)=>tally + (frame.ignored ? 1 : 0), 0);
    }, [
        frames
    ]);
    function onToggleIgnoreList() {
        const dialog = dialogResizerRef == null ? void 0 : dialogResizerRef.current;
        if (!dialog) {
            return;
        }
        const { height: currentHeight } = dialog == null ? void 0 : dialog.getBoundingClientRect();
        if (!initialDialogHeight.current) {
            initialDialogHeight.current = currentHeight;
        }
        if (isIgnoreListOpen) {
            function onTransitionEnd() {
                dialog.removeEventListener('transitionend', onTransitionEnd);
                setIsIgnoreListOpen(false);
            }
            dialog.style.height = "" + initialDialogHeight.current + "px";
            dialog.addEventListener('transitionend', onTransitionEnd);
        } else {
            setIsIgnoreListOpen(true);
        }
    }
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "error-overlay-call-stack-container",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "error-overlay-call-stack-header",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("p", {
                        className: "error-overlay-call-stack-title",
                        children: [
                            "Call Stack",
                            ' ',
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "error-overlay-call-stack-count",
                                children: frames.length
                            })
                        ]
                    }),
                    ignoredFramesTally > 0 && /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                        "data-expand-ignore-button": isIgnoreListOpen,
                        className: "error-overlay-call-stack-ignored-list-toggle-button",
                        onClick: onToggleIgnoreList,
                        children: [
                            (isIgnoreListOpen ? 'Hide' : 'Show') + " " + ignoredFramesTally + " ignore-listed frame(s)",
                            /*#__PURE__*/ (0, _jsxruntime.jsx)(ChevronUpDown, {})
                        ]
                    })
                ]
            }),
            frames.map((frame, frameIndex)=>{
                return !frame.ignored || isIgnoreListOpen ? /*#__PURE__*/ (0, _jsxruntime.jsx)(_callstackframe.CallStackFrame, {
                    frame: frame
                }, frameIndex) : null;
            })
        ]
    });
}
function ChevronUpDown() {
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("svg", {
        width: "16",
        height: "16",
        viewBox: "0 0 16 16",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
            fillRule: "evenodd",
            clipRule: "evenodd",
            d: "M8.70722 2.39641C8.3167 2.00588 7.68353 2.00588 7.29301 2.39641L4.46978 5.21963L3.93945 5.74996L5.00011 6.81062L5.53044 6.28029L8.00011 3.81062L10.4698 6.28029L11.0001 6.81062L12.0608 5.74996L11.5304 5.21963L8.70722 2.39641ZM5.53044 9.71963L5.00011 9.1893L3.93945 10.25L4.46978 10.7803L7.29301 13.6035C7.68353 13.994 8.3167 13.994 8.70722 13.6035L11.5304 10.7803L12.0608 10.25L11.0001 9.1893L10.4698 9.71963L8.00011 12.1893L5.53044 9.71963Z",
            fill: "currentColor"
        })
    });
}
const CALL_STACK_STYLES = "\n  .error-overlay-call-stack-container {\n    position: relative;\n    margin-top: 8px;\n  }\n\n  .error-overlay-call-stack-header {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    min-height: var(--size-28);\n    padding: 8px 8px 12px 4px;\n    width: 100%;\n  }\n\n  .error-overlay-call-stack-title {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    gap: 8px;\n\n    margin: 0;\n\n    color: var(--color-gray-1000);\n    font-size: var(--size-16);\n    font-weight: 500;\n  }\n\n  .error-overlay-call-stack-count {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n\n    width: var(--size-20);\n    height: var(--size-20);\n    gap: 4px;\n\n    color: var(--color-gray-1000);\n    text-align: center;\n    font-size: var(--size-11);\n    font-weight: 500;\n    line-height: var(--size-16);\n\n    border-radius: var(--rounded-full);\n    background: var(--color-gray-300);\n  }\n\n  .error-overlay-call-stack-ignored-list-toggle-button {\n    all: unset;\n    display: flex;\n    align-items: center;\n    gap: 6px;\n    color: var(--color-gray-900);\n    font-size: var(--size-14);\n    line-height: var(--size-20);\n    border-radius: 6px;\n    padding: 4px 6px;\n    margin-right: -6px;\n    transition: background 150ms ease;\n\n    &:hover {\n      background: var(--color-gray-100);\n    }\n\n    &:focus {\n      outline: var(--focus-ring);\n    }\n\n    svg {\n      width: var(--size-16);\n      height: var(--size-16);\n    }\n  }\n";

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=call-stack.js.map