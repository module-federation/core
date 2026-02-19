export = SyncModuleIdsPlugin;
/**
 * @typedef {object} SyncModuleIdsPluginOptions
 * @property {string} path path to file
 * @property {string=} context context for module names
 * @property {((module: Module) => boolean)=} test selector for modules
 * @property {"read" | "create" | "merge" | "update"=} mode operation mode (defaults to merge)
 */
declare class SyncModuleIdsPlugin {
  /**
   * @param {SyncModuleIdsPluginOptions} options options
   */
  constructor({ path, context, test, mode }: SyncModuleIdsPluginOptions);
  _path: string;
  _context: string;
  _test: (module: Module) => boolean;
  _read: boolean;
  _write: boolean;
  _prune: boolean;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace SyncModuleIdsPlugin {
  export {
    Compiler,
    Module,
    ModuleId,
    IntermediateFileSystem,
    SyncModuleIdsPluginOptions,
  };
}
type Compiler = import('../Compiler');
type Module = import('../Module');
type ModuleId = import('../Module').ModuleId;
type IntermediateFileSystem = import('../util/fs').IntermediateFileSystem;
type SyncModuleIdsPluginOptions = {
  /**
   * path to file
   */
  path: string;
  /**
   * context for module names
   */
  context?: string | undefined;
  /**
   * selector for modules
   */
  test?: ((module: Module) => boolean) | undefined;
  /**
   * operation mode (defaults to merge)
   */
  mode?: ('read' | 'create' | 'merge' | 'update') | undefined;
};
