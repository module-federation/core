export = JsonModulesPlugin;
/**
 * The JsonModulesPlugin is the entrypoint plugin for the json modules feature.
 * It adds the json module type to the compiler and registers the json parser and generator.
 */
declare class JsonModulesPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   *
   */
  apply(compiler: Compiler): void;
}
declare namespace JsonModulesPlugin {
  export { Compiler, RawJsonData };
}
type Compiler = import('../Compiler');
type RawJsonData = Record<string, any>;
