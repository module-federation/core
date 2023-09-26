export = GetMainFilenameRuntimeModule;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compilation")} Compilation */
declare class GetMainFilenameRuntimeModule extends RuntimeModule {
  /**
   * @param {string} name readable name
   * @param {string} global global object binding
   * @param {string} filename main file name
   */
  constructor(name: string, global: string, filename: string);
  global: string;
  filename: string;
}
declare namespace GetMainFilenameRuntimeModule {
  export { Chunk, Compilation };
}
import RuntimeModule = require('../RuntimeModule');
type Chunk = import('../Chunk');
type Compilation = import('../Compilation');
