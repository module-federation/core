export = DllReferencePlugin;
declare class DllReferencePlugin {
    /**
     * @param {DllReferencePluginOptions} options options object
     */
    constructor(options: DllReferencePluginOptions);
    options: import("../declarations/plugins/DllReferencePlugin").DllReferencePluginOptions;
    /** @type {WeakMap<CompilationParams, CompilationDataItem>} */
    _compilationData: WeakMap<CompilationParams, CompilationDataItem>;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace DllReferencePlugin {
    export { Externals, DllReferencePluginOptions, DllReferencePluginOptionsContent, DllReferencePluginOptionsManifest, Compiler, CompilationParams, InputFileSystem, CompilationDataItem };
}
type Externals = import("../declarations/WebpackOptions").Externals;
type DllReferencePluginOptions = import("../declarations/plugins/DllReferencePlugin").DllReferencePluginOptions;
type DllReferencePluginOptionsContent = import("../declarations/plugins/DllReferencePlugin").DllReferencePluginOptionsContent;
type DllReferencePluginOptionsManifest = import("../declarations/plugins/DllReferencePlugin").DllReferencePluginOptionsManifest;
type Compiler = import("./Compiler");
type CompilationParams = import("./Compiler").CompilationParams;
type InputFileSystem = import("./util/fs").InputFileSystem;
type CompilationDataItem = {
    path: string;
    data: DllReferencePluginOptionsManifest | undefined;
    error: Error | undefined;
};
