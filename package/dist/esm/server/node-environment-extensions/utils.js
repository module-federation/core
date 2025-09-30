import { workAsyncStorage } from '../app-render/work-async-storage.external';
import { workUnitAsyncStorage } from '../app-render/work-unit-async-storage.external';
import { abortOnSynchronousPlatformIOAccess, trackSynchronousPlatformIOAccessInDev } from '../app-render/dynamic-rendering';
import { InvariantError } from '../../shared/lib/invariant-error';
export function io(expression, type) {
    const workUnitStore = workUnitAsyncStorage.getStore();
    if (workUnitStore) {
        if (workUnitStore.type === 'prerender') {
            const prerenderSignal = workUnitStore.controller.signal;
            if (prerenderSignal.aborted === false) {
                // If the prerender signal is already aborted we don't need to construct any stacks
                // because something else actually terminated the prerender.
                const workStore = workAsyncStorage.getStore();
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
                            throw Object.defineProperty(new InvariantError('Unknown expression type in abortOnSynchronousPlatformIOAccess.'), "__NEXT_ERROR_CODE", {
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
                    abortOnSynchronousPlatformIOAccess(workStore.route, expression, errorWithStack, workUnitStore);
                }
            }
        } else if (workUnitStore.type === 'request' && workUnitStore.prerenderPhase === true) {
            const requestStore = workUnitStore;
            trackSynchronousPlatformIOAccessInDev(requestStore);
        }
    }
}

//# sourceMappingURL=utils.js.map