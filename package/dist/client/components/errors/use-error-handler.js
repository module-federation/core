"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    handleClientError: null,
    handleConsoleError: null,
    handleGlobalErrors: null,
    useErrorHandler: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    handleClientError: function() {
        return handleClientError;
    },
    handleConsoleError: function() {
        return handleConsoleError;
    },
    handleGlobalErrors: function() {
        return handleGlobalErrors;
    },
    useErrorHandler: function() {
        return useErrorHandler;
    }
});
const _interop_require_default = require("@swc/helpers/_/_interop_require_default");
const _react = require("react");
const _attachhydrationerrorstate = require("./attach-hydration-error-state");
const _isnextroutererror = require("../is-next-router-error");
const _hydrationerrorinfo = require("./hydration-error-info");
const _console = require("../../lib/console");
const _iserror = /*#__PURE__*/ _interop_require_default._(require("../../../lib/is-error"));
const _consoleerror = require("./console-error");
const _enqueueclienterror = require("./enqueue-client-error");
const _stitchederror = require("../errors/stitched-error");
const queueMicroTask = globalThis.queueMicrotask || ((cb)=>Promise.resolve().then(cb));
const errorQueue = [];
const errorHandlers = [];
const rejectionQueue = [];
const rejectionHandlers = [];
function handleConsoleError(originError, consoleErrorArgs) {
    let error;
    const { environmentName } = (0, _console.parseConsoleArgs)(consoleErrorArgs);
    if ((0, _iserror.default)(originError)) {
        error = (0, _consoleerror.createConsoleError)(originError, environmentName);
    } else {
        error = (0, _consoleerror.createConsoleError)((0, _console.formatConsoleArgs)(consoleErrorArgs), environmentName);
    }
    error = (0, _stitchederror.getReactStitchedError)(error);
    (0, _hydrationerrorinfo.storeHydrationErrorStateFromConsoleArgs)(...consoleErrorArgs);
    (0, _attachhydrationerrorstate.attachHydrationErrorState)(error);
    (0, _enqueueclienterror.enqueueConsecutiveDedupedError)(errorQueue, error);
    for (const handler of errorHandlers){
        // Delayed the error being passed to React Dev Overlay,
        // avoid the state being synchronously updated in the component.
        queueMicroTask(()=>{
            handler(error);
        });
    }
}
function handleClientError(originError) {
    let error;
    if ((0, _iserror.default)(originError)) {
        error = originError;
    } else {
        // If it's not an error, format the args into an error
        const formattedErrorMessage = originError + '';
        error = Object.defineProperty(new Error(formattedErrorMessage), "__NEXT_ERROR_CODE", {
            value: "E394",
            enumerable: false,
            configurable: true
        });
    }
    error = (0, _stitchederror.getReactStitchedError)(error);
    (0, _attachhydrationerrorstate.attachHydrationErrorState)(error);
    (0, _enqueueclienterror.enqueueConsecutiveDedupedError)(errorQueue, error);
    for (const handler of errorHandlers){
        // Delayed the error being passed to React Dev Overlay,
        // avoid the state being synchronously updated in the component.
        queueMicroTask(()=>{
            handler(error);
        });
    }
}
function useErrorHandler(handleOnUnhandledError, handleOnUnhandledRejection) {
    (0, _react.useEffect)(()=>{
        // Handle queued errors.
        errorQueue.forEach(handleOnUnhandledError);
        rejectionQueue.forEach(handleOnUnhandledRejection);
        // Listen to new errors.
        errorHandlers.push(handleOnUnhandledError);
        rejectionHandlers.push(handleOnUnhandledRejection);
        return ()=>{
            // Remove listeners.
            errorHandlers.splice(errorHandlers.indexOf(handleOnUnhandledError), 1);
            rejectionHandlers.splice(rejectionHandlers.indexOf(handleOnUnhandledRejection), 1);
            // Reset error queues.
            errorQueue.splice(0, errorQueue.length);
            rejectionQueue.splice(0, rejectionQueue.length);
        };
    }, [
        handleOnUnhandledError,
        handleOnUnhandledRejection
    ]);
}
function onUnhandledError(event) {
    if ((0, _isnextroutererror.isNextRouterError)(event.error)) {
        event.preventDefault();
        return false;
    }
    // When there's an error property present, we log the error to error overlay.
    // Otherwise we don't do anything as it's not logging in the console either.
    if (event.error) {
        handleClientError(event.error);
    }
}
function onUnhandledRejection(ev) {
    const reason = ev == null ? void 0 : ev.reason;
    if ((0, _isnextroutererror.isNextRouterError)(reason)) {
        ev.preventDefault();
        return;
    }
    let error = reason;
    if (error && !(0, _iserror.default)(error)) {
        error = Object.defineProperty(new Error(error + ''), "__NEXT_ERROR_CODE", {
            value: "E394",
            enumerable: false,
            configurable: true
        });
    }
    rejectionQueue.push(error);
    for (const handler of rejectionHandlers){
        handler(error);
    }
}
function handleGlobalErrors() {
    if (typeof window !== 'undefined') {
        try {
            // Increase the number of stack frames on the client
            Error.stackTraceLimit = 50;
        } catch (e) {}
        window.addEventListener('error', onUnhandledError);
        window.addEventListener('unhandledrejection', onUnhandledRejection);
    }
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=use-error-handler.js.map