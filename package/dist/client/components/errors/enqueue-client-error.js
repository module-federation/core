// Dedupe the two consecutive errors: If the previous one is same as current one, ignore the current one.
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "enqueueConsecutiveDedupedError", {
    enumerable: true,
    get: function() {
        return enqueueConsecutiveDedupedError;
    }
});
function enqueueConsecutiveDedupedError(queue, error) {
    const previousError = queue[queue.length - 1];
    // Compare the error stack to dedupe the consecutive errors
    if (previousError && previousError.stack === error.stack) {
        return;
    }
    queue.push(error);
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=enqueue-client-error.js.map