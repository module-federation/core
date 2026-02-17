export = GetTrustedTypesPolicyRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../Module").ReadOnlyRuntimeRequirements} ReadOnlyRuntimeRequirements */
declare class GetTrustedTypesPolicyRuntimeModule extends HelperRuntimeModule {
    /**
     * @param {ReadOnlyRuntimeRequirements} runtimeRequirements runtime requirements
     */
    constructor(runtimeRequirements: ReadOnlyRuntimeRequirements);
    runtimeRequirements: import("../Module").ReadOnlyRuntimeRequirements;
}
declare namespace GetTrustedTypesPolicyRuntimeModule {
    export { Compilation, ReadOnlyRuntimeRequirements };
}
import HelperRuntimeModule = require("./HelperRuntimeModule");
type Compilation = import("../Compilation");
type ReadOnlyRuntimeRequirements = import("../Module").ReadOnlyRuntimeRequirements;
