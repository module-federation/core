"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "io", {
    enumerable: true,
    get: function() {
        return io;
    }
});
const _workasyncstorageexternal = require("../app-render/work-async-storage.external");
const _workunitasyncstorageexternal = require("../app-render/work-unit-async-storage.external");
const _dynamicrendering = require("../app-render/dynamic-rendering");
const _invarianterror = require("../../shared/lib/invariant-error");
function io(expression, type) {
    const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
    if (workUnitStore) {
        if (workUnitStore.type === 'prerender') {
            const prerenderSignal = workUnitStore.controller.signal;
            if (prerenderSignal.aborted === false) {
                // If the prerender signal is already aborted we don't need to construct any stacks
                // because something else actually terminated the prerender.
                const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
                if (workStore) {
                    let message;
                    switch(type){
                        case 'time':
                            message = `Route "${workStore.route}" used ${expression} instead of using \`performance\` or without explicitly calling \`await connection()\` beforehand. See more info here: https://nextjs.org/docs/messages/next-prerender-current-time`;
                            break;
                        case 'random':
                            message = `Route "${workStore.route}" used ${expression} outside of \`"use cache"\` and without explicitly calling \`await connection()\` beforehand. See more info here: https://nextjs.org/docs/messages/next-prerender-random`;
                            break;
                        case 'crypto':
                            message = `Route "${workStore.route}" used ${expression} outside of \`"use cache"\` and without explicitly calling \`await connection()\` beforehand. See more info here: https://nextjs.org/docs/messages/next-prerender-crypto`;
                            break;
                        default:
                            throw Object.defineProperty(new _invarianterror.InvariantError('Unknown expression type in abortOnSynchronousPlatformIOAccess.'), "__NEXT_ERROR_CODE", {
                                value: "E526",
                                enumerable: false,
                                configurable: true
                            });
                    }
                    const errorWithStack = Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
                        value: "E394",
                        enumerable: false,
                        configurable: true
                    });
                    (0, _dynamicrendering.abortOnSynchronousPlatformIOAccess)(workStore.route, expression, errorWithStack, workUnitStore);
                }
            }
        } else if (workUnitStore.type === 'request' && workUnitStore.prerenderPhase === true) {
            const requestStore = workUnitStore;
            (0, _dynamicrendering.trackSynchronousPlatformIOAccessInDev)(requestStore);
        }
    }
}

//# sourceMappingURL=utils.js.map