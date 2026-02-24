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
   * @param {EnableLibraryPluginOptions} options options of EnableLibraryPlugin
   */
  constructor(type: LibraryType, options?: EnableLibraryPluginOptions);
  /** @type {LibraryType} */
  type: LibraryType;
  /** @type {EnableLibraryPluginOptions} */
  options: EnableLibraryPluginOptions;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace EnableLibraryPlugin {
  export { LibraryType, Compiler, LibraryTypes, EnableLibraryPluginOptions };
}
type LibraryType = import('../../declarations/WebpackOptions').LibraryType;
type Compiler = import('../Compiler');
type LibraryTypes = Set<LibraryType>;
type EnableLibraryPluginOptions = {
  /**
   * function that runs when applying the current plugin.
   */
  additionalApply?: (() => void) | undefined;
};
