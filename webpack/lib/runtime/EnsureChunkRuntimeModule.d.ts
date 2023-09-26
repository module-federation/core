export = EnsureChunkRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
declare class EnsureChunkRuntimeModule extends RuntimeModule {
  /**
   * @param {ReadonlySet<string>} runtimeRequirements runtime requirements
   */
  constructor(runtimeRequirements: ReadonlySet<string>);
  runtimeRequirements: ReadonlySet<string>;
}
declare namespace EnsureChunkRuntimeModule {
  export { Compilation };
}
import RuntimeModule = require('../RuntimeModule');
type Compilation = import('../Compilation');
