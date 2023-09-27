export = MakeNamespaceObjectRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
declare class MakeNamespaceObjectRuntimeModule extends HelperRuntimeModule {
  constructor();
}
declare namespace MakeNamespaceObjectRuntimeModule {
  export { Compilation };
}
import HelperRuntimeModule = require('./HelperRuntimeModule');
type Compilation = import('../Compilation');
