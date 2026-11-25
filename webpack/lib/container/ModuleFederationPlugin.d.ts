export = ModuleFederationPlugin;
declare class ModuleFederationPlugin {
    /**
     * Creates an instance of ModuleFederationPlugin.
     * @param {ModuleFederationPluginOptions} options options
     */
    constructor(options: ModuleFederationPluginOptions);
    /** @type {ModuleFederationPluginOptions} */
    options: ModuleFederationPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ModuleFederationPlugin {
    export { getCompilationHooks, DottedIdentifier, NonEmptyString, RelativePath, AuxiliaryCommentBranch1, ExposesBranch1Item, ExposesObjectValue, LibraryCustomUmdObjectRootBranch1Item, LibraryExportBranch1Item, LibraryNameBranch1Item, LibraryNameBranch1, RemotesBranch1Item, RemotesObjectValue, SharedBranch1Item, SharedConfigImportBranch1, SharedConfigRequiredVersionBranch1, SharedConfigRequiredVersionBranch2, SharedConfigVersionBranch1, SharedConfigVersionBranch2, SharedObjectValue, AmdContainer, AuxiliaryComment, EntryRuntime, Exposes, ExposesConfig, ExposesItem, ExposesItems, ExposesObject, ExternalsType, LibraryCustomUmdCommentObject, LibraryCustomUmdObject, LibraryEntryExports, LibraryExport, LibraryName, LibraryOptions, LibraryType, Remotes, RemotesConfig, RemotesItem, RemotesItems, RemotesObject, Shared, SharedConfig, SharedItem, SharedModuleFilter, SharedObject, UmdAmdContainer, UmdNamedDefine, ModuleFederationPluginOptions };
}
import type Compiler from "../Compiler";
import getCompilationHooks = require("./moduleFederationHooks");
type DottedIdentifier = string;
type NonEmptyString = string;
type RelativePath = string;
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
 * Container locations and request scopes from which modules should be resolved and loaded at runtime.
 */
type RemotesBranch1Item = RemotesItem | RemotesObject;
/**
 * Container locations from which modules should be resolved and loaded at runtime.
 */
type RemotesObjectValue = RemotesConfig | RemotesItem | RemotesItems;
/**
 * Modules that should be shared in the share scope.
 */
type SharedBranch1Item = SharedItem | SharedObject;
/**
 * No provided or fallback module.
 */
type SharedConfigImportBranch1 = false;
/**
 * No version requirement check.
 */
type SharedConfigRequiredVersionBranch1 = false;
/**
 * Version as string. Can be prefixed with '^' or '~' for minimum matches. Each part of the version should be separated by a dot '.'.
 */
type SharedConfigRequiredVersionBranch2 = string;
/**
 * Don't provide a version.
 */
type SharedConfigVersionBranch1 = false;
/**
 * Version as string. Each part of the version should be separated by a dot '.'.
 */
type SharedConfigVersionBranch2 = string;
/**
 * Modules that should be shared in the share scope.
 */
type SharedObjectValue = SharedConfig | SharedItem;
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
 * Specifies the default type of externals ('amd*', 'umd*', 'system' and 'jsonp' depend on output.libraryTarget set to the same value).
 */
type ExternalsType = "var" | "module" | "assign" | "this" | "window" | "self" | "global" | "commonjs" | "commonjs2" | "commonjs-module" | "commonjs-static" | "amd" | "amd-require" | "amd-async" | "umd" | "umd2" | "jsonp" | "system" | "promise" | "import" | "module-import" | "script" | "node-commonjs" | "asset" | "asset-url" | "css-import" | "css-url";
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
 * Container locations and request scopes from which modules should be resolved and loaded at runtime. When provided, property name is used as request scope, otherwise request scope is automatically inferred from container location.
 */
type Remotes = RemotesBranch1Item[] | RemotesObject;
/**
 * Advanced configuration for container locations from which modules should be resolved and loaded at runtime.
 */
type RemotesConfig = {
    /**
     * Container locations from which modules should be resolved and loaded at runtime.
     */
    external: RemotesItem | RemotesItems;
    /**
     * The name of the share scope shared with this remote.
     */
    shareScope?: NonEmptyString | undefined;
};
/**
 * Container location from which modules should be resolved and loaded at runtime.
 */
type RemotesItem = NonEmptyString;
/**
 * Container locations from which modules should be resolved and loaded at runtime.
 */
type RemotesItems = RemotesItem[];
/**
 * Container locations from which modules should be resolved and loaded at runtime. Property names are used as request scopes.
 */
type RemotesObject = {
    [key: string]: RemotesObjectValue;
};
/**
 * Modules that should be shared in the share scope. When provided, property names are used to match requested modules in this compilation.
 */
type Shared = SharedBranch1Item[] | SharedObject;
/**
 * Advanced configuration for modules that should be shared in the share scope.
 */
type SharedConfig = {
    /**
     * Include the provided and fallback module directly instead behind an async request. This allows to use this shared module in initial load too. All possible shared modules need to be eager too.
     */
    eager?: boolean | undefined;
    exclude?: SharedModuleFilter | undefined;
    /**
     * Provided module that should be provided to share scope. Also acts as fallback module if no shared module is found in share scope or version isn't valid. Defaults to the property name.
     */
    import?: (SharedConfigImportBranch1 | SharedItem) | undefined;
    include?: SharedModuleFilter | undefined;
    /**
     * Package name to determine required version from description file. This is only needed when package name can't be automatically determined from request.
     */
    packageName?: NonEmptyString | undefined;
    /**
     * Version requirement from module in share scope.
     */
    requiredVersion?: (SharedConfigRequiredVersionBranch1 | SharedConfigRequiredVersionBranch2) | undefined;
    /**
     * Module is looked up under this key from the share scope.
     */
    shareKey?: NonEmptyString | undefined;
    /**
     * Share scope name.
     */
    shareScope?: NonEmptyString | undefined;
    /**
     * Allow only a single version of the shared module in share scope (disabled by default).
     */
    singleton?: boolean | undefined;
    /**
     * Do not accept shared module if version is not valid (defaults to yes, if local fallback module is available and shared module is not a singleton, otherwise no, has no effect if there is no required version specified).
     */
    strictVersion?: boolean | undefined;
    /**
     * Version of the provided module. Will replace lower matching versions, but not higher.
     */
    version?: (SharedConfigVersionBranch1 | SharedConfigVersionBranch2) | undefined;
};
/**
 * A module that should be shared in the share scope.
 */
type SharedItem = NonEmptyString;
/**
 * Filters shared modules by version or request: with 'include' only matching modules are shared, with 'exclude' matching ones are not. A filtered-out module is resolved and bundled as if it wasn't shared.
 */
type SharedModuleFilter = {
    /**
     * Request remainder after a key ending in a slash (e.g. 'get' for 'lodash/get' under 'lodash/'). Has no effect on other keys.
     */
    request?: (RegExp | NonEmptyString) | undefined;
    /**
     * Version range the module's version (from its description file or the 'version' option) is tested against. A consumed module is tested through its fallback module, so this has no effect on consumes without one.
     */
    version?: NonEmptyString | undefined;
};
/**
 * Modules that should be shared in the share scope. Property names are used to match requested modules in this compilation. Relative requests are resolved, module requests are matched unresolved, absolute paths will match resolved requests. A trailing slash will match all requests with this prefix. In this case shareKey must also have a trailing slash.
 */
type SharedObject = {
    [key: string]: SharedObjectValue;
};
/**
 * Add a branch to the UMD wrapper for an AMD-style loader exposing `define` on a container object, given as a dot-separated path, after the `define.amd` branch.
 */
type UmdAmdContainer = DottedIdentifier;
/**
 * If `output.libraryTarget` is set to umd and `output.library` is set, setting this to true will name the AMD module.
 */
type UmdNamedDefine = boolean;
type ModuleFederationPluginOptions = {
    exposes?: Exposes | undefined;
    /**
     * The filename of the container as relative path inside the `output.path` directory.
     */
    filename?: RelativePath | undefined;
    library?: LibraryOptions | undefined;
    /**
     * The name of the container.
     */
    name?: string | undefined;
    /**
     * The external type of the remote containers.
     */
    remoteType?: ExternalsType | undefined;
    remotes?: Remotes | undefined;
    runtime?: EntryRuntime | undefined;
    /**
     * Share scope name used for all shared modules (defaults to 'default').
     */
    shareScope?: NonEmptyString | undefined;
    shared?: Shared | undefined;
};
