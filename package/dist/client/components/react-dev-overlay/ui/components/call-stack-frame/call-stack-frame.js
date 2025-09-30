"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    CALL_STACK_FRAME_STYLES: null,
    CallStackFrame: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    CALL_STACK_FRAME_STYLES: function() {
        return CALL_STACK_FRAME_STYLES;
    },
    CallStackFrame: function() {
        return CallStackFrame;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _hotlinkedtext = require("../hot-linked-text");
const _external = require("../../icons/external");
const _stackframe = require("../../../utils/stack-frame");
const _useopenineditor = require("../../utils/use-open-in-editor");
const CallStackFrame = function CallStackFrame(param) {
    let { frame } = param;
    var _frame_originalStackFrame;
    // TODO: ability to expand resolved frames
    const f = (_frame_originalStackFrame = frame.originalStackFrame) != null ? _frame_originalStackFrame : frame.sourceStackFrame;
    const hasSource = Boolean(frame.originalCodeFrame);
    const open = (0, _useopenineditor.useOpenInEditor)(hasSource ? {
        file: f.file,
        lineNumber: f.lineNumber,
        column: f.column
    } : undefined);
    // Format method to strip out the webpack layer prefix.
    // e.g. (app-pages-browser)/./app/page.tsx -> ./app/page.tsx
    const formattedMethod = f.methodName.replace(/^\([\w-]+\)\//, '');
    // Formatted file source could be empty. e.g. <anonymous> will be formatted to empty string,
    // we'll skip rendering the frame in this case.
    const fileSource = (0, _stackframe.getFrameSource)(f);
    if (!fileSource) {
        return null;
    }
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        "data-nextjs-call-stack-frame": true,
        "data-nextjs-call-stack-frame-no-source": !hasSource,
        "data-nextjs-call-stack-frame-ignored": frame.ignored,
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "call-stack-frame-method-name",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_hotlinkedtext.HotlinkedText, {
                        text: formattedMethod
                    }),
                    hasSource && /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                        onClick: open,
                        className: "open-in-editor-button",
                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_external.ExternalIcon, {
                            width: 16,
                            height: 16
                        })
                    }),
                    frame.error ? /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                        className: "source-mapping-error-button",
                        onClick: ()=>console.error(frame.reason),
                        title: "Sourcemapping failed. Click to log cause of error.",
                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_external.SourceMappingErrorIcon, {
                            width: 16,
                            height: 16
                        })
                    }) : null
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                className: "call-stack-frame-file-source",
                "data-has-source": hasSource,
                children: fileSource
            })
        ]
    });
};
const CALL_STACK_FRAME_STYLES = '\n  [data-nextjs-call-stack-frame-no-source] {\n    padding: 6px 8px;\n    margin-bottom: 4px;\n\n    border-radius: var(--rounded-lg);\n  }\n\n  [data-nextjs-call-stack-frame-no-source]:last-child {\n    margin-bottom: 0;\n  }\n\n  [data-nextjs-call-stack-frame-ignored="true"] {\n    opacity: 0.6;\n  }\n\n  [data-nextjs-call-stack-frame] {\n    user-select: text;\n    display: block;\n    box-sizing: border-box;\n\n    user-select: text;\n    -webkit-user-select: text;\n    -moz-user-select: text;\n    -ms-user-select: text;\n\n    padding: 6px 8px;\n\n    border-radius: var(--rounded-lg);\n  }\n\n  .call-stack-frame-method-name {\n    display: flex;\n    align-items: center;\n    gap: 4px;\n\n    margin-bottom: 4px;\n    font-family: var(--font-stack-monospace);\n\n    color: var(--color-gray-1000);\n    font-size: var(--size-14);\n    font-weight: 500;\n    line-height: var(--size-20);\n\n    svg {\n      width: var(--size-16px);\n      height: var(--size-16px);\n    }\n  }\n\n  .open-in-editor-button, .source-mapping-error-button {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    border-radius: var(--rounded-full);\n    padding: 4px;\n    color: var(--color-font);\n\n    svg {\n      width: var(--size-16);\n      height: var(--size-16);\n    }\n\n    &:focus-visible {\n      outline: var(--focus-ring);\n      outline-offset: -2px;\n    }\n\n    &:hover {\n      background: var(--color-gray-100);\n    }\n  }\n\n  .call-stack-frame-file-source {\n    color: var(--color-gray-900);\n    font-size: var(--size-14);\n    line-height: var(--size-20);\n  }\n';

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=call-stack-frame.js.map