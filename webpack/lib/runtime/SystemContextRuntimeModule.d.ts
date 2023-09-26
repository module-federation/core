export = SystemContextRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
declare class SystemContextRuntimeModule extends RuntimeModule {
  constructor();
}
declare namespace SystemContextRuntimeModule {
  export { Compilation };
}
import RuntimeModule = require('../RuntimeModule');
type Compilation = import('../Compilation');
