export = AbstractMethodError;
/**
 * Error for abstract method
 * @example
 * class FooClass {
 *     abstractMethod() {
 *         throw new AbstractMethodError(); // error message: Abstract method FooClass.abstractMethod. Must be overridden.
 *     }
 * }
 *
 */
declare class AbstractMethodError extends WebpackError {
  constructor();
}
import WebpackError = require('./WebpackError');
