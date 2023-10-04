export = NodeStuffInWebError;
/** @typedef {import("./Dependency").DependencyLocation} DependencyLocation */
declare class NodeStuffInWebError extends WebpackError {
  /**
   * @param {DependencyLocation} loc loc
   * @param {string} expression expression
   * @param {string} description description
   */
  constructor(loc: DependencyLocation, expression: string, description: string);
}
declare namespace NodeStuffInWebError {
  export { DependencyLocation };
}
import WebpackError = require('./WebpackError');
type DependencyLocation = import('./Dependency').DependencyLocation;
