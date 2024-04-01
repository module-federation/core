export = EnableWasmLoadingPlugin;
declare class EnableWasmLoadingPlugin {
  /**
   * @param {Compiler} compiler the compiler instance
   * @param {WasmLoadingType} type type of library
   * @returns {void}
   */
  static setEnabled(compiler: Compiler, type: WasmLoadingType): void;
  /**
   * @param {Compiler} compiler the compiler instance
   * @param {WasmLoadingType} type type of library
   * @returns {void}
   */
  static checkEnabled(compiler: Compiler, type: WasmLoadingType): void;
  /**
   * @param {WasmLoadingType} type library type that should be available
   */
  constructor(type: WasmLoadingType);
  type: string;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace EnableWasmLoadingPlugin {
  export { LibraryOptions, WasmLoadingType, Compiler };
}
type Compiler = import('../Compiler');
type WasmLoadingType =
  import('../../declarations/WebpackOptions').WasmLoadingType;
type LibraryOptions =
  import('../../declarations/WebpackOptions').LibraryOptions;
