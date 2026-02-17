export = NormalModuleReplacementPlugin;
declare class NormalModuleReplacementPlugin {
    /**
     * Create an instance of the plugin
     * @param {RegExp} resourceRegExp the resource matcher
     * @param {string | ModuleReplacer} newResource the resource replacement
     */
    constructor(resourceRegExp: RegExp, newResource: string | ModuleReplacer);
    resourceRegExp: RegExp;
    newResource: string | ModuleReplacer;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace NormalModuleReplacementPlugin {
    export { Compiler, ResolveData, InputFileSystem, ModuleReplacer };
}
type Compiler = import("./Compiler");
type ResolveData = import("./NormalModuleFactory").ResolveData;
type InputFileSystem = import("./util/fs").InputFileSystem;
type ModuleReplacer = (resolveData: ResolveData) => void;
