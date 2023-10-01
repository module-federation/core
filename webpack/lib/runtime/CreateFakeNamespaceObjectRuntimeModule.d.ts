export = CreateFakeNamespaceObjectRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
declare class CreateFakeNamespaceObjectRuntimeModule extends HelperRuntimeModule {
  constructor();
}
declare namespace CreateFakeNamespaceObjectRuntimeModule {
  export { Compilation };
}
import HelperRuntimeModule = require('./HelperRuntimeModule');
type Compilation = import('../Compilation');
