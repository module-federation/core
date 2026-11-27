export = AMDRequireDependenciesBlock;
/** @import { DependencyLocation } from "../../graph/Dependency" */
declare class AMDRequireDependenciesBlock extends AsyncDependenciesBlock {
    /**
     * Creates an instance of AMDRequireDependenciesBlock.
     * @param {DependencyLocation} loc location info
     * @param {string=} request request
     */
    constructor(loc: DependencyLocation, request?: string | undefined);
}
import AsyncDependenciesBlock = require("../../graph/AsyncDependenciesBlock");
import type { DependencyLocation } from "../../graph/Dependency";
