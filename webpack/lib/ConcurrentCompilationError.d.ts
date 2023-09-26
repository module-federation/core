export = ConcurrentCompilationError;
declare class ConcurrentCompilationError extends WebpackError {
  constructor();
}
import WebpackError = require('./WebpackError');
