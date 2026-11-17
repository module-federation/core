export = OnChunksLoadedRuntimeModule;
/** @import Compilation from "../Compilation" */
/** @import { ReadOnlyRuntimeRequirements } from "../module/Module" */
declare class OnChunksLoadedRuntimeModule extends RuntimeModule {
    /**
     * @param {ReadOnlyRuntimeRequirements} runtimeRequirements runtime requirements
     */
    constructor(runtimeRequirements: ReadOnlyRuntimeRequirements);
    /** @type {ReadOnlyRuntimeRequirements} */
    runtimeRequirements: ReadOnlyRuntimeRequirements;
}
import RuntimeModule = require("./RuntimeModule");
import type { ReadOnlyRuntimeRequirements } from "../module/Module";
