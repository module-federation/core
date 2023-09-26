export = ReadFileCompileAsyncWasmPlugin;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compiler")} Compiler */
declare class ReadFileCompileAsyncWasmPlugin {
  constructor({
    type,
    import: useImport,
  }?: {
    type?: string;
    import?: boolean;
  });
  _type: string;
  _import: boolean;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace ReadFileCompileAsyncWasmPlugin {
  export { Chunk, Compiler };
}
type Compiler = import('../Compiler');
type Chunk = import('../Chunk');
