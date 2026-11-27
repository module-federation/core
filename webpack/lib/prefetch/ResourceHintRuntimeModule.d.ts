export = ResourceHintRuntimeModule;
declare class ResourceHintRuntimeModule extends RuntimeModule {
    /**
     * @param {Compilation} compilation the compilation
     * @returns {ResourceHintRuntimeModulePluginHooks} hooks
     */
    static getCompilationHooks(compilation: Compilation): ResourceHintRuntimeModulePluginHooks;
    /**
     * @param {"prefetch" | "preload"} rel link rel value
     */
    constructor(rel: "prefetch" | "preload");
    _rel: "prefetch" | "preload";
}
declare namespace ResourceHintRuntimeModule {
    export { guessAsAttribute, ResourceHintRuntimeModulePluginHooks };
}
import RuntimeModule = require("../runtime/RuntimeModule");
import Compilation = require("../Compilation");
import { guessAsAttribute } from "./parseResourceHintOptions";
type ResourceHintRuntimeModulePluginHooks = {
    linkPrefetch: SyncWaterfallHook<[string]>;
    linkPreload: SyncWaterfallHook<[string]>;
};
import { SyncWaterfallHook } from "tapable";
