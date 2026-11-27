export = NodeWatchFileSystem;
declare class NodeWatchFileSystem {
    /**
     * Creates an instance of NodeWatchFileSystem.
     * @param {InputFileSystem} inputFileSystem input filesystem
     */
    constructor(inputFileSystem: InputFileSystem);
    /** @type {InputFileSystem} */
    inputFileSystem: InputFileSystem;
    /** @type {WatchOptions} */
    watcherOptions: WatchOptions;
    /** @type {Watchpack | null} */
    watcher: Watchpack | null;
    /** @type {{ files: Lookup, directories: Lookup, missing: Lookup } | undefined} */
    _watched: {
        files: Lookup;
        directories: Lookup;
        missing: Lookup;
    } | undefined;
    /**
     * Purges what the previous call watched and this one does not: an edit to a
     * path nobody watches is never reported, so its cached stat and content would
     * be read stale once the path is watched again.
     * @param {Lookup} files files to watch
     * @param {Lookup} directories directories to watch
     * @param {Lookup} missing missing paths to watch
     * @returns {void}
     */
    _purgeUnwatched(files: Lookup, directories: Lookup, missing: Lookup): void;
    watch(files: Iterable<string>, directories: Iterable<string>, missing: Iterable<string>, startTime: number, options: import("../fs/fs").WatchOptions, callback: (err: Error | null, timeInfoEntries1?: import("../fs/fs").TimeInfoEntries, timeInfoEntries2?: import("../fs/fs").TimeInfoEntries, changes?: Changes, removals?: Removals) => void, callbackUndelayed: (value: string, num: number) => void): import("../fs/fs").Watcher;
}
declare namespace NodeWatchFileSystem {
    export { Watchpack, Lookup };
}
import type { InputFileSystem } from "../fs/fs";
import type { WatchOptions } from "watchpack";
import type { Changes } from "../fs/fs";
import type { Removals } from "../fs/fs";
type Watchpack = InstanceType<{
    new (options?: WatchOptions | undefined): {
        options: WatchOptions;
        aggregateTimeout: number;
        watcherOptions: import("watchpack").NormalizedWatchOptions;
        watcherManager: import("watchpack").WatcherManager;
        fileWatchers: Map<string, {
            files: string[];
            watcher: import("watchpack/types/DirectoryWatcher").Watcher<import("watchpack/types/DirectoryWatcher").FileWatcherEvents>;
            update(files: string | string[]): void;
            close(): void;
        }>;
        directoryWatchers: Map<string, {
            directories: string[];
            watcher: import("watchpack/types/DirectoryWatcher").Watcher<import("watchpack/types/DirectoryWatcher").DirectoryWatcherEvents>;
            update(directories: string | string[]): void;
            close(): void;
        }>;
        _missing: Set<string>;
        startTime: number | undefined;
        paused: boolean;
        aggregatedChanges: import("watchpack").Changes;
        aggregatedRemovals: import("watchpack").Removals;
        aggregateTimer: undefined | NodeJS.Timeout;
        _onTimeout(): void;
        watch(arg1: Iterable<string>, arg2: Iterable<string>, arg3?: number | undefined): void;
        watch(arg1: import("watchpack").WatchMethodOptions): void;
        close(): void;
        pause(): void;
        getTimes(): Record<string, number>;
        getTimeInfoEntries(): TimeInfoEntries;
        collectTimeInfoEntries(fileTimestamps: TimeInfoEntries, directoryTimestamps: TimeInfoEntries): void;
        getAggregated(): import("watchpack").Aggregated;
        _onChange(item: string, mtime: number, file: string, type: import("watchpack").EventType): void;
        _onRemove(item: string, file: string, type: import("watchpack").EventType): void;
        addListener<E extends string | symbol>(eventName: "change" | E | keyof EventEmitterEventMap | "remove" | "aggregated", listener: (...args: E extends "change" | "remove" | "aggregated" ? {
            change: [file: string, mtime: number, type: import("watchpack").EventType];
            remove: [file: string, type: import("watchpack").EventType];
            aggregated: [changes: import("watchpack").Changes, removals: import("watchpack").Removals];
        }[E] : E extends keyof EventEmitterEventMap ? EventEmitterEventMap[E] : any[]) => void): /*elided*/ any;
        emit<E extends string | symbol>(eventName: "change" | keyof EventEmitterEventMap | "remove" | "aggregated" | E, ...args: E extends "change" | "remove" | "aggregated" ? {
            change: [file: string, mtime: number, type: import("watchpack").EventType];
            remove: [file: string, type: import("watchpack").EventType];
            aggregated: [changes: import("watchpack").Changes, removals: import("watchpack").Removals];
        }[E] : E extends keyof EventEmitterEventMap ? EventEmitterEventMap[E] : any[]): boolean;
        eventNames(): (string | symbol)[];
        getMaxListeners(): number;
        listenerCount<E extends string | symbol>(eventName: "change" | keyof EventEmitterEventMap | "remove" | "aggregated" | E, listener?: (...args: E extends "change" | "remove" | "aggregated" ? {
            change: [file: string, mtime: number, type: import("watchpack").EventType];
            remove: [file: string, type: import("watchpack").EventType];
            aggregated: [changes: import("watchpack").Changes, removals: import("watchpack").Removals];
        }[E] : E extends keyof EventEmitterEventMap ? EventEmitterEventMap[E] : any[]) => void): number;
        listeners<E extends string | symbol>(eventName: "change" | keyof EventEmitterEventMap | "remove" | "aggregated" | E): ((...args: E extends "change" | "remove" | "aggregated" ? {
            change: [file: string, mtime: number, type: import("watchpack").EventType];
            remove: [file: string, type: import("watchpack").EventType];
            aggregated: [changes: import("watchpack").Changes, removals: import("watchpack").Removals];
        }[E] : E extends keyof EventEmitterEventMap ? EventEmitterEventMap[E] : any[]) => void)[];
        off<E extends string | symbol>(eventName: "change" | keyof EventEmitterEventMap | "remove" | "aggregated" | E, listener: (...args: E extends "change" | "remove" | "aggregated" ? {
            change: [file: string, mtime: number, type: import("watchpack").EventType];
            remove: [file: string, type: import("watchpack").EventType];
            aggregated: [changes: import("watchpack").Changes, removals: import("watchpack").Removals];
        }[E] : E extends keyof EventEmitterEventMap ? EventEmitterEventMap[E] : any[]) => void): /*elided*/ any;
        on<E extends string | symbol>(eventName: "change" | keyof EventEmitterEventMap | "remove" | "aggregated" | E, listener: (...args: E extends "change" | "remove" | "aggregated" ? {
            change: [file: string, mtime: number, type: import("watchpack").EventType];
            remove: [file: string, type: import("watchpack").EventType];
            aggregated: [changes: import("watchpack").Changes, removals: import("watchpack").Removals];
        }[E] : E extends keyof EventEmitterEventMap ? EventEmitterEventMap[E] : any[]) => void): /*elided*/ any;
        once<E extends string | symbol>(eventName: "change" | keyof EventEmitterEventMap | "remove" | "aggregated" | E, listener: (...args: E extends "change" | "remove" | "aggregated" ? {
            change: [file: string, mtime: number, type: import("watchpack").EventType];
            remove: [file: string, type: import("watchpack").EventType];
            aggregated: [changes: import("watchpack").Changes, removals: import("watchpack").Removals];
        }[E] : E extends keyof EventEmitterEventMap ? EventEmitterEventMap[E] : any[]) => void): /*elided*/ any;
        prependListener<E extends string | symbol>(eventName: "change" | keyof EventEmitterEventMap | "remove" | "aggregated" | E, listener: (...args: E extends "change" | "remove" | "aggregated" ? {
            change: [file: string, mtime: number, type: import("watchpack").EventType];
            remove: [file: string, type: import("watchpack").EventType];
            aggregated: [changes: import("watchpack").Changes, removals: import("watchpack").Removals];
        }[E] : E extends keyof EventEmitterEventMap ? EventEmitterEventMap[E] : any[]) => void): /*elided*/ any;
        prependOnceListener<E extends string | symbol>(eventName: "change" | keyof EventEmitterEventMap | "remove" | "aggregated" | E, listener: (...args: E extends "change" | "remove" | "aggregated" ? {
            change: [file: string, mtime: number, type: import("watchpack").EventType];
            remove: [file: string, type: import("watchpack").EventType];
            aggregated: [changes: import("watchpack").Changes, removals: import("watchpack").Removals];
        }[E] : E extends keyof EventEmitterEventMap ? EventEmitterEventMap[E] : any[]) => void): /*elided*/ any;
        rawListeners<E extends string | symbol>(eventName: "change" | keyof EventEmitterEventMap | "remove" | "aggregated" | E): ((...args: E extends "change" | "remove" | "aggregated" ? {
            change: [file: string, mtime: number, type: import("watchpack").EventType];
            remove: [file: string, type: import("watchpack").EventType];
            aggregated: [changes: import("watchpack").Changes, removals: import("watchpack").Removals];
        }[E] : E extends keyof EventEmitterEventMap ? EventEmitterEventMap[E] : any[]) => void)[];
        removeAllListeners<E extends string | symbol>(eventName?: "change" | keyof EventEmitterEventMap | "remove" | "aggregated" | E): /*elided*/ any;
        removeListener<E extends string | symbol>(eventName: "change" | keyof EventEmitterEventMap | "remove" | "aggregated" | E, listener: (...args: E extends "change" | "remove" | "aggregated" ? {
            change: [file: string, mtime: number, type: import("watchpack").EventType];
            remove: [file: string, type: import("watchpack").EventType];
            aggregated: [changes: import("watchpack").Changes, removals: import("watchpack").Removals];
        }[E] : E extends keyof EventEmitterEventMap ? EventEmitterEventMap[E] : any[]) => void): /*elided*/ any;
        setMaxListeners(n: number): /*elided*/ any;
        [EventEmitter.captureRejectionSymbol]?(error: Error, event: string | symbol, ...args: any[]): void;
    };
    EventEmitter: typeof import("node:events");
    addAbortListener(signal: AbortSignal, resource: (event: Event) => void): Disposable;
    getEventListeners(emitter: import("node:events"), name: string | symbol): ((...args: any[]) => void)[];
    getEventListeners(emitter: EventTarget, name: string): ((...args: any[]) => void)[];
    getMaxListeners(emitter: import("node:events") | EventTarget): number;
    listenerCount(emitter: import("node:events"), eventName: string | symbol): number;
    listenerCount(emitter: EventTarget, eventName: string): number;
    on(emitter: import("node:events"), eventName: string | symbol, options?: import("node:events").OnOptions): NodeJS.AsyncIterator<any[]>;
    on(emitter: EventTarget, eventName: string, options?: import("node:events").OnOptions): NodeJS.AsyncIterator<any[]>;
    once(emitter: import("node:events"), eventName: string | symbol, options?: import("node:events").OnceOptions): Promise<any[]>;
    once(emitter: EventTarget, eventName: string, options?: import("node:events").OnceOptions): Promise<any[]>;
    setMaxListeners(n: number, ...eventTargets: ReadonlyArray<import("node:events") | EventTarget>): void;
    readonly captureRejectionSymbol: typeof import("node:events").captureRejectionSymbol;
    captureRejections: boolean;
    defaultMaxListeners: number;
    readonly errorMonitor: typeof import("node:events").errorMonitor;
    EventEmitterAsyncResource: typeof import("node:events").EventEmitterAsyncResource;
} & {
    util: {
        readonly globToRegExp: typeof import("watchpack/types/util/globToRegExp");
    };
}>;
type Lookup = Iterable<string> & {
    has(item: string): boolean;
};
import type { TimeInfoEntries } from "watchpack";
