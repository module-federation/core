import { ReflectAdapter } from '../web/spec-extension/adapters/reflect';
import { abortAndThrowOnSynchronousRequestDataAccess, throwToInterruptStaticGeneration, postponeWithTracking, trackSynchronousRequestDataAccessInDev } from '../app-render/dynamic-rendering';
import { workUnitAsyncStorage } from '../app-render/work-unit-async-storage.external';
import { InvariantError } from '../../shared/lib/invariant-error';
import { describeStringPropertyAccess, wellKnownProperties } from '../../shared/lib/utils/reflect-utils';
import { makeHangingPromise } from '../dynamic-rendering-utils';
import { createDedupedByCallsiteServerErrorLoggerDev } from '../create-deduped-by-callsite-server-error-logger';
import { scheduleImmediate } from '../../lib/scheduler';
export function createParamsFromClient(underlyingParams, workStore) {
    const workUnitStore = workUnitAsyncStorage.getStore();
    if (workUnitStore) {
        switch(workUnitStore.type){
            case 'prerender':
            case 'prerender-ppr':
            case 'prerender-legacy':
                return createPrerenderParams(underlyingParams, workStore, workUnitStore);
            default:
        }
    }
    return createRenderParams(underlyingParams, workStore);
}
export const createServerParamsForMetadata = createServerParamsForServerSegment;
// routes always runs in RSC context so it is equivalent to a Server Page Component
export function createServerParamsForRoute(underlyingParams, workStore) {
    const workUnitStore = workUnitAsyncStorage.getStore();
    if (workUnitStore) {
        switch(workUnitStore.type){
            case 'prerender':
            case 'prerender-ppr':
            case 'prerender-legacy':
                return createPrerenderParams(underlyingParams, workStore, workUnitStore);
            default:
        }
    }
    return createRenderParams(underlyingParams, workStore);
}
export function createServerParamsForServerSegment(underlyingParams, workStore) {
    const workUnitStore = workUnitAsyncStorage.getStore();
    if (workUnitStore) {
        switch(workUnitStore.type){
            case 'prerender':
            case 'prerender-ppr':
            case 'prerender-legacy':
                return createPrerenderParams(underlyingParams, workStore, workUnitStore);
            default:
        }
    }
    return createRenderParams(underlyingParams, workStore);
}
export function createPrerenderParamsForClientSegment(underlyingParams, workStore) {
    const prerenderStore = workUnitAsyncStorage.getStore();
    if (prerenderStore && prerenderStore.type === 'prerender') {
        const fallbackParams = workStore.fallbackRouteParams;
        if (fallbackParams) {
            for(let key in underlyingParams){
                if (fallbackParams.has(key)) {
                    // This params object has one of more fallback params so we need to consider
                    // the awaiting of this params object "dynamic". Since we are in dynamicIO mode
                    // we encode this as a promise that never resolves
                    return makeHangingPromise(prerenderStore.renderSignal, '`params`');
                }
            }
        }
    }
    // We're prerendering in a mode that does not abort. We resolve the promise without
    // any tracking because we're just transporting a value from server to client where the tracking
    // will be applied.
    return Promise.resolve(underlyingParams);
}
function createPrerenderParams(underlyingParams, workStore, prerenderStore) {
    const fallbackParams = workStore.fallbackRouteParams;
    if (fallbackParams) {
        let hasSomeFallbackParams = false;
        for(const key in underlyingParams){
            if (fallbackParams.has(key)) {
                hasSomeFallbackParams = true;
                break;
            }
        }
        if (hasSomeFallbackParams) {
            // params need to be treated as dynamic because we have at least one fallback param
            if (prerenderStore.type === 'prerender') {
                // We are in a dynamicIO (PPR or otherwise) prerender
                return makeAbortingExoticParams(underlyingParams, workStore.route, prerenderStore);
            }
            // remaining cases are prerender-ppr and prerender-legacy
            // We aren't in a dynamicIO prerender but we do have fallback params at this
            // level so we need to make an erroring exotic params object which will postpone
            // if you access the fallback params
            return makeErroringExoticParams(underlyingParams, fallbackParams, workStore, prerenderStore);
        }
    }
    // We don't have any fallback params so we have an entirely static safe params object
    return makeUntrackedExoticParams(underlyingParams);
}
function createRenderParams(underlyingParams, workStore) {
    if (process.env.NODE_ENV === 'development' && !workStore.isPrefetchRequest) {
        return makeDynamicallyTrackedExoticParamsWithDevWarnings(underlyingParams, workStore);
    } else {
        return makeUntrackedExoticParams(underlyingParams);
    }
}
const CachedParams = new WeakMap();
function makeAbortingExoticParams(underlyingParams, route, prerenderStore) {
    const cachedParams = CachedParams.get(underlyingParams);
    if (cachedParams) {
        return cachedParams;
    }
    const promise = makeHangingPromise(prerenderStore.renderSignal, '`params`');
    CachedParams.set(underlyingParams, promise);
    Object.keys(underlyingParams).forEach((prop)=>{
        if (wellKnownProperties.has(prop)) {
        // These properties cannot be shadowed because they need to be the
        // true underlying value for Promises to work correctly at runtime
        } else {
            Object.defineProperty(promise, prop, {
                get () {
                    const expression = describeStringPropertyAccess('params', prop);
                    const error = createParamsAccessError(route, expression);
                    abortAndThrowOnSynchronousRequestDataAccess(route, expression, error, prerenderStore);
                },
                set (newValue) {
                    Object.defineProperty(promise, prop, {
                        value: newValue,
                        writable: true,
                        enumerable: true
                    });
                },
                enumerable: true,
                configurable: true
            });
        }
    });
    return promise;
}
function makeErroringExoticParams(underlyingParams, fallbackParams, workStore, prerenderStore) {
    const cachedParams = CachedParams.get(underlyingParams);
    if (cachedParams) {
        return cachedParams;
    }
    const augmentedUnderlying = {
        ...underlyingParams
    };
    // We don't use makeResolvedReactPromise here because params
    // supports copying with spread and we don't want to unnecessarily
    // instrument the promise with spreadable properties of ReactPromise.
    const promise = Promise.resolve(augmentedUnderlying);
    CachedParams.set(underlyingParams, promise);
    Object.keys(underlyingParams).forEach((prop)=>{
        if (wellKnownProperties.has(prop)) {
        // These properties cannot be shadowed because they need to be the
        // true underlying value for Promises to work correctly at runtime
        } else {
            if (fallbackParams.has(prop)) {
                Object.defineProperty(augmentedUnderlying, prop, {
                    get () {
                        const expression = describeStringPropertyAccess('params', prop);
                        // In most dynamic APIs we also throw if `dynamic = "error"` however
                        // for params is only dynamic when we're generating a fallback shell
                        // and even when `dynamic = "error"` we still support generating dynamic
                        // fallback shells
                        // TODO remove this comment when dynamicIO is the default since there
                        // will be no `dynamic = "error"`
                        if (prerenderStore.type === 'prerender-ppr') {
                            // PPR Prerender (no dynamicIO)
                            postponeWithTracking(workStore.route, expression, prerenderStore.dynamicTracking);
                        } else {
                            // Legacy Prerender
                            throwToInterruptStaticGeneration(expression, workStore, prerenderStore);
                        }
                    },
                    enumerable: true
                });
                Object.defineProperty(promise, prop, {
                    get () {
                        const expression = describeStringPropertyAccess('params', prop);
                        // In most dynamic APIs we also throw if `dynamic = "error"` however
                        // for params is only dynamic when we're generating a fallback shell
                        // and even when `dynamic = "error"` we still support generating dynamic
                        // fallback shells
                        // TODO remove this comment when dynamicIO is the default since there
                        // will be no `dynamic = "error"`
                        if (prerenderStore.type === 'prerender-ppr') {
                            // PPR Prerender (no dynamicIO)
                            postponeWithTracking(workStore.route, expression, prerenderStore.dynamicTracking);
                        } else {
                            // Legacy Prerender
                            throwToInterruptStaticGeneration(expression, workStore, prerenderStore);
                        }
                    },
                    set (newValue) {
                        Object.defineProperty(promise, prop, {
                            value: newValue,
                            writable: true,
                            enumerable: true
                        });
                    },
                    enumerable: true,
                    configurable: true
                });
            } else {
                ;
                promise[prop] = underlyingParams[prop];
            }
        }
    });
    return promise;
}
function makeUntrackedExoticParams(underlyingParams) {
    const cachedParams = CachedParams.get(underlyingParams);
    if (cachedParams) {
        return cachedParams;
    }
    // We don't use makeResolvedReactPromise here because params
    // supports copying with spread and we don't want to unnecessarily
    // instrument the promise with spreadable properties of ReactPromise.
    const promise = Promise.resolve(underlyingParams);
    CachedParams.set(underlyingParams, promise);
    Object.keys(underlyingParams).forEach((prop)=>{
        if (wellKnownProperties.has(prop)) {
        // These properties cannot be shadowed because they need to be the
        // true underlying value for Promises to work correctly at runtime
        } else {
            ;
            promise[prop] = underlyingParams[prop];
        }
    });
    return promise;
}
function makeDynamicallyTrackedExoticParamsWithDevWarnings(underlyingParams, store) {
    const cachedParams = CachedParams.get(underlyingParams);
    if (cachedParams) {
        return cachedParams;
    }
    // We don't use makeResolvedReactPromise here because params
    // supports copying with spread and we don't want to unnecessarily
    // instrument the promise with spreadable properties of ReactPromise.
    const promise = new Promise((resolve)=>scheduleImmediate(()=>resolve(underlyingParams)));
    const proxiedProperties = new Set();
    const unproxiedProperties = [];
    Object.keys(underlyingParams).forEach((prop)=>{
        if (wellKnownProperties.has(prop)) {
            // These properties cannot be shadowed because they need to be the
            // true underlying value for Promises to work correctly at runtime
            unproxiedProperties.push(prop);
        } else {
            proxiedProperties.add(prop);
            promise[prop] = underlyingParams[prop];
        }
    });
    const proxiedPromise = new Proxy(promise, {
        get (target, prop, receiver) {
            if (typeof prop === 'string') {
                if (// We are accessing a property that was proxied to the promise instance
                proxiedProperties.has(prop)) {
                    const expression = describeStringPropertyAccess('params', prop);
                    syncIODev(store.route, expression);
                }
            }
            return ReflectAdapter.get(target, prop, receiver);
        },
        set (target, prop, value, receiver) {
            if (typeof prop === 'string') {
                proxiedProperties.delete(prop);
            }
            return ReflectAdapter.set(target, prop, value, receiver);
        },
        ownKeys (target) {
            const expression = '`...params` or similar expression';
            syncIODev(store.route, expression, unproxiedProperties);
            return Reflect.ownKeys(target);
        }
    });
    CachedParams.set(underlyingParams, proxiedPromise);
    return proxiedPromise;
}
function syncIODev(route, expression, missingProperties) {
    const workUnitStore = workUnitAsyncStorage.getStore();
    if (workUnitStore && workUnitStore.type === 'request' && workUnitStore.prerenderPhase === true) {
        // When we're rendering dynamically in dev we need to advance out of the
        // Prerender environment when we read Request data synchronously
        const requestStore = workUnitStore;
        trackSynchronousRequestDataAccessInDev(requestStore);
    }
    // In all cases we warn normally
    if (missingProperties && missingProperties.length > 0) {
        warnForIncompleteEnumeration(route, expression, missingProperties);
    } else {
        warnForSyncAccess(route, expression);
    }
}
const warnForSyncAccess = createDedupedByCallsiteServerErrorLoggerDev(createParamsAccessError);
const warnForIncompleteEnumeration = createDedupedByCallsiteServerErrorLoggerDev(createIncompleteEnumerationError);
function createParamsAccessError(route, expression) {
    const prefix = route ? `Route "${route}" ` : 'This route ';
    return Object.defineProperty(new Error(`${prefix}used ${expression}. ` + `\`params\` should be awaited before using its properties. ` + `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`), "__NEXT_ERROR_CODE", {
        value: "E307",
        enumerable: false,
        configurable: true
    });
}
function createIncompleteEnumerationError(route, expression, missingProperties) {
    const prefix = route ? `Route "${route}" ` : 'This route ';
    return Object.defineProperty(new Error(`${prefix}used ${expression}. ` + `\`params\` should be awaited before using its properties. ` + `The following properties were not available through enumeration ` + `because they conflict with builtin property names: ` + `${describeListOfPropertyNames(missingProperties)}. ` + `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`), "__NEXT_ERROR_CODE", {
        value: "E482",
        enumerable: false,
        configurable: true
    });
}
function describeListOfPropertyNames(properties) {
    switch(properties.length){
        case 0:
            throw Object.defineProperty(new InvariantError('Expected describeListOfPropertyNames to be called with a non-empty list of strings.'), "__NEXT_ERROR_CODE", {
                value: "E531",
                enumerable: false,
                configurable: true
            });
        case 1:
            return `\`${properties[0]}\``;
        case 2:
            return `\`${properties[0]}\` and \`${properties[1]}\``;
        default:
            {
                let description = '';
                for(let i = 0; i < properties.length - 1; i++){
                    description += `\`${properties[i]}\`, `;
                }
                description += `, and \`${properties[properties.length - 1]}\``;
                return description;
            }
    }
}

//# sourceMappingURL=params.js.map