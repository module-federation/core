export = ExternalModuleFactoryPlugin;
declare class ExternalModuleFactoryPlugin {
  /**
   * @param {string | undefined} type default external type
   * @param {Externals} externals externals config
   */
  constructor(type: string | undefined, externals: Externals);
  type: string;
  externals: import('../declarations/WebpackOptions').Externals;
  /**
   * @param {NormalModuleFactory} normalModuleFactory the normal module factory
   * @returns {void}
   */
  apply(normalModuleFactory: NormalModuleFactory): void;
}
declare namespace ExternalModuleFactoryPlugin {
  export { Externals, NormalModuleFactory };
}
type NormalModuleFactory = import('./NormalModuleFactory');
type Externals = import('../declarations/WebpackOptions').Externals;
