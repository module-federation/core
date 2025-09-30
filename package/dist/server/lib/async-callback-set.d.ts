export declare class AsyncCallbackSet {
    private callbacks;
    add(callback: () => Promise<void>): void;
    runAll(): Promise<void>;
}
