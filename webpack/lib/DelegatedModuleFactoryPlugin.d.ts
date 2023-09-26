export = DelegatedModuleFactoryPlugin;
/** @typedef {import("./NormalModuleFactory")} NormalModuleFactory */
declare class DelegatedModuleFactoryPlugin {
  constructor(options: any);
  options: any;
  /**
   * @param {NormalModuleFactory} normalModuleFactory the normal module factory
   * @returns {void}
   */
  apply(normalModuleFactory: NormalModuleFactory): void;
}
declare namespace DelegatedModuleFactoryPlugin {
  export { NormalModuleFactory };
}
type NormalModuleFactory = import('./NormalModuleFactory');
