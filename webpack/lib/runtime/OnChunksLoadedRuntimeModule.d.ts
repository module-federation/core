export = OnChunksLoadedRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
declare class OnChunksLoadedRuntimeModule extends RuntimeModule {
  constructor();
}
declare namespace OnChunksLoadedRuntimeModule {
  export { Compilation };
}
import RuntimeModule = require('../RuntimeModule');
type Compilation = import('../Compilation');
