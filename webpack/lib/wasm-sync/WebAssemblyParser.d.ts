export = WebAssemblyParser;
/**
 * @extends {Parser<BuiltSyncWasmModule>}
 */
declare class WebAssemblyParser extends Parser<BuiltSyncWasmModule> {
    constructor();
}
import type { BuiltSyncWasmModule } from "./SyncWasmModule";
import Parser = require("../module/Parser");
