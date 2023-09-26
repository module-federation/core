export = CommentCompilationWarning;
/** @typedef {import("./Dependency").DependencyLocation} DependencyLocation */
declare class CommentCompilationWarning extends WebpackError {
  /**
   *
   * @param {string} message warning message
   * @param {DependencyLocation} loc affected lines of code
   */
  constructor(message: string, loc: DependencyLocation);
}
declare namespace CommentCompilationWarning {
  export { DependencyLocation };
}
import WebpackError = require('./WebpackError');
type DependencyLocation = import('./Dependency').DependencyLocation;
