export = SelfModuleFactory;
/** @typedef {import("./ModuleFactory").ModuleFactoryCreateData} ModuleFactoryCreateData */
/** @typedef {import("./ModuleFactory").ModuleFactoryResult} ModuleFactoryResult */
/** @typedef {import("./ModuleGraph")} ModuleGraph */
declare class SelfModuleFactory {
  /**
   * @param {ModuleGraph} moduleGraph module graph
   */
  constructor(moduleGraph: ModuleGraph);
  moduleGraph: import('./ModuleGraph');
  /**
   * @param {ModuleFactoryCreateData} data data object
   * @param {function((Error | null)=, ModuleFactoryResult=): void} callback callback
   * @returns {void}
   */
  create(
    data: ModuleFactoryCreateData,
    callback: (
      arg0: (Error | null) | undefined,
      arg1: ModuleFactoryResult | undefined,
    ) => void,
  ): void;
}
declare namespace SelfModuleFactory {
  export { ModuleFactoryCreateData, ModuleFactoryResult, ModuleGraph };
}
type ModuleFactoryCreateData =
  import('./ModuleFactory').ModuleFactoryCreateData;
type ModuleFactoryResult = import('./ModuleFactory').ModuleFactoryResult;
type ModuleGraph = import('./ModuleGraph');
