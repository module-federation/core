export = ConsumeSharedPlugin;
declare class ConsumeSharedPlugin {
  /**
   * @param {ConsumeSharedPluginOptions} options options
   */
  constructor(options: ConsumeSharedPluginOptions);
  /** @type {[string, ConsumeOptions][]} */
  _consumes: [string, ConsumeOptions][];
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace ConsumeSharedPlugin {
  export {
    ResolveContext,
    ConsumeSharedPluginOptions,
    Compiler,
    ResolveOptionsWithDependencyType,
    SemVerRange,
    ConsumeOptions,
    DescriptionFile,
  };
}
type ResolveContext = import('enhanced-resolve').ResolveContext;
type ConsumeSharedPluginOptions =
  import('../../declarations/plugins/sharing/ConsumeSharedPlugin').ConsumeSharedPluginOptions;
type Compiler = import('../Compiler');
type ResolveOptionsWithDependencyType =
  import('../ResolverFactory').ResolveOptionsWithDependencyType;
type SemVerRange = import('../util/semver').SemVerRange;
type ConsumeOptions = import('./ConsumeSharedModule').ConsumeOptions;
type DescriptionFile = import('./utils').DescriptionFile;
