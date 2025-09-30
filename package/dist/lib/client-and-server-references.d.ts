export interface ServerReference {
    $$typeof: Symbol;
    $$id: string;
}
export type ServerFunction = ServerReference & ((...args: unknown[]) => Promise<unknown>);
export declare function isServerReference<T>(value: T & Partial<ServerReference>): value is T & ServerFunction;
export declare function isUseCacheFunction<T>(value: T & Partial<ServerReference>): value is T & ServerFunction;
export declare function isClientReference(mod: any): boolean;
