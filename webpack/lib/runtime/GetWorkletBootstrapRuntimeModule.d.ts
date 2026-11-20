export = GetWorkletBootstrapRuntimeModule;
/** @import Compilation from "../Compilation" */
/**
 * Provides a single object URL (one per base URI) for the worklet bootstrap
 * script. A worklet global scope has no `self` and no `location`; this script
 * sets them up before the emitted chunks — which assume a worker-like scope —
 * are added via `addModule`. Deduping by base URI avoids leaking a new object
 * URL per worklet.
 */
declare class GetWorkletBootstrapRuntimeModule extends RuntimeModule {
    constructor();
}
import RuntimeModule = require("./RuntimeModule");
