export = RuntimePlugin;
declare class RuntimePlugin {
  /**
   * @param {Compiler} compiler the Compiler
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace RuntimePlugin {
  export { LibraryOptions, Chunk, Compiler };
}
type LibraryOptions = import('../declarations/WebpackOptions').LibraryOptions;
type Chunk = import('./Chunk');
type Compiler = import('./Compiler');
