export = AMDRequireDependenciesBlock;
/** @typedef {import("../Dependency").DependencyLocation} DependencyLocation */
declare class AMDRequireDependenciesBlock extends AsyncDependenciesBlock {
  /**
   * @param {DependencyLocation} loc location info
   * @param {string=} request request
   */
  constructor(loc: DependencyLocation, request?: string | undefined);
}
declare namespace AMDRequireDependenciesBlock {
  export { DependencyLocation };
}
import AsyncDependenciesBlock = require('../AsyncDependenciesBlock');
type DependencyLocation = import('../Dependency').DependencyLocation;
