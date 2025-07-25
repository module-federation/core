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
   * Include filters for consuming shared modules
   */
  include?: {
    /**
     * Version requirement that must be satisfied for the shared module to be included
     */
    version?: string;
    /**
     * Request pattern that must match for the shared module to be included
     */
    request?: string | RegExp;
  };
  /**
   * Exclude filters for consuming shared modules
   */
  exclude?: {
    /**
     * Version requirement that if satisfied will exclude the shared module
     */
    version?: string;
    /**
     * Request pattern that if matched will exclude the shared module
     */
    request?: string | RegExp;
  };
};
