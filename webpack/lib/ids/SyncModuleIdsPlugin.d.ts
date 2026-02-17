export = SyncModuleIdsPlugin;
declare class SyncModuleIdsPlugin {
  /**
   * @param {Object} options options
   * @param {string} options.path path to file
   * @param {string=} options.context context for module names
   * @param {function(Module): boolean} options.test selector for modules
   * @param {"read" | "create" | "merge" | "update"=} options.mode operation mode (defaults to merge)
   */
  constructor({
    path,
    context,
    test,
    mode,
  }: {
    path: string;
    context?: string | undefined;
    test: (arg0: Module) => boolean;
    mode?: ('read' | 'create' | 'merge' | 'update') | undefined;
  });
  _path: string;
  _context: string;
  _test: (arg0: Module) => boolean;
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
  export { Compiler, Module };
}
type Module = import('../Module');
type Compiler = import('../Compiler');
