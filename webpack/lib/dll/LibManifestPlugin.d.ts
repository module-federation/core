export = LibManifestPlugin;
declare class LibManifestPlugin {
    /**
     * Creates an instance of LibManifestPlugin.
     * @param {LibManifestPluginOptions} options the options
     */
    constructor(options: LibManifestPluginOptions);
    /** @type {LibManifestPluginOptions} */
    options: LibManifestPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace LibManifestPlugin {
    export { ManifestModuleData, LibManifestPluginOptions };
}
import type Compiler from "../Compiler";
/**
 * Defines the manifest module data type used by this module.
 */
type ManifestModuleData = {
    id: ModuleId;
    buildMeta?: BuildMeta | undefined;
    exports?: ExportInfoName[] | undefined;
};
/**
 * Defines the lib manifest plugin options type used by this module.
 */
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
import type { ModuleId } from "../graph/ChunkGraph";
import type { BuildMeta } from "../module/Module";
import type { ExportInfoName } from "../graph/Dependency";
