export = EnableLibraryPlugin;
declare class EnableLibraryPlugin {
  /**
   * @param {Compiler} compiler the compiler instance
   * @param {LibraryType} type type of library
   * @returns {void}
   */
  static setEnabled(compiler: Compiler, type: LibraryType): void;
  /**
   * @param {Compiler} compiler the compiler instance
   * @param {LibraryType} type type of library
   * @returns {void}
   */
  static checkEnabled(compiler: Compiler, type: LibraryType): void;
  /**
   * @param {LibraryType} type library type that should be available
   */
  constructor(type: LibraryType);
  type: string;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace EnableLibraryPlugin {
  export { LibraryOptions, LibraryType, Compiler };
}
type Compiler = import('../Compiler');
type LibraryType = import('../../declarations/WebpackOptions').LibraryType;
type LibraryOptions =
  import('../../declarations/WebpackOptions').LibraryOptions;
