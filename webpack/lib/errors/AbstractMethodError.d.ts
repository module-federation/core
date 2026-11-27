export = AbstractMethodError;
/**
 * Error thrown when code reaches a method that is intended to be overridden by
 * a subclass.
 * @example
 * ```js
 * class FooClass {
 *     abstractMethod() {
 *         throw new AbstractMethodError(); // error message: Abstract method FooClass.abstractMethod. Must be overridden.
 *     }
 * }
 * ```
 */
declare class AbstractMethodError extends WebpackError {
    /**
     * Creates an error whose message points at the abstract method that was
     * invoked.
     */
    constructor();
}
import WebpackError = require("./WebpackError");
