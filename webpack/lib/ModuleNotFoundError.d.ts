export = ModuleNotFoundError;
declare class ModuleNotFoundError extends WebpackError {
  /**
   * @param {Module | null} module module tied to dependency
   * @param {Error&any} err error thrown
   * @param {DependencyLocation} loc location of dependency
   */
  constructor(module: Module | null, err: Error & any, loc: DependencyLocation);
  details: any;
  error: any;
}
declare namespace ModuleNotFoundError {
  export { DependencyLocation, Module };
}
import WebpackError = require('./WebpackError');
type Module = import('./Module');
type DependencyLocation = import('./Dependency').DependencyLocation;
