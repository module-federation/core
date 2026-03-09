export = DelegatedSourceDependency;
declare class DelegatedSourceDependency extends ModuleDependency {
  /**
   * @param {string} request the request string
   */
  constructor(request: string);
}
import ModuleDependency = require('./ModuleDependency');
