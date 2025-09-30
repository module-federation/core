/**
 * Check to see if a value is Thenable.
 *
 * @param promise the maybe-thenable value
 * @returns true if the value is thenable
 */
export declare function isThenable<T = unknown>(promise: Promise<T> | T): promise is Promise<T>;
