export type LRU<T extends LRUNode> = {
    put(node: T): void;
    delete(node: T): void;
    updateSize(node: T, size: number): void;
};
type LRUNode<T = any> = {
    prev: T | null;
    next: T | null;
    size: number;
};
export declare function createLRU<T extends LRUNode>(maxLruSize: number, onEviction: (node: T) => void): LRU<T>;
export {};
