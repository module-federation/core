"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "attachHydrationErrorState", {
    enumerable: true,
    get: function() {
        return attachHydrationErrorState;
    }
});
const _ishydrationerror = require("../is-hydration-error");
const _hydrationerrorinfo = require("./hydration-error-info");
function attachHydrationErrorState(error) {
    let parsedHydrationErrorState = {};
    const isHydrationWarning = (0, _ishydrationerror.testReactHydrationWarning)(error.message);
    const isHydrationRuntimeError = (0, _ishydrationerror.isHydrationError)(error);
    // If it's not hydration warnings or errors, skip
    if (!(isHydrationRuntimeError || isHydrationWarning)) {
        return;
    }
    const reactHydrationDiffSegments = (0, _hydrationerrorinfo.getReactHydrationDiffSegments)(error.message);
    // If the reactHydrationDiffSegments exists
    // and the diff (reactHydrationDiffSegments[1]) exists
    // e.g. the hydration diff log error.
    if (reactHydrationDiffSegments) {
        const diff = reactHydrationDiffSegments[1];
        parsedHydrationErrorState = {
            ...error.details,
            ..._hydrationerrorinfo.hydrationErrorState,
            // If diff is present in error, we don't need to pick up the console logged warning.
            // - if hydration error has diff, and is not hydration diff log, then it's a normal hydration error.
            // - if hydration error no diff, then leverage the one from the hydration diff log.
            warning: (diff && !isHydrationWarning ? null : _hydrationerrorinfo.hydrationErrorState.warning) || [
                (0, _ishydrationerror.getDefaultHydrationErrorMessage)(),
                '',
                ''
            ],
            // When it's hydration diff log, do not show notes section.
            // This condition is only for the 1st squashed error.
            notes: isHydrationWarning ? '' : reactHydrationDiffSegments[0],
            reactOutputComponentDiff: diff
        };
        // Cache the `reactOutputComponentDiff` into hydrationErrorState.
        // This is only required for now when we still squashed the hydration diff log into hydration error.
        // Once the all error is logged to dev overlay in order, this will go away.
        if (!_hydrationerrorinfo.hydrationErrorState.reactOutputComponentDiff && diff) {
            _hydrationerrorinfo.hydrationErrorState.reactOutputComponentDiff = diff;
        }
        // If it's hydration runtime error that doesn't contain the diff, combine the diff from the cached hydration diff.
        if (!diff && isHydrationRuntimeError && _hydrationerrorinfo.hydrationErrorState.reactOutputComponentDiff) {
            parsedHydrationErrorState.reactOutputComponentDiff = _hydrationerrorinfo.hydrationErrorState.reactOutputComponentDiff;
        }
    } else {
        // Normal runtime error, where it doesn't contain the hydration diff.
        // If there's any extra information in the error message to display,
        // append it to the error message details property
        if (_hydrationerrorinfo.hydrationErrorState.warning) {
            // The patched console.error found hydration errors logged by React
            // Append the logged warning to the error message
            parsedHydrationErrorState = {
                ...error.details,
                // It contains the warning, component stack, server and client tag names
                ..._hydrationerrorinfo.hydrationErrorState
            };
        }
        // Consume the cached hydration diff.
        // This is only required for now when we still squashed the hydration diff log into hydration error.
        // Once the all error is logged to dev overlay in order, this will go away.
        if (_hydrationerrorinfo.hydrationErrorState.reactOutputComponentDiff) {
            parsedHydrationErrorState.reactOutputComponentDiff = _hydrationerrorinfo.hydrationErrorState.reactOutputComponentDiff;
        }
    }
    // If it's a hydration error, store the hydration error state into the error object
    ;
    error.details = parsedHydrationErrorState;
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=attach-hydration-error-state.js.map