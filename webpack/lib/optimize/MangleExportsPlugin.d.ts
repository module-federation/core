export = MangleExportsPlugin;
declare class MangleExportsPlugin {
  /**
   * @param {boolean} deterministic use deterministic names
   */
  constructor(deterministic: boolean);
  _deterministic: boolean;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace MangleExportsPlugin {
  export { Compiler, ExportsInfo, ExportInfo };
}
type Compiler = import('../Compiler');
type ExportsInfo = import('../ExportsInfo');
type ExportInfo = import('../ExportsInfo').ExportInfo;
