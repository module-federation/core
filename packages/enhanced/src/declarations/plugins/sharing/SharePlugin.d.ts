/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 * Run `yarn special-lint-fix` to update
 */

/**
 * Modules that should be shared in the share scope. When provided, property names are used to match requested modules in this compilation.
 */
export type Shared = (SharedItem | SharedObject)[] | SharedObject;
/**
 * A module that should be shared in the share scope.
 */
export type SharedItem = string;

/**
 * Options for shared modules.
 */
export interface SharePluginOptions {
  /**
   * Share scope name used for all shared modules (defaults to 'default').
   */
  shareScope?: string | string[];
  /**
   * Modules that should be shared in the share scope. When provided, property names are used to match requested modules in this compilation.
   */
  shared: Shared;
}
/**
 * Modules that should be shared in the share scope. Property names are used to match requested modules in this compilation. Relative requests are resolved, module requests are matched unresolved, absolute paths will match resolved requests. A trailing slash will match all requests with this prefix. In this case shareKey must also have a trailing slash.
 */
export interface SharedObject {
  /**
   * Modules that should be shared in the share scope.
   */
  [k: string]: SharedConfig | SharedItem;
}
/**
 * Advanced configuration for modules that should be shared in the share scope.
 */
export interface SharedConfig {
  /**
   * Include the provided and fallback module directly instead behind an async request. This allows to use this shared module in initial load too. All possible shared modules need to be eager too.
   */
  eager?: boolean;
  /**
   * Provided module that should be provided to share scope. Also acts as fallback module if no shared module is found in share scope or version isn't valid. Defaults to the property name.
   */
  import?: false | SharedItem;
  /**
   * Package name to determine required version from description file. This is only needed when package name can't be automatically determined from request.
   */
  packageName?: string;
  /**
   * Version requirement from module in share scope.
   */
  requiredVersion?: false | string;
  /**
   * Module is looked up under this key from the share scope.
   */
  shareKey?: string;
  /**
   * Share scope name.
   */
  shareScope?: string | string[];
  /**
   * Allow only a single version of the shared module in share scope (disabled by default).
   */
  singleton?: boolean;
  /**
   * Do not accept shared module if version is not valid (defaults to yes, if local fallback module is available and shared module is not a singleton, otherwise no, has no effect if there is no required version specified).
   */
  strictVersion?: boolean;
  /**
   * Version of the provided module. Will replace lower matching versions, but not higher.
   */
  version?: false | string;
  /**
   * Issuer layer in which the module should be resolved.
   */
  issuerLayer?: string;
  /**
   * Layer for the shared module.
   */
  layer?: string;
  /**
   * The actual request to use for importing the module. Defaults to the property name.
   */
  request?: string;
  /**
   * Filter for the shared module.
   */
  exclude?: IncludeExcludeOptions;
  /**
   * Filter for the shared module.
   */
  include?: IncludeExcludeOptions;
  /**
   * Node modules reconstructed lookup.
   */
  nodeModulesReconstructedLookup?: boolean;
}

export interface IncludeExcludeOptions {
  request?: string | RegExp;
  version?: string;
  fallbackVersion?: string;
}
