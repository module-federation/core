export = LoaderPlugin;
declare class LoaderPlugin {
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace LoaderPlugin {
    export { DependencyConstructor, ExecuteModuleExports, ExecuteModuleResult, Compiler, BuildInfo, FileSystemDependencies, ImportModuleCallback, ImportModuleOptions };
}
type DependencyConstructor = import("../Compilation").DependencyConstructor;
type ExecuteModuleExports = import("../Compilation").ExecuteModuleExports;
type ExecuteModuleResult = import("../Compilation").ExecuteModuleResult;
type Compiler = import("../Compiler");
type BuildInfo = import("../Module").BuildInfo;
type FileSystemDependencies = import("../Module").FileSystemDependencies;
type ImportModuleCallback = (err?: (Error | null) | undefined, exports?: ExecuteModuleExports | undefined) => void;
type ImportModuleOptions = {
    /**
     * the target layer
     */
    layer?: string | undefined;
    /**
     * the target public path
     */
    publicPath?: string | undefined;
    /**
     * target base uri
     */
    baseUri?: string | undefined;
};
