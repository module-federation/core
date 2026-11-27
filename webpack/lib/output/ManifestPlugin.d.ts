export = ManifestPlugin;
declare class ManifestPlugin {
    /**
     * Creates an instance of ManifestPlugin.
     * @param {ManifestPluginOptions} options options
     */
    constructor(options?: ManifestPluginOptions);
    /** @type {ManifestPluginOptions} */
    options: ManifestPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ManifestPlugin {
    export { NonEmptyString, NonEmptyRelativePath, ManifestImportName, ManifestParentName, ManifestEntrypoint, ManifestItem, ManifestObjectKnown, ManifestObjectUnknown, ManifestObject, ManifestPluginOptions, Filter, Generate, Serialize };
}
import type Compiler from "../Compiler";
type NonEmptyString = string;
type NonEmptyRelativePath = string;
/**
 * The name of file.
 */
type ManifestImportName = NonEmptyString;
/**
 * The entrypoint name.
 */
type ManifestParentName = NonEmptyString;
/**
 * Describes a manifest entrypoint.
 */
type ManifestEntrypoint = {
    /**
     * Contains the names of entrypoints.
     */
    imports: ManifestImportName[];
    /**
     * Contains the names of parent entrypoints.
     */
    parents?: ManifestParentName[] | undefined;
};
/**
 * Describes a manifest asset that links the emitted path to the producing asset.
 */
type ManifestItem = {
    /**
     * The path absolute URL (this indicates that the path is absolute from the server's root directory) to file.
     */
    file: string;
    /**
     * The source path relative to the context.
     */
    src?: string | undefined;
};
/**
 * The manifest object.
 */
type ManifestObjectKnown = {
    /**
     * Contains the names of assets.
     */
    assets: Record<string, ManifestItem>;
    /**
     * Contains the names of entrypoints.
     */
    entrypoints: Record<string, ManifestEntrypoint>;
};
type ManifestObjectUnknown = Record<string, EXPECTED_ANY>;
type ManifestObject = ManifestObjectKnown & ManifestObjectUnknown;
type ManifestPluginOptions = {
    /**
     * Enables/disables generation of the entrypoints manifest section.
     */
    entrypoints?: boolean | undefined;
    /**
     * Specifies the filename of the output file on disk. By default the plugin will emit `manifest.json` inside the 'output.path' directory.
     */
    filename?: NonEmptyRelativePath | undefined;
    /**
     * Allows filtering the files which make up the manifest.
     */
    filter?: import("./ManifestPlugin").Filter | undefined;
    /**
     * A function that receives the manifest object, modifies it, and returns the modified manifest.
     */
    generate?: import("./ManifestPlugin").Generate | undefined;
    /**
     * Specifies a path prefix for all keys in the manifest.
     */
    prefix?: string | undefined;
    /**
     * A function that receives the manifest object and returns the manifest string.
     */
    serialize?: import("./ManifestPlugin").Serialize | undefined;
};
type Filter = (item: ManifestItem) => boolean;
type Generate = (manifest: ManifestObject) => ManifestObject;
type Serialize = (manifest: ManifestObject) => string;
