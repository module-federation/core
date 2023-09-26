export = RequireEnsureDependenciesBlock;
/** @typedef {import("../ChunkGroup").ChunkGroupOptions} ChunkGroupOptions */
/** @typedef {import("../Dependency").DependencyLocation} DependencyLocation */
declare class RequireEnsureDependenciesBlock extends AsyncDependenciesBlock {
  /**
   * @param {ChunkGroupOptions & { entryOptions?: TODO }} chunkName chunk name
   * @param {DependencyLocation} loc location info
   */
  constructor(
    chunkName: ChunkGroupOptions & {
      entryOptions?: TODO;
    },
    loc: DependencyLocation,
  );
}
declare namespace RequireEnsureDependenciesBlock {
  export { ChunkGroupOptions, DependencyLocation };
}
import AsyncDependenciesBlock = require('../AsyncDependenciesBlock');
type ChunkGroupOptions = import('../ChunkGroup').ChunkGroupOptions;
type DependencyLocation = import('../Dependency').DependencyLocation;
