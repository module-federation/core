export = CompatGetDefaultExportRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
declare class CompatGetDefaultExportRuntimeModule extends HelperRuntimeModule {
  constructor();
}
declare namespace CompatGetDefaultExportRuntimeModule {
  export { Compilation };
}
import HelperRuntimeModule = require('./HelperRuntimeModule');
type Compilation = import('../Compilation');
