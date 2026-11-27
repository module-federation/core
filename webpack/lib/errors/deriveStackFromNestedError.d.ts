export = deriveStackFromNestedError;
/**
 * Derives `details` — or, for a `hideStack` error, `stack` — of a diagnostic
 * that wraps `nestedError`. V8 formats a stack trace only when it is read, and
 * a diagnostic is normally printed without one (stats needs `errorDetails` or
 * `errorStack` for that), so the derived string is materialized on first
 * access: a build with thousands of dependency warnings would otherwise spend a
 * large share of its time formatting stacks that nothing ever reads.
 * @param {WebpackError} error the wrapping diagnostic
 * @param {ErrorWithHideStack | undefined} nestedError the wrapped error
 * @returns {void}
 */
declare function deriveStackFromNestedError(error: WebpackError, nestedError: ErrorWithHideStack | undefined): void;
import type WebpackError from "./WebpackError";
import type { ErrorWithHideStack } from "./ModuleBuildError";
