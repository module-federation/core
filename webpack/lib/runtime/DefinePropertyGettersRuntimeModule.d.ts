export = DefinePropertyGettersRuntimeModule;
/** @import Compilation from "../Compilation" */
/** @import { ReadOnlyRuntimeRequirements } from "../module/Module" */
declare class DefinePropertyGettersRuntimeModule extends HelperRuntimeModule {
    /**
     * @param {ReadOnlyRuntimeRequirements} runtimeRequirements runtime requirements
     */
    constructor(runtimeRequirements: ReadOnlyRuntimeRequirements);
    /** @type {ReadOnlyRuntimeRequirements} */
    runtimeRequirements: ReadOnlyRuntimeRequirements;
}
import HelperRuntimeModule = require("./HelperRuntimeModule");
import type { ReadOnlyRuntimeRequirements } from "../module/Module";
