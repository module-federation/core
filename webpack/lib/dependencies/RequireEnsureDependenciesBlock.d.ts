export = RequireEnsureDependenciesBlock;
/** @typedef {import("../AsyncDependenciesBlock").GroupOptions} GroupOptions */
/** @typedef {import("../Dependency").DependencyLocation} DependencyLocation */
declare class RequireEnsureDependenciesBlock extends AsyncDependenciesBlock {
  /**
   * @param {GroupOptions | null} chunkName chunk name
   * @param {(DependencyLocation | null)=} loc location info
   */
  constructor(
    chunkName: GroupOptions | null,
    loc?: (DependencyLocation | null) | undefined,
  );
}
declare namespace RequireEnsureDependenciesBlock {
  export { GroupOptions, DependencyLocation };
}
import AsyncDependenciesBlock = require('../AsyncDependenciesBlock');
type GroupOptions = import('../AsyncDependenciesBlock').GroupOptions;
type DependencyLocation = import('../Dependency').DependencyLocation;
