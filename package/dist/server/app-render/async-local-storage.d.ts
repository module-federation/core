import type { AsyncLocalStorage } from 'async_hooks';
export declare function createAsyncLocalStorage<Store extends {}>(): AsyncLocalStorage<Store>;
export declare function bindSnapshot<T>(fn: T): T;
export declare function createSnapshot(): <R, TArgs extends any[]>(fn: (...args: TArgs) => R, ...args: TArgs) => R;
