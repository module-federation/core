"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "durationToString", {
    enumerable: true,
    get: function() {
        return durationToString;
    }
});
function durationToString(compilerDuration) {
    let durationString;
    if (compilerDuration > 120) {
        durationString = `${(compilerDuration / 60).toFixed(1)}min`;
    } else if (compilerDuration > 40) {
        durationString = `${compilerDuration.toFixed(0)}s`;
    } else if (compilerDuration > 2) {
        durationString = `${compilerDuration.toFixed(1)}s`;
    } else {
        durationString = `${(compilerDuration * 1000).toFixed(0)}ms`;
    }
    return durationString;
}

//# sourceMappingURL=duration-to-string.js.map