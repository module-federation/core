export declare class LRUCache<T> {
    private cache;
    private sizes;
    private totalSize;
    private maxSize;
    private calculateSize;
    constructor(maxSize: number, calculateSize?: (value: T) => number);
    set(key?: string | null, value?: T): void;
    has(key?: string | null): boolean;
    get(key?: string | null): T | undefined;
    private touch;
    private evictIfNecessary;
    private evictLeastRecentlyUsed;
    reset(): void;
    keys(): string[];
    remove(key: string): void;
    clear(): void;
    get size(): number;
    get currentSize(): number;
}
