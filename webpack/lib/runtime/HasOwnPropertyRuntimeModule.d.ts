export = HasOwnPropertyRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
declare class HasOwnPropertyRuntimeModule extends RuntimeModule {
  constructor();
}
declare namespace HasOwnPropertyRuntimeModule {
  export { Compilation };
}
import RuntimeModule = require('../RuntimeModule');
type Compilation = import('../Compilation');
