export = NaturalModuleIdsPlugin;
declare class NaturalModuleIdsPlugin {
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace NaturalModuleIdsPlugin {
    export { Compiler };
}
type Compiler = import("../Compiler");
