export = GetTrustedTypesPolicyRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
declare class GetTrustedTypesPolicyRuntimeModule extends HelperRuntimeModule {
  /**
   * @param {ReadonlySet<string>} runtimeRequirements runtime requirements
   */
  constructor(runtimeRequirements: ReadonlySet<string>);
  runtimeRequirements: ReadonlySet<string>;
}
declare namespace GetTrustedTypesPolicyRuntimeModule {
  export { Compilation };
}
import HelperRuntimeModule = require('./HelperRuntimeModule');
type Compilation = import('../Compilation');
