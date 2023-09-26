export = OccurrenceModuleIdsPlugin;
declare class OccurrenceModuleIdsPlugin {
  /**
   * @param {OccurrenceModuleIdsPluginOptions=} options options object
   */
  constructor(options?: OccurrenceModuleIdsPluginOptions | undefined);
  options: import('../../declarations/plugins/ids/OccurrenceModuleIdsPlugin').OccurrenceModuleIdsPluginOptions;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace OccurrenceModuleIdsPlugin {
  export {
    OccurrenceModuleIdsPluginOptions,
    Compiler,
    Module,
    ModuleGraphConnection,
  };
}
type Compiler = import('../Compiler');
type OccurrenceModuleIdsPluginOptions =
  import('../../declarations/plugins/ids/OccurrenceModuleIdsPlugin').OccurrenceModuleIdsPluginOptions;
type Module = import('../Module');
type ModuleGraphConnection = import('../ModuleGraphConnection');
