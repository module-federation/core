/**
 * Entry point to the Segment Cache implementation.
 *
 * All code related to the Segment Cache lives `segment-cache-impl` directory.
 * Callers access it through this indirection.
 *
 * This is to ensure the code is dead code eliminated from the bundle if the
 * flag is disabled.
 *
 * TODO: This is super tedious. Since experimental flags are an essential part
 * of our workflow, we should establish a better pattern for dead code
 * elimination. Ideally it would be done at the bundler level, like how React's
 * build process works. In the React repo, you don't even need to add any extra
 * configuration per experiment — if the code is not reachable, it gets stripped
 * from the build automatically by Rollup. Or, shorter term, we could stub out
 * experimental modules at build time by updating the build config, i.e. a more
 * automated version of what I'm doing manually in this file.
 */ const notEnabled = ()=>{
    throw Object.defineProperty(new Error('Segment Cache experiment is not enabled. This is a bug in Next.js.'), "__NEXT_ERROR_CODE", {
        value: "E654",
        enumerable: false,
        configurable: true
    });
};
export const prefetch = process.env.__NEXT_CLIENT_SEGMENT_CACHE ? function() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
        args[_key] = arguments[_key];
    }
    return require('./segment-cache-impl/prefetch').prefetch(...args);
} : notEnabled;
export const navigate = process.env.__NEXT_CLIENT_SEGMENT_CACHE ? function() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
        args[_key] = arguments[_key];
    }
    return require('./segment-cache-impl/navigation').navigate(...args);
} : notEnabled;
export const revalidateEntireCache = process.env.__NEXT_CLIENT_SEGMENT_CACHE ? function() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
        args[_key] = arguments[_key];
    }
    return require('./segment-cache-impl/cache').revalidateEntireCache(...args);
} : notEnabled;
export const getCurrentCacheVersion = process.env.__NEXT_CLIENT_SEGMENT_CACHE ? function() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
        args[_key] = arguments[_key];
    }
    return require('./segment-cache-impl/cache').getCurrentCacheVersion(...args);
} : notEnabled;
export const schedulePrefetchTask = process.env.__NEXT_CLIENT_SEGMENT_CACHE ? function() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
        args[_key] = arguments[_key];
    }
    return require('./segment-cache-impl/scheduler').schedulePrefetchTask(...args);
} : notEnabled;
export const cancelPrefetchTask = process.env.__NEXT_CLIENT_SEGMENT_CACHE ? function() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
        args[_key] = arguments[_key];
    }
    return require('./segment-cache-impl/scheduler').cancelPrefetchTask(...args);
} : notEnabled;
export const reschedulePrefetchTask = process.env.__NEXT_CLIENT_SEGMENT_CACHE ? function() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
        args[_key] = arguments[_key];
    }
    return require('./segment-cache-impl/scheduler').reschedulePrefetchTask(...args);
} : notEnabled;
export const createCacheKey = process.env.__NEXT_CLIENT_SEGMENT_CACHE ? function() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
        args[_key] = arguments[_key];
    }
    return require('./segment-cache-impl/cache-key').createCacheKey(...args);
} : notEnabled;
/**
 * Below are public constants. They're small enough that we don't need to
 * DCE them.
 */ export var NavigationResultTag = /*#__PURE__*/ function(NavigationResultTag) {
    NavigationResultTag[NavigationResultTag["MPA"] = 0] = "MPA";
    NavigationResultTag[NavigationResultTag["Success"] = 1] = "Success";
    NavigationResultTag[NavigationResultTag["NoOp"] = 2] = "NoOp";
    NavigationResultTag[NavigationResultTag["Async"] = 3] = "Async";
    return NavigationResultTag;
}({});
/**
 * The priority of the prefetch task. Higher numbers are higher priority.
 */ export var PrefetchPriority = /*#__PURE__*/ function(PrefetchPriority) {
    /**
   * Assigned to any visible link that was hovered/touched at some point. This
   * is not removed on mouse exit, because a link that was momentarily
   * hovered is more likely to to be interacted with than one that was not.
   */ PrefetchPriority[PrefetchPriority["Intent"] = 2] = "Intent";
    /**
   * The default priority for prefetch tasks.
   */ PrefetchPriority[PrefetchPriority["Default"] = 1] = "Default";
    /**
   * Assigned to tasks when they spawn non-blocking background work, like
   * revalidating a partially cached entry to see if more data is available.
   */ PrefetchPriority[PrefetchPriority["Background"] = 0] = "Background";
    return PrefetchPriority;
}({});

//# sourceMappingURL=segment-cache.js.map