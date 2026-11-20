export = JsonpTemplatePlugin;
/** @import Compilation from "../Compilation" */
/** @import Compiler from "../Compiler" */
declare class JsonpTemplatePlugin {
    /**
     * Returns hooks.
     * @deprecated use JsonpChunkLoadingRuntimeModule.getCompilationHooks instead
     * @param {Compilation} compilation the compilation
     * @returns {JsonpChunkLoadingRuntimeModule.JsonpCompilationPluginHooks} hooks
     */
    static getCompilationHooks(compilation: Compilation): JsonpChunkLoadingRuntimeModule.JsonpCompilationPluginHooks;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type Compiler from "../Compiler";
import type Compilation from "../Compilation";
import JsonpChunkLoadingRuntimeModule = require("./JsonpChunkLoadingRuntimeModule");
