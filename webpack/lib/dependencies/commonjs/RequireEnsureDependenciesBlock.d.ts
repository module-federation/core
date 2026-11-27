export = RequireEnsureDependenciesBlock;
/** @import { GroupOptions } from "../../graph/AsyncDependenciesBlock" */
/** @import { DependencyLocation } from "../../graph/Dependency" */
declare class RequireEnsureDependenciesBlock extends AsyncDependenciesBlock {
    /**
     * Creates an instance of RequireEnsureDependenciesBlock.
     * @param {GroupOptions | string | null} chunkName chunk name
     * @param {(DependencyLocation | null)=} loc location info
     */
    constructor(chunkName: AsyncDependenciesBlock.GroupOptions | string | null, loc?: (DependencyLocation | null) | undefined);
}
import AsyncDependenciesBlock = require("../../graph/AsyncDependenciesBlock");
import type { DependencyLocation } from "../../graph/Dependency";
