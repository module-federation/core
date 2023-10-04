export = EvalDevToolModulePlugin;
declare class EvalDevToolModulePlugin {
  constructor(options: any);
  namespace: any;
  sourceUrlComment: any;
  moduleFilenameTemplate: any;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace EvalDevToolModulePlugin {
  export { Source, Compiler };
}
type Compiler = import('./Compiler');
type Source = any;
