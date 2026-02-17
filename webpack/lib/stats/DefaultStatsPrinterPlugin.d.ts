export = DefaultStatsPrinterPlugin;
declare class DefaultStatsPrinterPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace DefaultStatsPrinterPlugin {
  export { Compiler, StatsPrinter, StatsPrinterContext };
}
type Compiler = import('../Compiler');
type StatsPrinter = import('./StatsPrinter');
type StatsPrinterContext = import('./StatsPrinter').StatsPrinterContext;
