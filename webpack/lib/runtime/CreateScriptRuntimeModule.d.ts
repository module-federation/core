export = CreateScriptRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
declare class CreateScriptRuntimeModule extends HelperRuntimeModule {
  constructor();
}
declare namespace CreateScriptRuntimeModule {
  export { Compilation };
}
import HelperRuntimeModule = require('./HelperRuntimeModule');
type Compilation = import('../Compilation');
