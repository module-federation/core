import type { SemVerRange } from 'webpack/lib/util/semver';

export interface ConsumeSharedModuleExcludeOptions {
  request?: string | RegExp;
  version?: string;
  fallbackVersion?: string;
}

export interface ConsumeSharedModuleIncludeOptions {
  request?: string | RegExp;
  version?: string;
  fallbackVersion?: string;
}

export type ConsumeOptions = {
  /**
   * fallback request
   */
  import?: string | undefined;
  /**
   * resolved fallback request
   */
  importResolved?: string | undefined;
  /**
   * The actual request to use for importing the module. If not specified, the property name/key will be used.
   */
  request?: string;
  /**
   * global share key
   */
  shareKey: string;
  /**
   * share scope
   */
  shareScope: string | string[];
  /**
   * version requirement
   */
  requiredVersion:
    | import('webpack/lib/util/semver').SemVerRange
    | false
    | undefined;
  /**
   * package name to determine required version automatically
   */
  packageName: string;
  /**
   * don't use shared version even if version isn't valid
   */
  strictVersion: boolean;
  /**
   * use single global version
   */
  singleton: boolean;
  /**
   * include the fallback module in a sync way
   */
  eager: boolean;
  /**
   * Share a specific layer of the module, if the module supports layers
   */
  layer?: string | null;
  /**
   * Issuer layer in which the module should be resolved
   */
  issuerLayer?: string | null;
  /**
   * Filter object for consuming shared modules.
   * Modules matching the criteria in this object will be excluded.
   */
  exclude?: ConsumeSharedModuleExcludeOptions;
  /**
   * Filter object for consuming shared modules.
   * Only modules matching the criteria in this object will be included.
   */
  include?: ConsumeSharedModuleIncludeOptions;
  /**
   * Enable reconstructed lookup for node_modules paths for this share item
   */
  nodeModulesReconstructedLookup?: boolean;
};
const TYPES = new Set(['consume-shared']);
