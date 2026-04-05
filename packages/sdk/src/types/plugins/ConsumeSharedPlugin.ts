/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 * Run `pnpm generate:schema -w` to update.
 */

/**
 * A module that should be consumed from share scope.
 */
export type ConsumesItem = string;

/**
 * Advanced configuration for modules that should be consumed from share scope.
 */
export interface ConsumesConfig {
  /**
   * Include the fallback module directly instead behind an async request. This allows to use fallback module in initial load too. All possible shared modules need to be eager too.
   */
  eager?: boolean;
  /**
   * Fallback module if no shared module is found in share scope. Defaults to the property name.
   */
  import?: false | ConsumesItem;
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
   * Layer in which the shared module should be placed.
   */
  layer?: string;
  /**
   * Layer of the issuer.
   */
  issuerLayer?: string;
  /**
   * Import request to match on
   */
  request?: string;
  /**
   * Allow only a single version of the shared module in share scope (disabled by default).
   */
  singleton?: boolean;
  /**
   * Do not accept shared module if version is not valid (defaults to yes, if local fallback module is available and shared module is not a singleton, otherwise no, has no effect if there is no required version specified).
   */
  strictVersion?: boolean;
  /**
   * Filter consumed modules based on the request path.
   */
  exclude?: IncludeExcludeOptions;
  /**
   * Filter consumed modules based on the request path (only include matches).
   */
  include?: IncludeExcludeOptions;
  /**
   * Enable reconstructed lookup for node_modules paths for this share item
   */
  allowNodeModulesSuffixMatch?: boolean;
  /**
   * Tree shaking mode for the shared module.
   */
  treeShakingMode?: 'server-calc' | 'runtime-infer';
}

/**
 * Modules that should be consumed from share scope. Property names are used to match requested modules in this compilation. Relative requests are resolved, module requests are matched unresolved, absolute paths will match resolved requests. A trailing slash will match all requests with this prefix. In this case shareKey must also have a trailing slash.
 */
export interface ConsumesObject {
  [k: string]: ConsumesConfig | ConsumesItem;
}

/**
 * Modules that should be consumed from share scope. When provided, property names are used to match requested modules in this compilation.
 */
export type Consumes = (ConsumesItem | ConsumesObject)[] | ConsumesObject;

export interface IncludeExcludeOptions {
  request?: string | RegExp;
  /**
   * Semantic versioning range to match against the module's version.
   */
  version?: string;
  /**
   * Optional specific version string to check against the version range instead of reading package.json.
   */
  fallbackVersion?: string;
}

export interface ConsumeSharedPluginOptions {
  consumes: Consumes;
  /**
   * Share scope name used for all consumed modules (defaults to 'default').
   */
  shareScope?: string | string[];
  /**
   * Experimental features configuration
   */
  experiments?: {
    /** Enable reconstructed lookup for node_modules paths */
    allowNodeModulesSuffixMatch?: boolean;
  };
}
