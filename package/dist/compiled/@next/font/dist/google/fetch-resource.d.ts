/**
 * Makes a simple GET request and returns the entire response as a Buffer.
 * - Throws if the response status is not 200.
 * - Applies a 3000 ms timeout when `isDev` is `true`.
 */
export declare function fetchResource(url: string, isDev: boolean, errorMessage?: string): Promise<Buffer>;
