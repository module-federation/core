export = CreateScriptUrlRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
declare class CreateScriptUrlRuntimeModule extends HelperRuntimeModule {
  constructor();
}
declare namespace CreateScriptUrlRuntimeModule {
  export { Compilation };
}
import HelperRuntimeModule = require('./HelperRuntimeModule');
type Compilation = import('../Compilation');
