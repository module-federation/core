export = ConsumeSharedPlugin;
declare class ConsumeSharedPlugin {
    /**
     * Creates an instance of ConsumeSharedPlugin.
     * @param {ConsumeSharedPluginOptions} options options
     */
    constructor(options: ConsumeSharedPluginOptions);
    /** @type {ConsumeSharedPluginOptions} */
    options: ConsumeSharedPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ConsumeSharedPlugin {
    export { NonEmptyString, ConsumesBranch1Item, ConsumesConfigImportBranch1, ConsumesConfigRequiredVersionBranch1, ConsumesConfigRequiredVersionBranch2, ConsumesObjectValue, Consumes, ConsumesConfig, ConsumesItem, ConsumesObject, SharedModuleFilter, ConsumeSharedPluginOptions, ConsumeConfig };
}
import type Compiler from "../Compiler";
type NonEmptyString = string;
/**
 * Modules that should be consumed from share scope.
 */
type ConsumesBranch1Item = ConsumesItem | ConsumesObject;
/**
 * No fallback module.
 */
type ConsumesConfigImportBranch1 = false;
/**
 * No version requirement check.
 */
type ConsumesConfigRequiredVersionBranch1 = false;
/**
 * Version as string. Can be prefixed with '^' or '~' for minimum matches. Each part of the version should be separated by a dot '.'.
 */
type ConsumesConfigRequiredVersionBranch2 = string;
/**
 * Modules that should be consumed from share scope.
 */
type ConsumesObjectValue = ConsumesConfig | ConsumesItem;
/**
 * Modules that should be consumed from share scope. When provided, property names are used to match requested modules in this compilation.
 */
type Consumes = ConsumesBranch1Item[] | ConsumesObject;
/**
 * Advanced configuration for modules that should be consumed from share scope.
 */
type ConsumesConfig = {
    /**
     * Include the fallback module directly instead behind an async request. This allows to use fallback module in initial load too. All possible shared modules need to be eager too.
     */
    eager?: boolean | undefined;
    exclude?: SharedModuleFilter | undefined;
    /**
     * Fallback module if no shared module is found in share scope. Defaults to the property name.
     */
    import?: (ConsumesConfigImportBranch1 | ConsumesItem) | undefined;
    include?: SharedModuleFilter | undefined;
    /**
     * Package name to determine required version from description file. This is only needed when package name can't be automatically determined from request.
     */
    packageName?: NonEmptyString | undefined;
    /**
     * Version requirement from module in share scope.
     */
    requiredVersion?: (ConsumesConfigRequiredVersionBranch1 | ConsumesConfigRequiredVersionBranch2) | undefined;
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
};
/**
 * A module that should be consumed from share scope.
 */
type ConsumesItem = NonEmptyString;
/**
 * Modules that should be consumed from share scope. Property names are used to match requested modules in this compilation. Relative requests are resolved, module requests are matched unresolved, absolute paths will match resolved requests. A trailing slash will match all requests with this prefix. In this case shareKey must also have a trailing slash.
 */
type ConsumesObject = {
    [key: string]: ConsumesObjectValue;
};
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
 * Options for consuming shared modules.
 */
type ConsumeSharedPluginOptions = {
    consumes: Consumes;
    /**
     * Share scope name used for all consumed modules (defaults to 'default').
     */
    shareScope?: NonEmptyString | undefined;
};
/**
 * Consume options plus the filters deciding which matched requests are consumed.
 */
type ConsumeConfig = ConsumeSharedModule.ConsumeOptions & {
    include?: SharedModuleFilter;
    exclude?: SharedModuleFilter;
};
import type { SharedModuleFilter } from "./SharePlugin";
import ConsumeSharedModule = require("./ConsumeSharedModule");
