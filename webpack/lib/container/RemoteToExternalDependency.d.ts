export = RemoteToExternalDependency;
declare class RemoteToExternalDependency extends ModuleDependency {
  /**
   * @param {string} request request
   */
  constructor(request: string);
}
import ModuleDependency = require('../dependencies/ModuleDependency');
