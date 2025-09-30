/**
 * Augments the digest field of errors thrown in React Server Components (RSC) with an error code.
 * Since RSC errors can only be serialized through the digest field, this provides a way to include
 * an additional error code that can be extracted client-side via `extractNextErrorCode`.
 *
 * The error code is appended to the digest string with a semicolon separator, allowing it to be
 * parsed out later while preserving the original digest value.
 */
export declare const createDigestWithErrorCode: (thrownValue: unknown, originalDigest: string) => string;
/**
 * Copies the error code from one error to another by setting the __NEXT_ERROR_CODE property.
 * This allows error codes to be preserved when wrapping or transforming errors.
 */
export declare const copyNextErrorCode: (source: unknown, target: unknown) => void;
export declare const extractNextErrorCode: (error: unknown) => string | undefined;
