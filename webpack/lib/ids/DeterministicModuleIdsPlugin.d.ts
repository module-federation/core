export = DeterministicModuleIdsPlugin;
declare class DeterministicModuleIdsPlugin {
    /**
     * Creates an instance of DeterministicModuleIdsPlugin.
     * @param {DeterministicModuleIdsPluginOptions=} options options
     */
    constructor(options?: DeterministicModuleIdsPluginOptions | undefined);
    /** @type {DeterministicModuleIdsPluginOptions} */
    options: DeterministicModuleIdsPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace DeterministicModuleIdsPlugin {
    export { DeterministicModuleIdsPluginOptions };
}
import type Compiler from "../Compiler";
/**
 * Defines the deterministic module ids plugin options type used by this module.
 */
type DeterministicModuleIdsPluginOptions = {
    /**
     * context relative to which module identifiers are computed
     */
    context?: string | undefined;
    /**
     * selector function for modules
     */
    test?: ((module: Module) => boolean) | undefined;
    /**
     * maximum id length in digits (used as starting point)
     */
    maxLength?: number | undefined;
    /**
     * hash salt for ids
     */
    salt?: number | undefined;
    /**
     * do not increase the maxLength to find an optimal id space size
     */
    fixedLength?: boolean | undefined;
    /**
     * throw an error when id conflicts occur (instead of rehashing)
     */
    failOnConflict?: boolean | undefined;
};
import type Module from "../module/Module";
