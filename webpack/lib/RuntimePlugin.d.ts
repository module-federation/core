export = RuntimePlugin;
declare class RuntimePlugin {
  /**
   * @param {Compiler} compiler the Compiler
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace RuntimePlugin {
  export { Chunk, Compiler, Module };
}
type Compiler = import('./Compiler');
type Chunk = import('./Chunk');
type Module = import('./Module');
