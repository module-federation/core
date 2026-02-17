export = RuntimeChunkPlugin;
/** @typedef {import("../Compilation").EntryData} EntryData */
/** @typedef {import("../Compiler")} Compiler */
/** @typedef {import("../Entrypoint")} Entrypoint */
declare class RuntimeChunkPlugin {
  constructor(options: any);
  options: any;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace RuntimeChunkPlugin {
  export { EntryData, Compiler, Entrypoint };
}
type Compiler = import('../Compiler');
type EntryData = import('../Compilation').EntryData;
type Entrypoint = import('../Entrypoint');
