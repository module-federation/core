export = StartupAssetHintRuntimeModule;
/** @import Compilation from "../Compilation" */
/**
 * Fires `<link rel="prefetch">` / `<link rel="preload">` for every asset
 * referenced from this chunk via `new URL(..., import.meta.url)` carrying
 * `webpackPrefetch` / `webpackPreload`, at chunk startup. Runs before any
 * user module evaluates, so by the time user code reaches the
 * corresponding `new URL(...)` (or hands the URL to `<img>`, `fetch`,
 * `new Worker`, etc.), the browser already has the response in flight.
 *
 * The calls themselves are rendered by `ResourceHintPlugin`, while runtime
 * requirements are still open — see `collectStartupAssetHintLines`.
 */
declare class StartupAssetHintRuntimeModule extends RuntimeModule {
    /**
     * @param {string[]} lines the `<link>` calls this chunk fires at startup
     */
    constructor(lines: string[]);
    _lines: string[];
}
import RuntimeModule = require("../runtime/RuntimeModule");
