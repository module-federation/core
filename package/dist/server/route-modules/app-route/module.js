"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    AppRouteRouteModule: null,
    WrappedNextRouterError: null,
    default: null,
    hasNonStaticMethods: null,
    trackDynamic: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    AppRouteRouteModule: function() {
        return AppRouteRouteModule;
    },
    WrappedNextRouterError: function() {
        return WrappedNextRouterError;
    },
    default: function() {
        return _default;
    },
    hasNonStaticMethods: function() {
        return hasNonStaticMethods;
    },
    trackDynamic: function() {
        return trackDynamic;
    }
});
const _routemodule = require("../route-module");
const _requeststore = require("../../async-storage/request-store");
const _workstore = require("../../async-storage/work-store");
const _http = require("../../web/http");
const _implicittags = require("../../lib/implicit-tags");
const _patchfetch = require("../../lib/patch-fetch");
const _tracer = require("../../lib/trace/tracer");
const _constants = require("../../lib/trace/constants");
const _getpathnamefromabsolutepath = require("./helpers/get-pathname-from-absolute-path");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../../build/output/log"));
const _autoimplementmethods = require("./helpers/auto-implement-methods");
const _requestcookies = require("../../web/spec-extension/adapters/request-cookies");
const _headers = require("../../web/spec-extension/adapters/headers");
const _parsedurlquerytoparams = require("./helpers/parsed-url-query-to-params");
const _prospectiverenderutils = require("../../app-render/prospective-render-utils");
const _hooksservercontext = /*#__PURE__*/ _interop_require_wildcard(require("../../../client/components/hooks-server-context"));
const _workasyncstorageexternal = require("../../app-render/work-async-storage.external");
const _workunitasyncstorageexternal = require("../../app-render/work-unit-async-storage.external");
const _actionasyncstorageexternal = require("../../app-render/action-async-storage.external");
const _sharedmodules = /*#__PURE__*/ _interop_require_wildcard(require("./shared-modules"));
const _serveractionrequestmeta = require("../../lib/server-action-request-meta");
const _cookies = require("next/dist/compiled/@edge-runtime/cookies");
const _cleanurl = require("./helpers/clean-url");
const _staticgenerationbailout = require("../../../client/components/static-generation-bailout");
const _isstaticgenenabled = require("./helpers/is-static-gen-enabled");
const _dynamicrendering = require("../../app-render/dynamic-rendering");
const _reflect = require("../../web/spec-extension/adapters/reflect");
const _cachesignal = require("../../app-render/cache-signal");
const _scheduler = require("../../../lib/scheduler");
const _params = require("../../request/params");
const _redirect = require("../../../client/components/redirect");
const _redirecterror = require("../../../client/components/redirect-error");
const _httpaccessfallback = require("../../../client/components/http-access-fallback/http-access-fallback");
const _redirectstatuscode = require("../../../client/components/redirect-status-code");
const _constants1 = require("../../../lib/constants");
const _revalidationutils = require("../../revalidation-utils");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
class WrappedNextRouterError {
    constructor(error, headers){
        this.error = error;
        this.headers = headers;
    }
}
class AppRouteRouteModule extends _routemodule.RouteModule {
    static #_ = this.sharedModules = _sharedmodules;
    constructor({ userland, definition, resolvedPagePath, nextConfigOutput }){
        super({
            userland,
            definition
        }), /**
   * A reference to the request async storage.
   */ this.workUnitAsyncStorage = _workunitasyncstorageexternal.workUnitAsyncStorage, /**
   * A reference to the static generation async storage.
   */ this.workAsyncStorage = _workasyncstorageexternal.workAsyncStorage, /**
   * An interface to call server hooks which interact with the underlying
   * storage.
   */ this.serverHooks = _hooksservercontext, /**
   * A reference to the mutation related async storage, such as mutations of
   * cookies.
   */ this.actionAsyncStorage = _actionasyncstorageexternal.actionAsyncStorage;
        this.resolvedPagePath = resolvedPagePath;
        this.nextConfigOutput = nextConfigOutput;
        // Automatically implement some methods if they aren't implemented by the
        // userland module.
        this.methods = (0, _autoimplementmethods.autoImplementMethods)(userland);
        // Get the non-static methods for this route.
        this.hasNonStaticMethods = hasNonStaticMethods(userland);
        // Get the dynamic property from the userland module.
        this.dynamic = this.userland.dynamic;
        if (this.nextConfigOutput === 'export') {
            if (this.dynamic === 'force-dynamic') {
                throw Object.defineProperty(new Error(`export const dynamic = "force-dynamic" on page "${definition.pathname}" cannot be used with "output: export". See more info here: https://nextjs.org/docs/advanced-features/static-html-export`), "__NEXT_ERROR_CODE", {
                    value: "E278",
                    enumerable: false,
                    configurable: true
                });
            } else if (!(0, _isstaticgenenabled.isStaticGenEnabled)(this.userland) && this.userland['GET']) {
                throw Object.defineProperty(new Error(`export const dynamic = "force-static"/export const revalidate not configured on route "${definition.pathname}" with "output: export". See more info here: https://nextjs.org/docs/advanced-features/static-html-export`), "__NEXT_ERROR_CODE", {
                    value: "E301",
                    enumerable: false,
                    configurable: true
                });
            } else {
                this.dynamic = 'error';
            }
        }
        // We only warn in development after here, so return if we're not in
        // development.
        if (process.env.NODE_ENV === 'development') {
            // Print error in development if the exported handlers are in lowercase, only
            // uppercase handlers are supported.
            const lowercased = _http.HTTP_METHODS.map((method)=>method.toLowerCase());
            for (const method of lowercased){
                if (method in this.userland) {
                    _log.error(`Detected lowercase method '${method}' in '${this.resolvedPagePath}'. Export the uppercase '${method.toUpperCase()}' method name to fix this error.`);
                }
            }
            // Print error if the module exports a default handler, they must use named
            // exports for each HTTP method.
            if ('default' in this.userland) {
                _log.error(`Detected default export in '${this.resolvedPagePath}'. Export a named export for each HTTP method instead.`);
            }
            // If there is no methods exported by this module, then return a not found
            // response.
            if (!_http.HTTP_METHODS.some((method)=>method in this.userland)) {
                _log.error(`No HTTP methods exported in '${this.resolvedPagePath}'. Export a named export for each HTTP method.`);
            }
        }
    }
    /**
   * Resolves the handler function for the given method.
   *
   * @param method the requested method
   * @returns the handler function for the given method
   */ resolve(method) {
        // Ensure that the requested method is a valid method (to prevent RCE's).
        if (!(0, _http.isHTTPMethod)(method)) return ()=>new Response(null, {
                status: 400
            });
        // Return the handler.
        return this.methods[method];
    }
    async do(handler, actionStore, workStore, // @TODO refactor to not take this argument but instead construct the RequestStore
    // inside this function. Right now we get passed a RequestStore even when
    // we're going to do a prerender. We should probably just split do up into prexecute and execute
    requestStore, implicitTags, request, context) {
        var _context_renderOpts_experimental;
        const isStaticGeneration = workStore.isStaticGeneration;
        const dynamicIOEnabled = !!((_context_renderOpts_experimental = context.renderOpts.experimental) == null ? void 0 : _context_renderOpts_experimental.dynamicIO);
        // Patch the global fetch.
        (0, _patchfetch.patchFetch)({
            workAsyncStorage: this.workAsyncStorage,
            workUnitAsyncStorage: this.workUnitAsyncStorage
        });
        const handlerContext = {
            params: context.params ? (0, _params.createServerParamsForRoute)((0, _parsedurlquerytoparams.parsedUrlQueryToParams)(context.params), workStore) : undefined
        };
        const resolvePendingRevalidations = ()=>{
            context.renderOpts.pendingWaitUntil = (0, _revalidationutils.executeRevalidates)(workStore).finally(()=>{
                if (process.env.NEXT_PRIVATE_DEBUG_CACHE) {
                    console.log('pending revalidates promise finished for:', requestStore.url);
                }
            });
        };
        let prerenderStore = null;
        let res;
        try {
            if (isStaticGeneration) {
                const userlandRevalidate = this.userland.revalidate;
                const defaultRevalidate = // If the static generation store does not have a revalidate value
                // set, then we should set it the revalidate value from the userland
                // module or default to false.
                userlandRevalidate === false || userlandRevalidate === undefined ? _constants1.INFINITE_CACHE : userlandRevalidate;
                if (dynamicIOEnabled) {
                    /**
           * When we are attempting to statically prerender the GET handler of a route.ts module
           * and dynamicIO is on we follow a similar pattern to rendering.
           *
           * We first run the handler letting caches fill. If something synchronously dynamic occurs
           * during this prospective render then we can infer it will happen on every render and we
           * just bail out of prerendering.
           *
           * Next we run the handler again and we check if we get a result back in a microtask.
           * Next.js expects the return value to be a Response or a Thenable that resolves to a Response.
           * Unfortunately Response's do not allow for accessing the response body synchronously or in
           * a microtask so we need to allow one more task to unwrap the response body. This is a slightly
           * different semantic than what we have when we render and it means that certain tasks can still
           * execute before a prerender completes such as a carefully timed setImmediate.
           *
           * Functionally though IO should still take longer than the time it takes to unwrap the response body
           * so our heuristic of excluding any IO should be preserved.
           */ const prospectiveController = new AbortController();
                    let prospectiveRenderIsDynamic = false;
                    const cacheSignal = new _cachesignal.CacheSignal();
                    let dynamicTracking = (0, _dynamicrendering.createDynamicTrackingState)(undefined);
                    const prospectiveRoutePrerenderStore = prerenderStore = {
                        type: 'prerender',
                        phase: 'action',
                        // This replicates prior behavior where rootParams is empty in routes
                        // TODO we need to make this have the proper rootParams for this route
                        rootParams: {},
                        implicitTags,
                        renderSignal: prospectiveController.signal,
                        controller: prospectiveController,
                        cacheSignal,
                        // During prospective render we don't use a controller
                        // because we need to let all caches fill.
                        dynamicTracking,
                        revalidate: defaultRevalidate,
                        expire: _constants1.INFINITE_CACHE,
                        stale: _constants1.INFINITE_CACHE,
                        tags: [
                            ...implicitTags.tags
                        ],
                        prerenderResumeDataCache: null,
                        hmrRefreshHash: undefined
                    };
                    let prospectiveResult;
                    try {
                        prospectiveResult = this.workUnitAsyncStorage.run(prospectiveRoutePrerenderStore, handler, request, handlerContext);
                    } catch (err) {
                        if (prospectiveController.signal.aborted) {
                            // the route handler called an API which is always dynamic
                            // there is no need to try again
                            prospectiveRenderIsDynamic = true;
                        } else if (process.env.NEXT_DEBUG_BUILD || process.env.__NEXT_VERBOSE_LOGGING) {
                            (0, _prospectiverenderutils.printDebugThrownValueForProspectiveRender)(err, workStore.route);
                        }
                    }
                    if (typeof prospectiveResult === 'object' && prospectiveResult !== null && typeof prospectiveResult.then === 'function') {
                        // The handler returned a Thenable. We'll listen for rejections to determine
                        // if the route is erroring for dynamic reasons.
                        ;
                        prospectiveResult.then(()=>{}, (err)=>{
                            if (prospectiveController.signal.aborted) {
                                // the route handler called an API which is always dynamic
                                // there is no need to try again
                                prospectiveRenderIsDynamic = true;
                            } else if (process.env.NEXT_DEBUG_BUILD) {
                                (0, _prospectiverenderutils.printDebugThrownValueForProspectiveRender)(err, workStore.route);
                            }
                        });
                    }
                    await cacheSignal.cacheReady();
                    if (prospectiveRenderIsDynamic) {
                        // the route handler called an API which is always dynamic
                        // there is no need to try again
                        const dynamicReason = (0, _dynamicrendering.getFirstDynamicReason)(dynamicTracking);
                        if (dynamicReason) {
                            throw Object.defineProperty(new _hooksservercontext.DynamicServerError(`Route ${workStore.route} couldn't be rendered statically because it used \`${dynamicReason}\`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error`), "__NEXT_ERROR_CODE", {
                                value: "E558",
                                enumerable: false,
                                configurable: true
                            });
                        } else {
                            console.error('Expected Next.js to keep track of reason for opting out of static rendering but one was not found. This is a bug in Next.js');
                            throw Object.defineProperty(new _hooksservercontext.DynamicServerError(`Route ${workStore.route} couldn't be rendered statically because it used a dynamic API. See more info here: https://nextjs.org/docs/messages/dynamic-server-error`), "__NEXT_ERROR_CODE", {
                                value: "E577",
                                enumerable: false,
                                configurable: true
                            });
                        }
                    }
                    // TODO start passing this controller to the route handler. We should expose
                    // it so the handler to abort inflight requests and other operations if we abort
                    // the prerender.
                    const finalController = new AbortController();
                    dynamicTracking = (0, _dynamicrendering.createDynamicTrackingState)(undefined);
                    const finalRoutePrerenderStore = prerenderStore = {
                        type: 'prerender',
                        phase: 'action',
                        rootParams: {},
                        implicitTags,
                        renderSignal: finalController.signal,
                        controller: finalController,
                        cacheSignal: null,
                        dynamicTracking,
                        revalidate: defaultRevalidate,
                        expire: _constants1.INFINITE_CACHE,
                        stale: _constants1.INFINITE_CACHE,
                        tags: [
                            ...implicitTags.tags
                        ],
                        prerenderResumeDataCache: null,
                        hmrRefreshHash: undefined
                    };
                    let responseHandled = false;
                    res = await new Promise((resolve, reject)=>{
                        (0, _scheduler.scheduleImmediate)(async ()=>{
                            try {
                                const result = await this.workUnitAsyncStorage.run(finalRoutePrerenderStore, handler, request, handlerContext);
                                if (responseHandled) {
                                    // we already rejected in the followup task
                                    return;
                                } else if (!(result instanceof Response)) {
                                    // This is going to error but we let that happen below
                                    resolve(result);
                                    return;
                                }
                                responseHandled = true;
                                let bodyHandled = false;
                                result.arrayBuffer().then((body)=>{
                                    if (!bodyHandled) {
                                        bodyHandled = true;
                                        resolve(new Response(body, {
                                            headers: result.headers,
                                            status: result.status,
                                            statusText: result.statusText
                                        }));
                                    }
                                }, reject);
                                (0, _scheduler.scheduleImmediate)(()=>{
                                    if (!bodyHandled) {
                                        bodyHandled = true;
                                        finalController.abort();
                                        reject(createDynamicIOError(workStore.route));
                                    }
                                });
                            } catch (err) {
                                reject(err);
                            }
                        });
                        (0, _scheduler.scheduleImmediate)(()=>{
                            if (!responseHandled) {
                                responseHandled = true;
                                finalController.abort();
                                reject(createDynamicIOError(workStore.route));
                            }
                        });
                    });
                    if (finalController.signal.aborted) {
                        // We aborted from within the execution
                        throw createDynamicIOError(workStore.route);
                    } else {
                        // We didn't abort during the execution. We can abort now as a matter of semantics
                        // though at the moment nothing actually consumes this signal so it won't halt any
                        // inflight work.
                        finalController.abort();
                    }
                } else {
                    prerenderStore = {
                        type: 'prerender-legacy',
                        phase: 'action',
                        rootParams: {},
                        implicitTags,
                        revalidate: defaultRevalidate,
                        expire: _constants1.INFINITE_CACHE,
                        stale: _constants1.INFINITE_CACHE,
                        tags: [
                            ...implicitTags.tags
                        ]
                    };
                    res = await _workunitasyncstorageexternal.workUnitAsyncStorage.run(prerenderStore, handler, request, handlerContext);
                }
            } else {
                res = await _workunitasyncstorageexternal.workUnitAsyncStorage.run(requestStore, handler, request, handlerContext);
            }
        } catch (err) {
            if ((0, _redirecterror.isRedirectError)(err)) {
                const url = (0, _redirect.getURLFromRedirectError)(err);
                if (!url) {
                    throw Object.defineProperty(new Error('Invariant: Unexpected redirect url format'), "__NEXT_ERROR_CODE", {
                        value: "E399",
                        enumerable: false,
                        configurable: true
                    });
                }
                // We need to capture any headers that should be sent on
                // the response.
                const headers = new Headers({
                    Location: url
                });
                // Let's append any cookies that were added by the
                // cookie API.
                // TODO leaving the gate here b/c it indicates that we might not actually want to do this
                // on every `do` call. During prerender there should be no mutableCookies because
                if (requestStore.type === 'request') {
                    (0, _requestcookies.appendMutableCookies)(headers, requestStore.mutableCookies);
                }
                resolvePendingRevalidations();
                // Return the redirect response.
                return new Response(null, {
                    // If we're in an action, we want to use a 303 redirect as we don't
                    // want the POST request to follow the redirect, as it could result in
                    // erroneous re-submissions.
                    status: actionStore.isAction ? _redirectstatuscode.RedirectStatusCode.SeeOther : (0, _redirect.getRedirectStatusCodeFromError)(err),
                    headers
                });
            } else if ((0, _httpaccessfallback.isHTTPAccessFallbackError)(err)) {
                const httpStatus = (0, _httpaccessfallback.getAccessFallbackHTTPStatus)(err);
                return new Response(null, {
                    status: httpStatus
                });
            }
            throw err;
        }
        // Validate that the response is a valid response object.
        if (!(res instanceof Response)) {
            throw Object.defineProperty(new Error(`No response is returned from route handler '${this.resolvedPagePath}'. Ensure you return a \`Response\` or a \`NextResponse\` in all branches of your handler.`), "__NEXT_ERROR_CODE", {
                value: "E325",
                enumerable: false,
                configurable: true
            });
        }
        context.renderOpts.fetchMetrics = workStore.fetchMetrics;
        resolvePendingRevalidations();
        if (prerenderStore) {
            var _prerenderStore_tags;
            context.renderOpts.collectedTags = (_prerenderStore_tags = prerenderStore.tags) == null ? void 0 : _prerenderStore_tags.join(',');
            context.renderOpts.collectedRevalidate = prerenderStore.revalidate;
            context.renderOpts.collectedExpire = prerenderStore.expire;
            context.renderOpts.collectedStale = prerenderStore.stale;
        }
        // It's possible cookies were set in the handler, so we need
        // to merge the modified cookies and the returned response
        // here.
        const headers = new Headers(res.headers);
        if (requestStore.type === 'request' && (0, _requestcookies.appendMutableCookies)(headers, requestStore.mutableCookies)) {
            return new Response(res.body, {
                status: res.status,
                statusText: res.statusText,
                headers
            });
        }
        return res;
    }
    async handle(req, context) {
        // Get the handler function for the given method.
        const handler = this.resolve(req.method);
        // Get the context for the static generation.
        const staticGenerationContext = {
            // App Routes don't support unknown route params.
            fallbackRouteParams: null,
            page: this.definition.page,
            renderOpts: context.renderOpts,
            buildId: context.sharedContext.buildId,
            previouslyRevalidatedTags: []
        };
        // Add the fetchCache option to the renderOpts.
        staticGenerationContext.renderOpts.fetchCache = this.userland.fetchCache;
        const actionStore = {
            isAppRoute: true,
            isAction: (0, _serveractionrequestmeta.getIsPossibleServerAction)(req)
        };
        const implicitTags = await (0, _implicittags.getImplicitTags)(this.definition.page, req.nextUrl, // App Routes don't support unknown route params.
        null);
        const requestStore = (0, _requeststore.createRequestStoreForAPI)(req, req.nextUrl, implicitTags, undefined, context.prerenderManifest.preview);
        const workStore = (0, _workstore.createWorkStore)(staticGenerationContext);
        // Run the handler with the request AsyncLocalStorage to inject the helper
        // support. We set this to `unknown` because the type is not known until
        // runtime when we do a instanceof check below.
        const response = await this.actionAsyncStorage.run(actionStore, ()=>this.workUnitAsyncStorage.run(requestStore, ()=>this.workAsyncStorage.run(workStore, async ()=>{
                    // Check to see if we should bail out of static generation based on
                    // having non-static methods.
                    if (this.hasNonStaticMethods) {
                        if (workStore.isStaticGeneration) {
                            const err = Object.defineProperty(new _hooksservercontext.DynamicServerError('Route is configured with methods that cannot be statically generated.'), "__NEXT_ERROR_CODE", {
                                value: "E582",
                                enumerable: false,
                                configurable: true
                            });
                            workStore.dynamicUsageDescription = err.message;
                            workStore.dynamicUsageStack = err.stack;
                            throw err;
                        }
                    }
                    // We assume we can pass the original request through however we may end up
                    // proxying it in certain circumstances based on execution type and configuration
                    let request = req;
                    // Update the static generation store based on the dynamic property.
                    switch(this.dynamic){
                        case 'force-dynamic':
                            {
                                // Routes of generated paths should be dynamic
                                workStore.forceDynamic = true;
                                break;
                            }
                        case 'force-static':
                            // The dynamic property is set to force-static, so we should
                            // force the page to be static.
                            workStore.forceStatic = true;
                            // We also Proxy the request to replace dynamic data on the request
                            // with empty stubs to allow for safely executing as static
                            request = new Proxy(req, forceStaticRequestHandlers);
                            break;
                        case 'error':
                            // The dynamic property is set to error, so we should throw an
                            // error if the page is being statically generated.
                            workStore.dynamicShouldError = true;
                            if (workStore.isStaticGeneration) request = new Proxy(req, requireStaticRequestHandlers);
                            break;
                        default:
                            // We proxy `NextRequest` to track dynamic access, and potentially bail out of static generation
                            request = proxyNextRequest(req, workStore);
                    }
                    // TODO: propagate this pathname from route matcher
                    const route = (0, _getpathnamefromabsolutepath.getPathnameFromAbsolutePath)(this.resolvedPagePath);
                    const tracer = (0, _tracer.getTracer)();
                    // Update the root span attribute for the route.
                    tracer.setRootSpanAttribute('next.route', route);
                    return tracer.trace(_constants.AppRouteRouteHandlersSpan.runHandler, {
                        spanName: `executing api route (app) ${route}`,
                        attributes: {
                            'next.route': route
                        }
                    }, async ()=>this.do(handler, actionStore, workStore, requestStore, implicitTags, request, context));
                })));
        // If the handler did't return a valid response, then return the internal
        // error response.
        if (!(response instanceof Response)) {
            // TODO: validate the correct handling behavior, maybe log something?
            return new Response(null, {
                status: 500
            });
        }
        if (response.headers.has('x-middleware-rewrite')) {
            throw Object.defineProperty(new Error('NextResponse.rewrite() was used in a app route handler, this is not currently supported. Please remove the invocation to continue.'), "__NEXT_ERROR_CODE", {
                value: "E374",
                enumerable: false,
                configurable: true
            });
        }
        if (response.headers.get('x-middleware-next') === '1') {
            // TODO: move this error into the `NextResponse.next()` function.
            throw Object.defineProperty(new Error('NextResponse.next() was used in a app route handler, this is not supported. See here for more info: https://nextjs.org/docs/messages/next-response-next-in-app-route-handler'), "__NEXT_ERROR_CODE", {
                value: "E385",
                enumerable: false,
                configurable: true
            });
        }
        return response;
    }
}
const _default = AppRouteRouteModule;
function hasNonStaticMethods(handlers) {
    if (// Order these by how common they are to be used
    handlers.POST || handlers.PUT || handlers.DELETE || handlers.PATCH || handlers.OPTIONS) {
        return true;
    }
    return false;
}
// These symbols will be used to stash cached values on Proxied requests without requiring
// additional closures or storage such as WeakMaps.
const nextURLSymbol = Symbol('nextUrl');
const requestCloneSymbol = Symbol('clone');
const urlCloneSymbol = Symbol('clone');
const searchParamsSymbol = Symbol('searchParams');
const hrefSymbol = Symbol('href');
const toStringSymbol = Symbol('toString');
const headersSymbol = Symbol('headers');
const cookiesSymbol = Symbol('cookies');
/**
 * The general technique with these proxy handlers is to prioritize keeping them static
 * by stashing computed values on the Proxy itself. This is safe because the Proxy is
 * inaccessible to the consumer since all operations are forwarded
 */ const forceStaticRequestHandlers = {
    get (target, prop, receiver) {
        switch(prop){
            case 'headers':
                return target[headersSymbol] || (target[headersSymbol] = _headers.HeadersAdapter.seal(new Headers({})));
            case 'cookies':
                return target[cookiesSymbol] || (target[cookiesSymbol] = _requestcookies.RequestCookiesAdapter.seal(new _cookies.RequestCookies(new Headers({}))));
            case 'nextUrl':
                return target[nextURLSymbol] || (target[nextURLSymbol] = new Proxy(target.nextUrl, forceStaticNextUrlHandlers));
            case 'url':
                // we don't need to separately cache this we can just read the nextUrl
                // and return the href since we know it will have been stripped of any
                // dynamic parts. We access via the receiver to trigger the get trap
                return receiver.nextUrl.href;
            case 'geo':
            case 'ip':
                return undefined;
            case 'clone':
                return target[requestCloneSymbol] || (target[requestCloneSymbol] = ()=>new Proxy(// This is vaguely unsafe but it's required since NextRequest does not implement
                    // clone. The reason we might expect this to work in this context is the Proxy will
                    // respond with static-amenable values anyway somewhat restoring the interface.
                    // @TODO we need to rethink NextRequest and NextURL because they are not sufficientlly
                    // sophisticated to adequately represent themselves in all contexts. A better approach is
                    // to probably embed the static generation logic into the class itself removing the need
                    // for any kind of proxying
                    target.clone(), forceStaticRequestHandlers));
            default:
                return _reflect.ReflectAdapter.get(target, prop, receiver);
        }
    }
};
const forceStaticNextUrlHandlers = {
    get (target, prop, receiver) {
        switch(prop){
            // URL properties
            case 'search':
                return '';
            case 'searchParams':
                return target[searchParamsSymbol] || (target[searchParamsSymbol] = new URLSearchParams());
            case 'href':
                return target[hrefSymbol] || (target[hrefSymbol] = (0, _cleanurl.cleanURL)(target.href).href);
            case 'toJSON':
            case 'toString':
                return target[toStringSymbol] || (target[toStringSymbol] = ()=>receiver.href);
            // NextUrl properties
            case 'url':
                // Currently nextURL does not expose url but our Docs indicate that it is an available property
                // I am forcing this to undefined here to avoid accidentally exposing a dynamic value later if
                // the underlying nextURL ends up adding this property
                return undefined;
            case 'clone':
                return target[urlCloneSymbol] || (target[urlCloneSymbol] = ()=>new Proxy(target.clone(), forceStaticNextUrlHandlers));
            default:
                return _reflect.ReflectAdapter.get(target, prop, receiver);
        }
    }
};
function proxyNextRequest(request, workStore) {
    const nextUrlHandlers = {
        get (target, prop, receiver) {
            switch(prop){
                case 'search':
                case 'searchParams':
                case 'url':
                case 'href':
                case 'toJSON':
                case 'toString':
                case 'origin':
                    {
                        const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
                        trackDynamic(workStore, workUnitStore, `nextUrl.${prop}`);
                        return _reflect.ReflectAdapter.get(target, prop, receiver);
                    }
                case 'clone':
                    return target[urlCloneSymbol] || (target[urlCloneSymbol] = ()=>new Proxy(target.clone(), nextUrlHandlers));
                default:
                    return _reflect.ReflectAdapter.get(target, prop, receiver);
            }
        }
    };
    const nextRequestHandlers = {
        get (target, prop) {
            switch(prop){
                case 'nextUrl':
                    return target[nextURLSymbol] || (target[nextURLSymbol] = new Proxy(target.nextUrl, nextUrlHandlers));
                case 'headers':
                case 'cookies':
                case 'url':
                case 'body':
                case 'blob':
                case 'json':
                case 'text':
                case 'arrayBuffer':
                case 'formData':
                    {
                        const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
                        trackDynamic(workStore, workUnitStore, `request.${prop}`);
                        // The receiver arg is intentionally the same as the target to fix an issue with
                        // edge runtime, where attempting to access internal slots with the wrong `this` context
                        // results in an error.
                        return _reflect.ReflectAdapter.get(target, prop, target);
                    }
                case 'clone':
                    return target[requestCloneSymbol] || (target[requestCloneSymbol] = ()=>new Proxy(// This is vaguely unsafe but it's required since NextRequest does not implement
                        // clone. The reason we might expect this to work in this context is the Proxy will
                        // respond with static-amenable values anyway somewhat restoring the interface.
                        // @TODO we need to rethink NextRequest and NextURL because they are not sufficientlly
                        // sophisticated to adequately represent themselves in all contexts. A better approach is
                        // to probably embed the static generation logic into the class itself removing the need
                        // for any kind of proxying
                        target.clone(), nextRequestHandlers));
                default:
                    // The receiver arg is intentionally the same as the target to fix an issue with
                    // edge runtime, where attempting to access internal slots with the wrong `this` context
                    // results in an error.
                    return _reflect.ReflectAdapter.get(target, prop, target);
            }
        }
    };
    return new Proxy(request, nextRequestHandlers);
}
const requireStaticRequestHandlers = {
    get (target, prop, receiver) {
        switch(prop){
            case 'nextUrl':
                return target[nextURLSymbol] || (target[nextURLSymbol] = new Proxy(target.nextUrl, requireStaticNextUrlHandlers));
            case 'headers':
            case 'cookies':
            case 'url':
            case 'body':
            case 'blob':
            case 'json':
            case 'text':
            case 'arrayBuffer':
            case 'formData':
                throw Object.defineProperty(new _staticgenerationbailout.StaticGenBailoutError(`Route ${target.nextUrl.pathname} with \`dynamic = "error"\` couldn't be rendered statically because it used \`request.${prop}\`.`), "__NEXT_ERROR_CODE", {
                    value: "E611",
                    enumerable: false,
                    configurable: true
                });
            case 'clone':
                return target[requestCloneSymbol] || (target[requestCloneSymbol] = ()=>new Proxy(// This is vaguely unsafe but it's required since NextRequest does not implement
                    // clone. The reason we might expect this to work in this context is the Proxy will
                    // respond with static-amenable values anyway somewhat restoring the interface.
                    // @TODO we need to rethink NextRequest and NextURL because they are not sufficientlly
                    // sophisticated to adequately represent themselves in all contexts. A better approach is
                    // to probably embed the static generation logic into the class itself removing the need
                    // for any kind of proxying
                    target.clone(), requireStaticRequestHandlers));
            default:
                return _reflect.ReflectAdapter.get(target, prop, receiver);
        }
    }
};
const requireStaticNextUrlHandlers = {
    get (target, prop, receiver) {
        switch(prop){
            case 'search':
            case 'searchParams':
            case 'url':
            case 'href':
            case 'toJSON':
            case 'toString':
            case 'origin':
                throw Object.defineProperty(new _staticgenerationbailout.StaticGenBailoutError(`Route ${target.pathname} with \`dynamic = "error"\` couldn't be rendered statically because it used \`nextUrl.${prop}\`.`), "__NEXT_ERROR_CODE", {
                    value: "E575",
                    enumerable: false,
                    configurable: true
                });
            case 'clone':
                return target[urlCloneSymbol] || (target[urlCloneSymbol] = ()=>new Proxy(target.clone(), requireStaticNextUrlHandlers));
            default:
                return _reflect.ReflectAdapter.get(target, prop, receiver);
        }
    }
};
function createDynamicIOError(route) {
    return Object.defineProperty(new _hooksservercontext.DynamicServerError(`Route ${route} couldn't be rendered statically because it used IO that was not cached. See more info here: https://nextjs.org/docs/messages/dynamic-io`), "__NEXT_ERROR_CODE", {
        value: "E609",
        enumerable: false,
        configurable: true
    });
}
function trackDynamic(store, workUnitStore, expression) {
    if (workUnitStore) {
        if (workUnitStore.type === 'cache') {
            throw Object.defineProperty(new Error(`Route ${store.route} used "${expression}" inside "use cache". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "${expression}" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`), "__NEXT_ERROR_CODE", {
                value: "E178",
                enumerable: false,
                configurable: true
            });
        } else if (workUnitStore.type === 'unstable-cache') {
            throw Object.defineProperty(new Error(`Route ${store.route} used "${expression}" inside a function cached with "unstable_cache(...)". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "${expression}" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`), "__NEXT_ERROR_CODE", {
                value: "E133",
                enumerable: false,
                configurable: true
            });
        }
    }
    if (store.dynamicShouldError) {
        throw Object.defineProperty(new _staticgenerationbailout.StaticGenBailoutError(`Route ${store.route} with \`dynamic = "error"\` couldn't be rendered statically because it used \`${expression}\`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`), "__NEXT_ERROR_CODE", {
            value: "E553",
            enumerable: false,
            configurable: true
        });
    }
    if (workUnitStore) {
        if (workUnitStore.type === 'prerender') {
            // dynamicIO Prerender
            const error = Object.defineProperty(new Error(`Route ${store.route} used ${expression} without first calling \`await connection()\`. See more info here: https://nextjs.org/docs/messages/next-prerender-sync-request`), "__NEXT_ERROR_CODE", {
                value: "E261",
                enumerable: false,
                configurable: true
            });
            (0, _dynamicrendering.abortAndThrowOnSynchronousRequestDataAccess)(store.route, expression, error, workUnitStore);
        } else if (workUnitStore.type === 'prerender-ppr') {
            // PPR Prerender
            (0, _dynamicrendering.postponeWithTracking)(store.route, expression, workUnitStore.dynamicTracking);
        } else if (workUnitStore.type === 'prerender-legacy') {
            // legacy Prerender
            workUnitStore.revalidate = 0;
            const err = Object.defineProperty(new _hooksservercontext.DynamicServerError(`Route ${store.route} couldn't be rendered statically because it used \`${expression}\`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error`), "__NEXT_ERROR_CODE", {
                value: "E558",
                enumerable: false,
                configurable: true
            });
            store.dynamicUsageDescription = expression;
            store.dynamicUsageStack = err.stack;
            throw err;
        } else if (process.env.NODE_ENV === 'development' && workUnitStore && workUnitStore.type === 'request') {
            workUnitStore.usedDynamic = true;
        }
    }
}

//# sourceMappingURL=module.js.map