"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    Errors: null,
    styles: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    Errors: function() {
        return Errors;
    },
    styles: function() {
        return styles;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _react = require("react");
const _overlay = require("../components/overlay");
const _runtimeerror = require("./runtime-error");
const _errorsource = require("../../../../../shared/lib/error-source");
const _hotlinkedtext = require("../components/hot-linked-text");
const _componentstackpseudohtml = require("./runtime-error/component-stack-pseudo-html");
const _hydrationerrorinfo = require("../../../errors/hydration-error-info");
const _consoleerror = require("../../../errors/console-error");
const _errortelemetryutils = require("../../../../../lib/error-telemetry-utils");
const _erroroverlaylayout = require("../components/errors/error-overlay-layout/error-overlay-layout");
const _ishydrationerror = require("../../../is-hydration-error");
function isNextjsLink(text) {
    return text.startsWith('https://nextjs.org');
}
function ErrorDescription(param) {
    let { error, hydrationWarning } = param;
    const unhandledErrorType = (0, _consoleerror.isConsoleError)(error) ? (0, _consoleerror.getConsoleErrorType)(error) : null;
    const isConsoleErrorStringMessage = unhandledErrorType === 'string';
    // If the error is:
    // - hydration warning
    // - captured console error or unhandled rejection
    // skip displaying the error name
    const title = isConsoleErrorStringMessage || hydrationWarning ? '' : error.name + ': ';
    const environmentName = 'environmentName' in error ? error.environmentName : '';
    const envPrefix = environmentName ? "[ " + environmentName + " ] " : '';
    // The environment name will be displayed as a label, so remove it
    // from the message (e.g. "[ Server ] hello world" -> "hello world").
    let message = error.message;
    if (message.startsWith(envPrefix)) {
        message = message.slice(envPrefix.length);
    }
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
        children: [
            title,
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_hotlinkedtext.HotlinkedText, {
                text: hydrationWarning || message,
                matcher: isNextjsLink
            })
        ]
    });
}
function getErrorType(error) {
    if ((0, _consoleerror.isConsoleError)(error)) {
        return 'Console Error';
    }
    return 'Runtime Error';
}
function Errors(param) {
    let { runtimeErrors, debugInfo, onClose, ...props } = param;
    var _activeError_componentStackFrames;
    const dialogResizerRef = (0, _react.useRef)(null);
    (0, _react.useEffect)(()=>{
        // Close the error overlay when pressing escape
        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                onClose();
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return ()=>document.removeEventListener('keydown', handleKeyDown);
    }, [
        onClose
    ]);
    const isLoading = (0, _react.useMemo)(()=>{
        return runtimeErrors.length < 1;
    }, [
        runtimeErrors.length
    ]);
    const [activeIdx, setActiveIndex] = (0, _react.useState)(0);
    const activeError = (0, _react.useMemo)(()=>{
        var _runtimeErrors_activeIdx;
        return (_runtimeErrors_activeIdx = runtimeErrors[activeIdx]) != null ? _runtimeErrors_activeIdx : null;
    }, [
        activeIdx,
        runtimeErrors
    ]);
    if (isLoading) {
        // TODO: better loading state
        return /*#__PURE__*/ (0, _jsxruntime.jsx)(_overlay.Overlay, {});
    }
    if (!activeError) {
        return null;
    }
    const error = activeError.error;
    const isServerError = [
        'server',
        'edge-server'
    ].includes((0, _errorsource.getErrorSource)(error) || '');
    const errorType = getErrorType(error);
    const errorDetails = error.details || {};
    const notes = errorDetails.notes || '';
    const [warningTemplate, serverContent, clientContent] = errorDetails.warning || [
        null,
        '',
        ''
    ];
    const hydrationErrorType = (0, _hydrationerrorinfo.getHydrationWarningType)(warningTemplate);
    const hydrationWarning = warningTemplate ? warningTemplate.replace('%s', serverContent).replace('%s', clientContent).replace('%s', '') // remove the %s for stack
    .replace(/%s$/, '') // If there's still a %s at the end, remove it
    .replace(/^Warning: /, '').replace(/^Error: /, '') : null;
    const errorCode = (0, _errortelemetryutils.extractNextErrorCode)(error);
    const footerMessage = isServerError ? 'This error happened while generating the page. Any console logs will be displayed in the terminal window.' : undefined;
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)(_erroroverlaylayout.ErrorOverlayLayout, {
        errorCode: errorCode,
        errorType: errorType,
        errorMessage: /*#__PURE__*/ (0, _jsxruntime.jsx)(ErrorDescription, {
            error: error,
            hydrationWarning: hydrationWarning
        }),
        onClose: isServerError ? undefined : onClose,
        debugInfo: debugInfo,
        error: error,
        runtimeErrors: runtimeErrors,
        activeIdx: activeIdx,
        setActiveIndex: setActiveIndex,
        footerMessage: footerMessage,
        dialogResizerRef: dialogResizerRef,
        ...props,
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "error-overlay-notes-container",
                children: [
                    notes ? /*#__PURE__*/ (0, _jsxruntime.jsx)(_jsxruntime.Fragment, {
                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                            id: "nextjs__container_errors__notes",
                            className: "nextjs__container_errors__notes",
                            children: notes
                        })
                    }) : null,
                    hydrationWarning ? /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                        id: "nextjs__container_errors__link",
                        className: "nextjs__container_errors__link",
                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_hotlinkedtext.HotlinkedText, {
                            text: "See more info here: " + _ishydrationerror.NEXTJS_HYDRATION_ERROR_LINK
                        })
                    }) : null
                ]
            }),
            hydrationWarning && (((_activeError_componentStackFrames = activeError.componentStackFrames) == null ? void 0 : _activeError_componentStackFrames.length) || !!errorDetails.reactOutputComponentDiff) ? /*#__PURE__*/ (0, _jsxruntime.jsx)(_componentstackpseudohtml.PseudoHtmlDiff, {
                className: "nextjs__container_errors__component-stack",
                hydrationMismatchType: hydrationErrorType,
                firstContent: serverContent,
                secondContent: clientContent,
                reactOutputComponentDiff: errorDetails.reactOutputComponentDiff || ''
            }) : null,
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_react.Suspense, {
                fallback: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                    "data-nextjs-error-suspended": true
                }),
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_runtimeerror.RuntimeError, {
                    error: activeError,
                    dialogResizerRef: dialogResizerRef
                }, activeError.id.toString())
            })
        ]
    });
}
const styles = "\n  .nextjs-error-with-static {\n    bottom: calc(16px * 4.5);\n  }\n  p.nextjs__container_errors__link {\n    font-size: var(--size-14);\n  }\n  p.nextjs__container_errors__notes {\n    color: var(--color-stack-notes);\n    font-size: var(--size-14);\n    line-height: 1.5;\n  }\n  .nextjs-container-errors-body > h2:not(:first-child) {\n    margin-top: calc(16px + 8px);\n  }\n  .nextjs-container-errors-body > h2 {\n    color: var(--color-title-color);\n    margin-bottom: 8px;\n    font-size: var(--size-20);\n  }\n  .nextjs-toast-errors-parent {\n    cursor: pointer;\n    transition: transform 0.2s ease;\n  }\n  .nextjs-toast-errors-parent:hover {\n    transform: scale(1.1);\n  }\n  .nextjs-toast-errors {\n    display: flex;\n    align-items: center;\n    justify-content: flex-start;\n  }\n  .nextjs-toast-errors > svg {\n    margin-right: 8px;\n  }\n  .nextjs-toast-hide-button {\n    margin-left: 24px;\n    border: none;\n    background: none;\n    color: var(--color-ansi-bright-white);\n    padding: 0;\n    transition: opacity 0.25s ease;\n    opacity: 0.7;\n  }\n  .nextjs-toast-hide-button:hover {\n    opacity: 1;\n  }\n  .nextjs__container_errors_inspect_copy_button {\n    cursor: pointer;\n    background: none;\n    border: none;\n    color: var(--color-ansi-bright-white);\n    font-size: var(--size-24);\n    padding: 0;\n    margin: 0;\n    margin-left: 8px;\n    transition: opacity 0.25s ease;\n  }\n  .nextjs__container_errors__error_title {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    margin-bottom: 14px;\n  }\n  .error-overlay-notes-container {\n    margin: 8px 2px;\n  }\n  .error-overlay-notes-container p {\n    white-space: pre-wrap;\n  }\n";

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=errors.js.map