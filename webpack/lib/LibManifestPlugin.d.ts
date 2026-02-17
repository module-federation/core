export = LibManifestPlugin;
declare class LibManifestPlugin {
    /**
     * @param {LibManifestPluginOptions} options the options
     */
    constructor(options: LibManifestPluginOptions);
    options: LibManifestPluginOptions;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace LibManifestPlugin {
    export { ModuleId, Compiler, IntermediateFileSystem, BuildMeta, ExportInfoName, ManifestModuleData, LibManifestPluginOptions };
}
type ModuleId = import("./ChunkGraph").ModuleId;
type Compiler = import("./Compiler");
type IntermediateFileSystem = import("./Compiler").IntermediateFileSystem;
type BuildMeta = import("./Module").BuildMeta;
type ExportInfoName = import("./ExportsInfo").ExportInfoName;
type ManifestModuleData = {
    id: ModuleId;
    buildMeta?: BuildMeta | undefined;
    exports?: ExportInfoName[] | undefined;
};
type LibManifestPluginOptions = {
    /**
     * Context of requests in the manifest file (defaults to the webpack context).
     */
    context?: string | undefined;
    /**
     * If true, only entry points will be exposed (default: true).
     */
    entryOnly?: boolean | undefined;
    /**
     * If true, manifest json file (output) will be formatted.
     */
    format?: boolean | undefined;
    /**
     * Name of the exposed dll function (external name, use value of 'output.library').
     */
    name?: string | undefined;
    /**
     * Absolute path to the manifest json file (output).
     */
    path: string;
    /**
     * Type of the dll bundle (external type, use value of 'output.libraryTarget').
     */
    type?: string | undefined;
};
