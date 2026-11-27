export = VirtualUrlPlugin;
declare class VirtualUrlPlugin {
    /**
     * Creates an instance of VirtualUrlPlugin.
     * @param {VirtualModules} modules The virtual modules
     * @param {Omit<VirtualUrlOptions, "modules"> | string=} schemeOrOptions The URL scheme to use
     */
    constructor(modules: VirtualModules, schemeOrOptions?: (Omit<VirtualUrlOptions, "modules"> | string) | undefined);
    /** @type {VirtualUrlOptions} */
    options: VirtualUrlOptions;
    /** @type {string} */
    scheme: string;
    /** @type {VirtualUrlOptions["context"]} */
    context: VirtualUrlOptions["context"];
    /** @type {NormalizedModules} */
    modules: NormalizedModules;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
    /**
     * Finds virtual module config by id.
     * @param {string} id The module id
     * @returns {VirtualModule} The virtual module config
     */
    findVirtualModuleConfigById(id: string): VirtualModule;
    /**
     * Get the cache version for a given version value
     * @param {VersionFn | true | string} version The version value or function
     * @returns {string | undefined} The cache version
     */
    getCacheVersion(version: VersionFn | true | string): string | undefined;
}
declare namespace VirtualUrlPlugin {
    export { DEFAULT_SCHEME, VirtualModuleVersion, VirtualModule, VirtualModuleContent, VirtualUrlOptions, VirtualUrlPluginOptions, SourceFn, VersionFn, VirtualModules, LoaderContext, NormalizedModules };
}
import type Compiler from "../Compiler";
declare const DEFAULT_SCHEME: "virtual";
type VirtualModuleVersion = true;
/**
 * A virtual module definition.
 */
type VirtualModule = {
    /**
     * The context for the virtual module. A string path. Defaults to 'auto', which will try to resolve the context from the module id.
     */
    context?: string | undefined;
    /**
     * The source function that provides the virtual content.
     */
    source: SourceFn;
    /**
     * The module type.
     */
    type?: string | undefined;
    /**
     * Optional version function or value for cache invalidation.
     */
    version?: (VirtualModuleVersion | string | VersionFn) | undefined;
};
/**
 * A virtual module can be a string, a function, or a VirtualModule object.
 */
type VirtualModuleContent = string | SourceFn | VirtualModule;
/**
 * Options for building virtual resources.
 */
type VirtualUrlOptions = {
    /**
     * The default context for virtual modules. A string path. Defaults to 'auto', which will try to resolve the context from the module id.
     */
    context?: string | undefined;
    /**
     * The virtual modules configuration.
     */
    modules: {
        [key: string]: VirtualModuleContent;
    };
    /**
     * The URL scheme to use for virtual resources.
     */
    scheme?: string | undefined;
};
type VirtualUrlPluginOptions = VirtualUrlOptions;
type SourceFn = (loaderContext: LoaderContext<LoaderOptions>) => Promise<string | Buffer> | string | Buffer;
type VersionFn = () => string;
type VirtualModules = {
    [key: string]: VirtualModuleContent;
};
/**
 * Defines the loader context type used by this module.
 */
type LoaderContext<T> = import("../module/NormalModule").LoaderContext<T>;
type NormalizedModules = {
    [key: string]: VirtualModule;
};
import type { LoaderOptions } from "../loaders/LoaderRunner";
