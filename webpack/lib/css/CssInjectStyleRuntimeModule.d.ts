export = CssInjectStyleRuntimeModule;
/** @import Chunk from "../graph/Chunk" */
/** @import { ReadOnlyRuntimeRequirements } from "../module/Module" */
/**
 * @typedef {object} CssInjectCompilationHooks
 * @property {SyncWaterfallHook<[string, Chunk]>} createStyle
 */
declare class CssInjectStyleRuntimeModule extends RuntimeModule {
    /**
     * @param {ReadOnlyRuntimeRequirements} runtimeRequirements runtime requirements
     */
    constructor(runtimeRequirements: ReadOnlyRuntimeRequirements);
    /** @type {ReadOnlyRuntimeRequirements} */
    _runtimeRequirements: ReadOnlyRuntimeRequirements;
}
declare namespace CssInjectStyleRuntimeModule {
    export { getCompilationHooks, CssInjectCompilationHooks };
}
import RuntimeModule = require("../runtime/RuntimeModule");
import type { ReadOnlyRuntimeRequirements } from "../module/Module";
declare var getCompilationHooks: (compilation: import("../Compilation")) => CssInjectCompilationHooks;
type CssInjectCompilationHooks = {
    createStyle: SyncWaterfallHook<[string, Chunk]>;
};
import type Compilation from "../Compilation";
import { SyncWaterfallHook } from "tapable";
import type Chunk from "../graph/Chunk";
