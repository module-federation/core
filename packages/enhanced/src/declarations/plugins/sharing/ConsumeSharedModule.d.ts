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
   * Filter object for consuming shared modules.
   */
  exclude?: {
    /**
     * RegExp to filter requests for prefix consumes.
     * Applied to the part of the request after the prefix.
     */
    request?: RegExp;
    /**
     * Version range to filter against. Modules matching this range will be excluded.
     */
    version?: string;
    /**
     * Optional specific version to check against the filter.version range.
     * If provided, this is used instead of reading from package.json.
     */
    fallbackVersion?: string;
  };
  /**
   * Share a specific layer of the module, if the module supports layers
   */
  layer?: string | null;
  /**
   * Issuer layer in which the module should be resolved
   */
  issuerLayer?: string | null;
};
