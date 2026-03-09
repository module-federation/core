export = ModuleNotFoundError;
declare class ModuleNotFoundError extends WebpackError {
  /**
   * @param {Module | null} module module tied to dependency
   * @param {Error & { details?: string }} err error thrown
   * @param {DependencyLocation} loc location of dependency
   */
  constructor(
    module: Module | null,
    err: Error & {
      details?: string;
    },
    loc: DependencyLocation,
  );
  error: Error & {
    details?: string;
  };
}
declare namespace ModuleNotFoundError {
  export { DependencyLocation, Module };
}
import WebpackError = require('./WebpackError');
type DependencyLocation = import('./Dependency').DependencyLocation;
type Module = import('./Module');
