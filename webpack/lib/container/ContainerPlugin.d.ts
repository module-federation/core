export = ContainerPlugin;
declare class ContainerPlugin {
    /**
     * Creates an instance of ContainerPlugin.
     * @param {ContainerPluginOptions} options options
     */
    constructor(options: ContainerPluginOptions);
    /** @type {ContainerPluginOptions} */
    options: ContainerPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ContainerPlugin {
    export { DottedIdentifier, NonEmptyRelativePath, NonEmptyString, AuxiliaryCommentBranch1, ExposesBranch1Item, ExposesObjectValue, LibraryCustomUmdObjectRootBranch1Item, LibraryExportBranch1Item, LibraryNameBranch1Item, LibraryNameBranch1, AmdContainer, AuxiliaryComment, EntryRuntime, Exposes, ExposesConfig, ExposesItem, ExposesItems, ExposesObject, LibraryCustomUmdCommentObject, LibraryCustomUmdObject, LibraryEntryExports, LibraryExport, LibraryName, LibraryOptions, LibraryType, UmdAmdContainer, UmdNamedDefine, ContainerPluginOptions };
}
import type Compiler from "../Compiler";
type DottedIdentifier = string;
type NonEmptyRelativePath = string;
type NonEmptyString = string;
/**
 * Append the same comment above each import style.
 */
type AuxiliaryCommentBranch1 = string;
/**
 * Modules that should be exposed by this container.
 */
type ExposesBranch1Item = ExposesItem | ExposesObject;
/**
 * Modules that should be exposed by this container.
 */
type ExposesObjectValue = ExposesConfig | ExposesItem | ExposesItems;
/**
 * Part of the name of the property exposed globally by a UMD library.
 */
type LibraryCustomUmdObjectRootBranch1Item = NonEmptyString;
/**
 * Part of the export that should be exposed as library.
 */
type LibraryExportBranch1Item = NonEmptyString;
/**
 * A part of the library name.
 */
type LibraryNameBranch1Item = NonEmptyString;
type LibraryNameBranch1 = LibraryNameBranch1Item[];
/**
 * Add a container for define/require functions in the AMD module.
 */
type AmdContainer = NonEmptyString;
/**
 * Add a comment in the UMD wrapper.
 */
type AuxiliaryComment = AuxiliaryCommentBranch1 | LibraryCustomUmdCommentObject;
/**
 * The name of the runtime chunk. If set a runtime chunk with this name is created or an existing entrypoint is used as runtime.
 */
type EntryRuntime = false | NonEmptyString;
/**
 * Modules that should be exposed by this container. When provided, property name is used as public name, otherwise public name is automatically inferred from request.
 */
type Exposes = ExposesBranch1Item[] | ExposesObject;
/**
 * Advanced configuration for modules that should be exposed by this container.
 */
type ExposesConfig = {
    /**
     * Request to a module that should be exposed by this container.
     */
    import: ExposesItem | ExposesItems;
    /**
     * Custom chunk name for the exposed module.
     */
    name?: string | undefined;
};
/**
 * Module that should be exposed by this container.
 */
type ExposesItem = NonEmptyString;
/**
 * Modules that should be exposed by this container.
 */
type ExposesItems = ExposesItem[];
/**
 * Modules that should be exposed by this container. Property names are used as public paths.
 */
type ExposesObject = {
    [key: string]: ExposesObjectValue;
};
/**
 * Set explicit comments for `commonjs`, `commonjs2`, `amd`, and `root`.
 */
type LibraryCustomUmdCommentObject = {
    /**
     * Set comment for `amd` section in UMD.
     */
    amd?: string | undefined;
    /**
     * Set comment for `commonjs` (exports) section in UMD.
     */
    commonjs?: string | undefined;
    /**
     * Set comment for `commonjs2` (module.exports) section in UMD.
     */
    commonjs2?: string | undefined;
    /**
     * Set comment for `root` (global variable) section in UMD.
     */
    root?: string | undefined;
};
/**
 * Description object for all UMD variants of the library name.
 */
type LibraryCustomUmdObject = {
    /**
     * Name of the exposed AMD library in the UMD.
     */
    amd?: NonEmptyString | undefined;
    /**
     * Name of the exposed commonjs export in the UMD.
     */
    commonjs?: NonEmptyString | undefined;
    /**
     * Name of the property exposed globally by a UMD library.
     */
    root?: (LibraryCustomUmdObjectRootBranch1Item[] | NonEmptyString) | undefined;
};
/**
 * Which modules of an entry the library exposes the exports of: only the last one, or all of them, where a name more than one module binds differently is left out, as 'export *' does.
 */
type LibraryEntryExports = "last" | "all";
/**
 * Specify which export should be exposed as library.
 */
type LibraryExport = LibraryExportBranch1Item[] | NonEmptyString;
/**
 * The name of the library (some types allow unnamed libraries too).
 */
type LibraryName = LibraryNameBranch1 | NonEmptyString | LibraryCustomUmdObject;
/**
 * Options for library.
 */
type LibraryOptions = {
    amdContainer?: AmdContainer | undefined;
    auxiliaryComment?: AuxiliaryComment | undefined;
    entryExports?: LibraryEntryExports | undefined;
    export?: LibraryExport | undefined;
    name?: LibraryName | undefined;
    type: LibraryType;
    umdAmdContainer?: UmdAmdContainer | undefined;
    umdNamedDefine?: UmdNamedDefine | undefined;
};
/**
 * Type of library (types included by default are 'var', 'module', 'assign', 'assign-properties', 'this', 'window', 'self', 'global', 'commonjs', 'commonjs2', 'commonjs-module', 'commonjs-static', 'amd', 'amd-require', 'umd', 'umd2', 'jsonp', 'system', but others might be added by plugins).
 */
type LibraryType = ("var" | "module" | "assign" | "assign-properties" | "this" | "window" | "self" | "global" | "commonjs" | "commonjs2" | "commonjs-module" | "commonjs-static" | "amd" | "amd-require" | "umd" | "umd2" | "jsonp" | "system") | string;
/**
 * Add a branch to the UMD wrapper for an AMD-style loader exposing `define` on a container object, given as a dot-separated path, after the `define.amd` branch.
 */
type UmdAmdContainer = DottedIdentifier;
/**
 * If `output.libraryTarget` is set to umd and `output.library` is set, setting this to true will name the AMD module.
 */
type UmdNamedDefine = boolean;
type ContainerPluginOptions = {
    exposes: Exposes;
    /**
     * The filename for this container relative path inside the `output.path` directory.
     */
    filename?: NonEmptyRelativePath | undefined;
    library?: LibraryOptions | undefined;
    /**
     * The name for this container.
     */
    name: NonEmptyString;
    runtime?: EntryRuntime | undefined;
    /**
     * The name of the share scope which is shared with the host (defaults to 'default').
     */
    shareScope?: NonEmptyString | undefined;
};
