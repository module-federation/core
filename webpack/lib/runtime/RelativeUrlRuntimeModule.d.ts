export = RelativeUrlRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
declare class RelativeUrlRuntimeModule extends HelperRuntimeModule {
  constructor();
}
declare namespace RelativeUrlRuntimeModule {
  export { Compilation };
}
import HelperRuntimeModule = require('./HelperRuntimeModule');
type Compilation = import('../Compilation');
