export = FlagEntryExportAsUsedPlugin;
declare class FlagEntryExportAsUsedPlugin {
  /**
   * @param {boolean} nsObjectUsed true, if the ns object is used
   * @param {string} explanation explanation for the reason
   */
  constructor(nsObjectUsed: boolean, explanation: string);
  nsObjectUsed: boolean;
  explanation: string;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace FlagEntryExportAsUsedPlugin {
  export { Compiler };
}
type Compiler = import('./Compiler');
