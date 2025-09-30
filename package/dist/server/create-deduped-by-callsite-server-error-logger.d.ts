/**
 * Creates a function that logs an error message that is deduped by the userland
 * callsite.
 * This requires no indirection between the call of this function and the userland
 * callsite i.e. there's only a single library frame above this.
 * Do not use on the Client where sourcemaps and ignore listing might be enabled.
 * Only use that for warnings need a fix independent of the callstack.
 *
 * @param getMessage
 * @returns
 */
export declare function createDedupedByCallsiteServerErrorLoggerDev<Args extends any[]>(getMessage: (...args: Args) => Error): (...args: Args) => void;
