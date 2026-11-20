export = DllReferencePlugin;
declare class DllReferencePlugin {
    /**
     * Creates an instance of DllReferencePlugin.
     * @param {DllReferencePluginOptions} options options object
     */
    constructor(options: DllReferencePluginOptions);
    /** @type {DllReferencePluginOptions} */
    options: DllReferencePluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace DllReferencePlugin {
    export { AbsolutePath, NonEmptyString, DllReferencePluginOptionsContentValueExportsBranch1Item, DllReferencePluginOptionsContentValueExportsBranch1, DllReferencePluginOptionsContentValueExportsBranch2, DllReferencePluginOptionsContentValue, DllReferencePluginOptionsBranch1ObjectExtensionsItem, DllReferencePluginOptionsBranch1Object, DllReferencePluginOptionsBranch2ObjectExtensionsItem, DllReferencePluginOptionsBranch2Object, DllReferencePluginOptionsContent, DllReferencePluginOptionsManifest, DllReferencePluginOptionsSourceType, DllReferencePluginOptions, CompilationDataItem };
}
import type Compiler from "../Compiler";
type AbsolutePath = string;
type NonEmptyString = string;
/**
 * Name of the export.
 */
type DllReferencePluginOptionsContentValueExportsBranch1Item = NonEmptyString;
/**
 * List of provided exports of the module.
 */
type DllReferencePluginOptionsContentValueExportsBranch1 = DllReferencePluginOptionsContentValueExportsBranch1Item[];
/**
 * Exports unknown/dynamic.
 */
type DllReferencePluginOptionsContentValueExportsBranch2 = true;
/**
 * Module info.
 */
type DllReferencePluginOptionsContentValue = {
    /**
     * Meta information about the module.
     */
    buildMeta?: {
        [key: string]: EXPECTED_ANY;
    } | undefined;
    /**
     * Information about the provided exports of the module.
     */
    exports?: (DllReferencePluginOptionsContentValueExportsBranch1 | DllReferencePluginOptionsContentValueExportsBranch2) | undefined;
    /**
     * Module ID.
     */
    id: number | NonEmptyString;
};
/**
 * An extension.
 */
type DllReferencePluginOptionsBranch1ObjectExtensionsItem = string;
type DllReferencePluginOptionsBranch1Object = {
    /**
     * Context of requests in the manifest (or content property) as absolute path.
     */
    context?: AbsolutePath | undefined;
    /**
     * Extensions used to resolve modules in the dll bundle (only used when using 'scope').
     */
    extensions?: DllReferencePluginOptionsBranch1ObjectExtensionsItem[] | undefined;
    /**
     * An object containing content and name or a string to the absolute path of the JSON manifest to be loaded upon compilation.
     */
    manifest: AbsolutePath | DllReferencePluginOptionsManifest;
    /**
     * The name where the dll is exposed (external name, defaults to manifest.name).
     */
    name?: NonEmptyString | undefined;
    /**
     * Prefix which is used for accessing the content of the dll.
     */
    scope?: NonEmptyString | undefined;
    /**
     * How the dll is exposed (libraryTarget, defaults to manifest.type).
     */
    sourceType?: DllReferencePluginOptionsSourceType | undefined;
    /**
     * The way how the export of the dll bundle is used.
     */
    type?: ("require" | "object") | undefined;
};
/**
 * An extension.
 */
type DllReferencePluginOptionsBranch2ObjectExtensionsItem = string;
type DllReferencePluginOptionsBranch2Object = {
    content: DllReferencePluginOptionsContent;
    /**
     * Context of requests in the manifest (or content property) as absolute path.
     */
    context?: AbsolutePath | undefined;
    /**
     * Extensions used to resolve modules in the dll bundle (only used when using 'scope').
     */
    extensions?: DllReferencePluginOptionsBranch2ObjectExtensionsItem[] | undefined;
    /**
     * The name where the dll is exposed (external name).
     */
    name: NonEmptyString;
    /**
     * Prefix which is used for accessing the content of the dll.
     */
    scope?: NonEmptyString | undefined;
    /**
     * How the dll is exposed (libraryTarget).
     */
    sourceType?: DllReferencePluginOptionsSourceType | undefined;
    /**
     * The way how the export of the dll bundle is used.
     */
    type?: ("require" | "object") | undefined;
};
/**
 * The mappings from request to module info.
 */
type DllReferencePluginOptionsContent = {
    [key: string]: DllReferencePluginOptionsContentValue;
};
/**
 * An object containing content, name and type.
 */
type DllReferencePluginOptionsManifest = {
    content: DllReferencePluginOptionsContent;
    /**
     * The name where the dll is exposed (external name).
     */
    name?: NonEmptyString | undefined;
    type?: DllReferencePluginOptionsSourceType | undefined;
};
/**
 * The type how the dll is exposed (external type).
 */
type DllReferencePluginOptionsSourceType = "var" | "assign" | "this" | "window" | "global" | "commonjs" | "commonjs2" | "commonjs-module" | "amd" | "amd-require" | "umd" | "umd2" | "jsonp" | "system";
type DllReferencePluginOptions = DllReferencePluginOptionsBranch1Object | DllReferencePluginOptionsBranch2Object;
type CompilationDataItem = {
    path: string;
    data: DllReferencePluginOptionsManifest | undefined;
    error: Error | undefined;
};
