export = DeterministicModuleIdsPlugin;
declare class DeterministicModuleIdsPlugin {
    /**
     * @param {DeterministicModuleIdsPluginOptions=} options options
     */
    constructor(options?: DeterministicModuleIdsPluginOptions | undefined);
    options: DeterministicModuleIdsPluginOptions;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace DeterministicModuleIdsPlugin {
    export { Compiler, Module, DeterministicModuleIdsPluginOptions };
}
type Compiler = import("../Compiler");
type Module = import("../Module");
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
