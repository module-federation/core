export = AsyncModuleRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
declare class AsyncModuleRuntimeModule extends HelperRuntimeModule {
  constructor();
}
declare namespace AsyncModuleRuntimeModule {
  export { Compilation };
}
import HelperRuntimeModule = require('./HelperRuntimeModule');
type Compilation = import('../Compilation');
