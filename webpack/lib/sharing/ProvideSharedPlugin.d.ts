export = ProvideSharedPlugin;
declare class ProvideSharedPlugin {
    /**
     * Creates an instance of ProvideSharedPlugin.
     * @param {ProvideSharedPluginOptions} options options
     */
    constructor(options: ProvideSharedPluginOptions);
    /** @type {ProvideSharedPluginOptions} */
    options: ProvideSharedPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ProvideSharedPlugin {
    export { NonEmptyString, ProvidesBranch1Item, ProvidesConfigVersionBranch1, ProvidesConfigVersionBranch2, ProvidesObjectValue, Provides, ProvidesConfig, ProvidesItem, ProvidesObject, SharedModuleFilter, ProvideSharedPluginOptions, ProvideOptions, ResolvedProvideMap };
}
import type Compiler from "../Compiler";
type NonEmptyString = string;
/**
 * Modules that should be provided as shared modules to the share scope.
 */
type ProvidesBranch1Item = ProvidesItem | ProvidesObject;
/**
 * Don't provide a version.
 */
type ProvidesConfigVersionBranch1 = false;
/**
 * Version as string. Each part of the version should be separated by a dot '.'.
 */
type ProvidesConfigVersionBranch2 = string;
/**
 * Modules that should be provided as shared modules to the share scope.
 */
type ProvidesObjectValue = ProvidesConfig | ProvidesItem;
/**
 * Modules that should be provided as shared modules to the share scope. When provided, property name is used to match modules, otherwise this is automatically inferred from share key.
 */
type Provides = ProvidesBranch1Item[] | ProvidesObject;
/**
 * Advanced configuration for modules that should be provided as shared modules to the share scope.
 */
type ProvidesConfig = {
    /**
     * Include the provided module directly instead behind an async request. This allows to use this shared module in initial load too. All possible shared modules need to be eager too.
     */
    eager?: boolean | undefined;
    exclude?: SharedModuleFilter | undefined;
    include?: SharedModuleFilter | undefined;
    /**
     * Key in the share scope under which the shared modules should be stored.
     */
    shareKey?: NonEmptyString | undefined;
    /**
     * Share scope name.
     */
    shareScope?: NonEmptyString | undefined;
    /**
     * Version of the provided module. Will replace lower matching versions, but not higher.
     */
    version?: (ProvidesConfigVersionBranch1 | ProvidesConfigVersionBranch2) | undefined;
};
/**
 * Request to a module that should be provided as shared module to the share scope (will be resolved when relative).
 */
type ProvidesItem = NonEmptyString;
/**
 * Modules that should be provided as shared modules to the share scope. Property names are used as share keys.
 */
type ProvidesObject = {
    [key: string]: ProvidesObjectValue;
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
type ProvideSharedPluginOptions = {
    provides: Provides;
    /**
     * Share scope name used for all provided modules (defaults to 'default').
     */
    shareScope?: NonEmptyString | undefined;
};
/**
 * Defines the provide options type used by this module.
 */
type ProvideOptions = {
    shareKey: string;
    shareScope: string;
    version: string | undefined | false;
    eager: boolean;
    include?: SharedModuleFilter | undefined;
    exclude?: SharedModuleFilter | undefined;
};
type ResolvedProvideMap = Map<string, {
    config: ProvideOptions;
    version: string | undefined | false;
}>;
import type { SharedModuleFilter } from "./SharePlugin";
