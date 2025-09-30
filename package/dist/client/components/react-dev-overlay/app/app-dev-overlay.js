"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AppDevOverlay", {
    enumerable: true,
    get: function() {
        return AppDevOverlay;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _react = require("react");
const _appdevoverlayerrorboundary = require("./app-dev-overlay-error-boundary");
const _fontstyles = require("../font/font-styles");
const _devoverlay = require("../ui/dev-overlay");
const _useerrorhandler = require("../../errors/use-error-handler");
const _isnextroutererror = require("../../is-next-router-error");
const _constants = require("../../../../shared/lib/errors/constants");
function readSsrError() {
    if (typeof document === 'undefined') {
        return null;
    }
    const ssrErrorTemplateTag = document.querySelector('template[data-next-error-message]');
    if (ssrErrorTemplateTag) {
        const message = ssrErrorTemplateTag.getAttribute('data-next-error-message');
        const stack = ssrErrorTemplateTag.getAttribute('data-next-error-stack');
        const digest = ssrErrorTemplateTag.getAttribute('data-next-error-digest');
        const error = Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
            value: "E394",
            enumerable: false,
            configurable: true
        });
        if (digest) {
            ;
            error.digest = digest;
        }
        // Skip Next.js SSR'd internal errors that which will be handled by the error boundaries.
        if ((0, _isnextroutererror.isNextRouterError)(error)) {
            return null;
        }
        error.stack = stack || '';
        return error;
    }
    return null;
}
// Needs to be in the same error boundary as the shell.
// If it commits, we know we recovered from an SSR error.
// If it doesn't commit, we errored again and React will take care of error reporting.
function ReplaySsrOnlyErrors(param) {
    let { onBlockingError } = param;
    if (process.env.NODE_ENV !== 'production') {
        // Need to read during render. The attributes will be gone after commit.
        const ssrError = readSsrError();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        (0, _react.useEffect)(()=>{
            if (ssrError !== null) {
                // TODO(veil): Produces wrong Owner Stack
                // TODO(veil): Mark as recoverable error
                // TODO(veil): console.error
                (0, _useerrorhandler.handleClientError)(ssrError);
                // If it's missing root tags, we can't recover, make it blocking.
                if (ssrError.digest === _constants.MISSING_ROOT_TAGS_ERROR) {
                    onBlockingError();
                }
            }
        }, [
            ssrError,
            onBlockingError
        ]);
    }
    return null;
}
function AppDevOverlay(param) {
    let { state, globalError, children } = param;
    const [isErrorOverlayOpen, setIsErrorOverlayOpen] = (0, _react.useState)(false);
    const openOverlay = (0, _react.useCallback)(()=>{
        setIsErrorOverlayOpen(true);
    }, []);
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)(_appdevoverlayerrorboundary.AppDevOverlayErrorBoundary, {
                globalError: globalError,
                onError: setIsErrorOverlayOpen,
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)(ReplaySsrOnlyErrors, {
                        onBlockingError: openOverlay
                    }),
                    children
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_fontstyles.FontStyles, {}),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_devoverlay.DevOverlay, {
                        state: state,
                        isErrorOverlayOpen: isErrorOverlayOpen,
                        setIsErrorOverlayOpen: setIsErrorOverlayOpen
                    })
                ]
            })
        ]
    });
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=app-dev-overlay.js.map