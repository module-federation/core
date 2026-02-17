export = EnsureChunkRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../Module").ReadOnlyRuntimeRequirements} ReadOnlyRuntimeRequirements */
declare class EnsureChunkRuntimeModule extends RuntimeModule {
    /**
     * @param {ReadOnlyRuntimeRequirements} runtimeRequirements runtime requirements
     */
    constructor(runtimeRequirements: ReadOnlyRuntimeRequirements);
    runtimeRequirements: import("../Module").ReadOnlyRuntimeRequirements;
}
declare namespace EnsureChunkRuntimeModule {
    export { Compilation, ReadOnlyRuntimeRequirements };
}
import RuntimeModule = require("../RuntimeModule");
type Compilation = import("../Compilation");
type ReadOnlyRuntimeRequirements = import("../Module").ReadOnlyRuntimeRequirements;
