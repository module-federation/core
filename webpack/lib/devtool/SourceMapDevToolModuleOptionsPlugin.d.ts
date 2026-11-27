export = SourceMapDevToolModuleOptionsPlugin;
declare class SourceMapDevToolModuleOptionsPlugin {
    /**
     * Creates an instance of SourceMapDevToolModuleOptionsPlugin.
     * @param {SourceMapDevToolPluginOptions=} options options
     */
    constructor(options?: SourceMapDevToolPluginOptions | undefined);
    /** @type {SourceMapDevToolPluginOptions} */
    options: SourceMapDevToolPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compilation} compilation the compiler instance
     * @returns {void}
     */
    apply(compilation: Compilation): void;
}
import type { SourceMapDevToolPluginOptions } from "./SourceMapDevToolPlugin";
import type Compilation from "../Compilation";
