export = VirtualUrlPlugin;
/**
 * @typedef {object} VirtualUrlPluginOptions
 * @property {VirtualModules} modules - The virtual modules
 * @property {string=} scheme - The URL scheme to use
 */
declare class VirtualUrlPlugin {
  /**
   * @param {VirtualModules} modules The virtual modules
   * @param {string=} scheme The URL scheme to use
   */
  constructor(modules: VirtualModules, scheme?: string | undefined);
  scheme: string;
  modules: {
    [key: string]: VirtualModuleConfig;
  };
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
  /**
   * @param {string} id The module id
   * @returns {VirtualModuleConfig} The virtual module config
   */
  findVirtualModuleConfigById(id: string): VirtualModuleConfig;
  /**
   * Get the cache version for a given version value
   * @param {VersionFn | true | string} version The version value or function
   * @returns {string | undefined} The cache version
   */
  getCacheVersion(version: VersionFn | true | string): string | undefined;
}
declare namespace VirtualUrlPlugin {
  export {
    DEFAULT_SCHEME,
    SourceFn,
    VersionFn,
    VirtualModuleConfig,
    VirtualModuleInput,
    VirtualModules,
    Compiler,
    NormalModule,
    LoaderContext,
    VirtualUrlPluginOptions,
  };
}
declare const DEFAULT_SCHEME: 'virtual';
type SourceFn = (
  loaderContext: LoaderContext<EXPECTED_ANY>,
) => Promise<string | Buffer> | string | Buffer;
type VersionFn = () => string;
type VirtualModuleConfig = {
  /**
   * the module type
   */
  type?: string | undefined;
  /**
   * the source function
   */
  source: SourceFn;
  /**
   * optional version function or value
   */
  version?: (VersionFn | true | string) | undefined;
};
type VirtualModuleInput = string | SourceFn | VirtualModuleConfig;
type VirtualModules = {
  [key: string]: VirtualModuleInput;
};
type Compiler = import('../Compiler');
type NormalModule = import('../NormalModule');
type LoaderContext<T> =
  import('../../declarations/LoaderContext').LoaderContext<T>;
type VirtualUrlPluginOptions = {
  /**
   * - The virtual modules
   */
  modules: VirtualModules;
  /**
   * - The URL scheme to use
   */
  scheme?: string | undefined;
};
