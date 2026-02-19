export = ToBinaryRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
declare class ToBinaryRuntimeModule extends RuntimeModule {
  constructor();
}
declare namespace ToBinaryRuntimeModule {
  export { Compilation };
}
import RuntimeModule = require('../RuntimeModule');
type Compilation = import('../Compilation');
