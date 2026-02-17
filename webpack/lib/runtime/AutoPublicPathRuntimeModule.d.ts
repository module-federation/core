export = AutoPublicPathRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
declare class AutoPublicPathRuntimeModule extends RuntimeModule {
  constructor();
}
declare namespace AutoPublicPathRuntimeModule {
  export { Compilation };
}
import RuntimeModule = require('../RuntimeModule');
type Compilation = import('../Compilation');
