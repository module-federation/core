export = SyncModuleIdsPlugin;
/**
 * Represents the sync module ids plugin runtime component.
 * @typedef {object} SyncModuleIdsPluginOptions
 * @property {string} path path to file
 * @property {string=} context context for module names
 * @property {((module: Module) => boolean)=} test selector for modules
 * @property {"read" | "create" | "merge" | "update"=} mode operation mode (defaults to merge)
 */
declare class SyncModuleIdsPlugin {
    /**
     * Creates an instance of SyncModuleIdsPlugin.
     * @param {SyncModuleIdsPluginOptions} options options
     */
    constructor(options: SyncModuleIdsPluginOptions);
    /** @type {SyncModuleIdsPluginOptions} */
    options: SyncModuleIdsPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace SyncModuleIdsPlugin {
    export { JSONContent, SyncModuleIdsPluginOptions };
}
import type Compiler from "../Compiler";
type JSONContent = {
    [key: string]: ModuleId;
};
/**
 * Represents the sync module ids plugin runtime component.
 */
type SyncModuleIdsPluginOptions = {
    /**
     * path to file
     */
    path: string;
    /**
     * context for module names
     */
    context?: string | undefined;
    /**
     * selector for modules
     */
    test?: ((module: Module) => boolean) | undefined;
    /**
     * operation mode (defaults to merge)
     */
    mode?: ("read" | "create" | "merge" | "update") | undefined;
};
import type { ModuleId } from "../graph/ChunkGraph";
import type Module from "../module/Module";
