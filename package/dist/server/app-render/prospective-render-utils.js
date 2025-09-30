"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "printDebugThrownValueForProspectiveRender", {
    enumerable: true,
    get: function() {
        return printDebugThrownValueForProspectiveRender;
    }
});
const _createerrorhandler = require("./create-error-handler");
function printDebugThrownValueForProspectiveRender(thrownValue, route) {
    // We don't need to print well-known Next.js errors.
    if ((0, _createerrorhandler.getDigestForWellKnownError)(thrownValue)) {
        return;
    }
    let message;
    if (typeof thrownValue === 'object' && thrownValue !== null && typeof thrownValue.message === 'string') {
        message = thrownValue.message;
        if (typeof thrownValue.stack === 'string') {
            const originalErrorStack = thrownValue.stack;
            const stackStart = originalErrorStack.indexOf('\n');
            if (stackStart > -1) {
                const error = Object.defineProperty(new Error(`Route ${route} errored during the prospective render. These errors are normally ignored and may not prevent the route from prerendering but are logged here because build debugging is enabled.
          
Original Error: ${message}`), "__NEXT_ERROR_CODE", {
                    value: "E362",
                    enumerable: false,
                    configurable: true
                });
                error.stack = 'Error: ' + error.message + originalErrorStack.slice(stackStart);
                console.error(error);
                return;
            }
        }
    } else if (typeof thrownValue === 'string') {
        message = thrownValue;
    }
    if (message) {
        console.error(`Route ${route} errored during the prospective render. These errors are normally ignored and may not prevent the route from prerendering but are logged here because build debugging is enabled. No stack was provided.
          
Original Message: ${message}`);
        return;
    }
    console.error(`Route ${route} errored during the prospective render. These errors are normally ignored and may not prevent the route from prerendering but are logged here because build debugging is enabled. The thrown value is logged just following this message`);
    console.error(thrownValue);
    return;
}

//# sourceMappingURL=prospective-render-utils.js.map