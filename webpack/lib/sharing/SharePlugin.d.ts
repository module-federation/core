export = SharePlugin;
/**
 * @import {
 * 	ConsumesConfig
 * } from "./ConsumeSharedPlugin"
 */
/**
 * @import {
 * 	ProvidesConfig
 * } from "./ProvideSharedPlugin"
 */
/** @import Compiler from "../Compiler" */
/**
 * @inline
 * @minLength 1
 * @typedef {string} NonEmptyString
 */
/**
 * Modules that should be shared in the share scope.
 * @inline
 * @typedef {SharedItem | SharedObject} SharedBranch1Item
 */
/**
 * No provided or fallback module.
 * @inline
 * @typedef {false} SharedConfigImportBranch1
 */
/**
 * No version requirement check.
 * @inline
 * @typedef {false} SharedConfigRequiredVersionBranch1
 */
/**
 * Version as string. Can be prefixed with '^' or '~' for minimum matches. Each part of the version should be separated by a dot '.'.
 * @inline
 * @typedef {string} SharedConfigRequiredVersionBranch2
 */
/**
 * Don't provide a version.
 * @inline
 * @typedef {false} SharedConfigVersionBranch1
 */
/**
 * Version as string. Each part of the version should be separated by a dot '.'.
 * @inline
 * @typedef {string} SharedConfigVersionBranch2
 */
/**
 * Modules that should be shared in the share scope.
 * @inline
 * @typedef {SharedConfig | SharedItem} SharedObjectValue
 */
/**
 * Modules that should be shared in the share scope. When provided, property names are used to match requested modules in this compilation.
 * @typedef {SharedBranch1Item[] | SharedObject} Shared
 */
/**
 * Advanced configuration for modules that should be shared in the share scope.
 * @typedef {object} SharedConfig
 * @property {boolean=} eager Include the provided and fallback module directly instead behind an async request. This allows to use this shared module in initial load too. All possible shared modules need to be eager too.
 * @property {SharedModuleFilter=} exclude
 * @property {SharedConfigImportBranch1 | SharedItem=} import Provided module that should be provided to share scope. Also acts as fallback module if no shared module is found in share scope or version isn't valid. Defaults to the property name.
 * @property {SharedModuleFilter=} include
 * @property {NonEmptyString=} packageName Package name to determine required version from description file. This is only needed when package name can't be automatically determined from request.
 * @property {SharedConfigRequiredVersionBranch1 | SharedConfigRequiredVersionBranch2=} requiredVersion Version requirement from module in share scope.
 * @property {NonEmptyString=} shareKey Module is looked up under this key from the share scope.
 * @property {NonEmptyString=} shareScope Share scope name.
 * @property {boolean=} singleton Allow only a single version of the shared module in share scope (disabled by default).
 * @property {boolean=} strictVersion Do not accept shared module if version is not valid (defaults to yes, if local fallback module is available and shared module is not a singleton, otherwise no, has no effect if there is no required version specified).
 * @property {SharedConfigVersionBranch1 | SharedConfigVersionBranch2=} version Version of the provided module. Will replace lower matching versions, but not higher.
 */
/**
 * A module that should be shared in the share scope.
 * @typedef {NonEmptyString} SharedItem
 */
/**
 * Filters shared modules by version or request: with 'include' only matching modules are shared, with 'exclude' matching ones are not. A filtered-out module is resolved and bundled as if it wasn't shared.
 * @since 5.112.0
 * @typedef {object} SharedModuleFilter
 * @property {RegExp | NonEmptyString=} request Request remainder after a key ending in a slash (e.g. 'get' for 'lodash/get' under 'lodash/'). Has no effect on other keys.
 * @property {NonEmptyString=} version Version range the module's version (from its description file or the 'version' option) is tested against. A consumed module is tested through its fallback module, so this has no effect on consumes without one.
 */
/**
 * Modules that should be shared in the share scope. Property names are used to match requested modules in this compilation. Relative requests are resolved, module requests are matched unresolved, absolute paths will match resolved requests. A trailing slash will match all requests with this prefix. In this case shareKey must also have a trailing slash.
 * @typedef {{ [key: string]: SharedObjectValue }} SharedObject
 */
/**
 * Options for shared modules.
 * @schema plugins/sharing/SharePlugin
 * @typedef {object} SharePluginOptions
 * @property {NonEmptyString=} shareScope Share scope name used for all shared modules (defaults to 'default').
 * @property {Shared} shared
 */
declare class SharePlugin {
    /**
     * Creates an instance of SharePlugin.
     * @param {SharePluginOptions} options options
     */
    constructor(options: SharePluginOptions);
    /** @type {string | undefined} */
    _shareScope: string | undefined;
    /** @type {Record<string, ConsumesConfig>[]} */
    _consumes: Record<string, ConsumeSharedPlugin.ConsumesConfig>[];
    /** @type {Record<string, ProvidesConfig>[]} */
    _provides: Record<string, ProvideSharedPlugin.ProvidesConfig>[];
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace SharePlugin {
    export { NonEmptyString, SharedBranch1Item, SharedConfigImportBranch1, SharedConfigRequiredVersionBranch1, SharedConfigRequiredVersionBranch2, SharedConfigVersionBranch1, SharedConfigVersionBranch2, SharedObjectValue, Shared, SharedConfig, SharedItem, SharedModuleFilter, SharedObject, SharePluginOptions };
}
import ConsumeSharedPlugin = require("./ConsumeSharedPlugin");
import ProvideSharedPlugin = require("./ProvideSharedPlugin");
import type Compiler from "../Compiler";
type NonEmptyString = string;
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
 * Options for shared modules.
 */
type SharePluginOptions = {
    /**
     * Share scope name used for all shared modules (defaults to 'default').
     */
    shareScope?: NonEmptyString | undefined;
    shared: Shared;
};
