"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    ErrorOverlayLayout: null,
    styles: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    ErrorOverlayLayout: function() {
        return ErrorOverlayLayout;
    },
    styles: function() {
        return styles;
    }
});
const _interop_require_wildcard = require("@swc/helpers/_/_interop_require_wildcard");
const _jsxruntime = require("react/jsx-runtime");
const _react = /*#__PURE__*/ _interop_require_wildcard._(require("react"));
const _dialog = require("../../dialog");
const _erroroverlaytoolbar = require("../error-overlay-toolbar/error-overlay-toolbar");
const _erroroverlayfooter = require("../error-overlay-footer/error-overlay-footer");
const _errormessage = require("../error-message/error-message");
const _errortypelabel = require("../error-type-label/error-type-label");
const _erroroverlaynav = require("../error-overlay-nav/error-overlay-nav");
const _dialog1 = require("../dialog/dialog");
const _header = require("../dialog/header");
const _body = require("../dialog/body");
const _callstack = require("../call-stack/call-stack");
const _overlay = require("../overlay/overlay");
const _erroroverlaybottomstack = require("../error-overlay-bottom-stack");
const _environmentnamelabel = require("../environment-name-label/environment-name-label");
const _utils = require("../dev-tools-indicator/utils");
const _fader = require("../../fader");
function ErrorOverlayLayout(param) {
    let { errorMessage, errorType, children, errorCode, error, debugInfo, isBuildError, onClose, versionInfo, runtimeErrors, activeIdx, setActiveIndex, footerMessage, isTurbopack, dialogResizerRef, // This prop is used to animate the dialog, it comes from a parent component (<ErrorOverlay>)
    // If it's not being passed, we should just render the component as it is being
    // used without the context of a parent component that controls its state (e.g. Storybook).
    rendered = true, transitionDurationMs } = param;
    const animationProps = {
        'data-rendered': rendered,
        style: {
            '--transition-duration': "" + transitionDurationMs + "ms"
        }
    };
    const faderRef = _react.useRef(null);
    const hasFooter = Boolean(footerMessage || errorCode);
    const dialogRef = _react.useRef(null);
    (0, _utils.useFocusTrap)(dialogRef, null, rendered);
    function onScroll(e) {
        if (faderRef.current) {
            const opacity = clamp(e.currentTarget.scrollTop / 17, [
                0,
                1
            ]);
            faderRef.current.style.opacity = String(opacity);
        }
    }
    var _runtimeErrors_length;
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_overlay.ErrorOverlayOverlay, {
        fixed: isBuildError,
        ...animationProps,
        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            "data-nextjs-dialog-root": true,
            ref: dialogRef,
            ...animationProps,
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsx)(_erroroverlaynav.ErrorOverlayNav, {
                    runtimeErrors: runtimeErrors,
                    activeIdx: activeIdx,
                    setActiveIndex: setActiveIndex,
                    versionInfo: versionInfo,
                    isTurbopack: isTurbopack
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)(_dialog1.ErrorOverlayDialog, {
                    onClose: onClose,
                    dialogResizerRef: dialogResizerRef,
                    "data-has-footer": hasFooter,
                    onScroll: onScroll,
                    footer: hasFooter && /*#__PURE__*/ (0, _jsxruntime.jsx)(_erroroverlayfooter.ErrorOverlayFooter, {
                        footerMessage: footerMessage,
                        errorCode: errorCode
                    }),
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)(_dialog.DialogContent, {
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)(_header.ErrorOverlayDialogHeader, {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "nextjs__container_errors__error_title",
                                            // allow assertion in tests before error rating is implemented
                                            "data-nextjs-error-code": errorCode,
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    "data-nextjs-error-label-group": true,
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)(_errortypelabel.ErrorTypeLabel, {
                                                            errorType: errorType
                                                        }),
                                                        error.environmentName && /*#__PURE__*/ (0, _jsxruntime.jsx)(_environmentnamelabel.EnvironmentNameLabel, {
                                                            environmentName: error.environmentName
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)(_erroroverlaytoolbar.ErrorOverlayToolbar, {
                                                    error: error,
                                                    debugInfo: debugInfo
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)(_errormessage.ErrorMessage, {
                                            errorMessage: errorMessage
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)(_body.ErrorOverlayDialogBody, {
                                    children: children
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)(_erroroverlaybottomstack.ErrorOverlayBottomStack, {
                            errorCount: (_runtimeErrors_length = runtimeErrors == null ? void 0 : runtimeErrors.length) != null ? _runtimeErrors_length : 0,
                            activeIdx: activeIdx != null ? activeIdx : 0
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsx)(_fader.Fader, {
                    ref: faderRef,
                    side: "top",
                    stop: "50%",
                    blur: "4px",
                    height: 48
                })
            ]
        })
    });
}
function clamp(value, param) {
    let [min, max] = param;
    return Math.min(Math.max(value, min), max);
}
const styles = "\n  " + _overlay.OVERLAY_STYLES + "\n  " + _dialog1.DIALOG_STYLES + "\n  " + _header.DIALOG_HEADER_STYLES + "\n  " + _body.DIALOG_BODY_STYLES + "\n\n  " + _erroroverlaynav.styles + "\n  " + _errortypelabel.styles + "\n  " + _errormessage.styles + "\n  " + _erroroverlaytoolbar.styles + "\n  " + _callstack.CALL_STACK_STYLES + "\n\n  [data-nextjs-error-label-group] {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n  }\n";

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=error-overlay-layout.js.map