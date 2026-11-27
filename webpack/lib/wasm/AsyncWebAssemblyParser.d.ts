export = AsyncWebAssemblyParser;
/**
 * @extends {Parser<BuiltAsyncWasmModule>}
 */
declare class AsyncWebAssemblyParser extends Parser<AsyncWasmModule.BuiltAsyncWasmModule> {
    constructor();
}
import type AsyncWasmModule from "./AsyncWasmModule";
import Parser = require("../module/Parser");
