export = LoadScriptRuntimeModule;
/** @import Chunk from "../graph/Chunk" */
/**
 * @typedef {object} LoadScriptCompilationHooks
 * @property {SyncWaterfallHook<[string, Chunk]>} createScript
 */
declare class LoadScriptRuntimeModule extends HelperRuntimeModule {
    /**
     * @param {boolean=} withCreateScriptUrl use create script url for trusted types
     * @param {boolean=} withFetchPriority use `fetchPriority` attribute
     */
    constructor(withCreateScriptUrl?: boolean | undefined, withFetchPriority?: boolean | undefined);
    /** @type {boolean | undefined} */
    _withCreateScriptUrl: boolean | undefined;
    /** @type {boolean | undefined} */
    _withFetchPriority: boolean | undefined;
}
declare namespace LoadScriptRuntimeModule {
    export { getCompilationHooks, LoadScriptCompilationHooks };
}
import HelperRuntimeModule = require("./HelperRuntimeModule");
declare var getCompilationHooks: (compilation: import("../Compilation")) => LoadScriptCompilationHooks;
type LoadScriptCompilationHooks = {
    createScript: SyncWaterfallHook<[string, Chunk]>;
};
import type Compilation from "../Compilation";
import { SyncWaterfallHook } from "tapable";
import type Chunk from "../graph/Chunk";
