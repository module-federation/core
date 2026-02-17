export = PlatformPlugin;
/**
 * Should be used only for "target === false" or
 * when you want to overwrite platform target properties
 */
declare class PlatformPlugin {
  /**
   * @param {Partial<PlatformTargetProperties>} platform target properties
   */
  constructor(platform: Partial<PlatformTargetProperties>);
  /** @type {Partial<PlatformTargetProperties>} */
  platform: Partial<PlatformTargetProperties>;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace PlatformPlugin {
  export { Compiler, PlatformTargetProperties };
}
type Compiler = import('./Compiler');
type PlatformTargetProperties =
  import('./config/target').PlatformTargetProperties;
