"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    RuntimeError: null,
    styles: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    RuntimeError: function() {
        return RuntimeError;
    },
    styles: function() {
        return styles;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _react = require("react");
const _codeframe = require("../../components/code-frame/code-frame");
const _callstack = require("../../components/errors/call-stack/call-stack");
const _componentstackpseudohtml = require("./component-stack-pseudo-html");
const _geterrorbytype = require("../../../utils/get-error-by-type");
function RuntimeError(param) {
    let { error, dialogResizerRef } = param;
    const frames = (0, _geterrorbytype.useFrames)(error);
    const firstFrame = (0, _react.useMemo)(()=>{
        const firstFirstPartyFrameIndex = frames.findIndex((entry)=>!entry.ignored && Boolean(entry.originalCodeFrame) && Boolean(entry.originalStackFrame));
        var _frames_firstFirstPartyFrameIndex;
        return (_frames_firstFirstPartyFrameIndex = frames[firstFirstPartyFrameIndex]) != null ? _frames_firstFirstPartyFrameIndex : null;
    }, [
        frames
    ]);
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
        children: [
            firstFrame && /*#__PURE__*/ (0, _jsxruntime.jsx)(_codeframe.CodeFrame, {
                stackFrame: firstFrame.originalStackFrame,
                codeFrame: firstFrame.originalCodeFrame
            }),
            frames.length > 0 && /*#__PURE__*/ (0, _jsxruntime.jsx)(_callstack.CallStack, {
                dialogResizerRef: dialogResizerRef,
                frames: frames
            })
        ]
    });
}
const styles = "\n  " + _componentstackpseudohtml.PSEUDO_HTML_DIFF_STYLES + "\n";

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=index.js.map