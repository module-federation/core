export = ConsumeSharedFallbackDependency;
declare class ConsumeSharedFallbackDependency extends ModuleDependency {
  /**
   * @param {string} request the request
   */
  constructor(request: string);
}
import ModuleDependency = require('../dependencies/ModuleDependency');
