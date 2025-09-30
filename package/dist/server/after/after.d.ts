export type AfterTask<T = unknown> = Promise<T> | AfterCallback<T>;
export type AfterCallback<T = unknown> = () => T | Promise<T>;
/**
 * This function allows you to schedule callbacks to be executed after the current request finishes.
 */
export declare function after<T>(task: AfterTask<T>): void;
