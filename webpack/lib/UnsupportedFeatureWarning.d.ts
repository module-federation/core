export = UnsupportedFeatureWarning;
/** @typedef {import("./Dependency").DependencyLocation} DependencyLocation */
declare class UnsupportedFeatureWarning extends WebpackError {
  /**
   * @param {string} message description of warning
   * @param {DependencyLocation} loc location start and end positions of the module
   */
  constructor(message: string, loc: DependencyLocation);
}
declare namespace UnsupportedFeatureWarning {
  export { DependencyLocation };
}
import WebpackError = require('./WebpackError');
type DependencyLocation = import('./Dependency').DependencyLocation;
