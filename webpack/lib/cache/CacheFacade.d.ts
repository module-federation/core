export = CacheFacade;
declare class CacheFacade {
    /**
     * Creates an instance of CacheFacade.
     * @param {Cache} cache the root cache
     * @param {string} name the child cache name
     * @param {HashFunction=} hashFunction the hash function to use
     */
    constructor(cache: Cache, name: string, hashFunction?: HashFunction | undefined);
    /** @type {Cache} */
    _cache: Cache;
    /** @type {string} */
    _name: string;
    /** @type {HashFunction | undefined} */
    _hashFunction: HashFunction | undefined;
    /**
     * Returns whether a cache backend is active.
     * @returns {boolean} true, when get or store can have an effect
     */
    isEnabled(): boolean;
    /**
     * Returns child cache.
     * @param {string} name the child cache name#
     * @returns {CacheFacade} child cache
     */
    getChildCache(name: string): CacheFacade;
    /**
     * Returns item cache.
     * @param {string} identifier the cache identifier
     * @param {Etag | null} etag the etag
     * @returns {ItemCacheFacade} item cache
     */
    getItemCache(identifier: string, etag: Cache.Etag | null): ItemCacheFacade;
    /**
     * Gets lazy hashed etag.
     * @param {HashableObject} obj an hashable object
     * @returns {Etag} an etag that is lazy hashed
     */
    getLazyHashedEtag(obj: getLazyHashedEtag.HashableObject): Cache.Etag;
    /**
     * Merges the provided values into a single result.
     * @param {Etag} a an etag
     * @param {Etag} b another etag
     * @returns {Etag} an etag that represents both
     */
    mergeEtags(a: Cache.Etag, b: Cache.Etag): Cache.Etag;
    /**
     * Returns value.
     * @template T
     * @param {string} identifier the cache identifier
     * @param {Etag | null} etag the etag
     * @param {CallbackCache<T>} callback signals when the value is retrieved
     * @returns {void}
     */
    get<T>(identifier: string, etag: Cache.Etag | null, callback: CallbackCache<T>): void;
    /**
     * Returns promise with the data.
     * @template T
     * @param {string} identifier the cache identifier
     * @param {Etag | null} etag the etag
     * @returns {Promise<T>} promise with the data
     */
    getPromise<T>(identifier: string, etag: Cache.Etag | null): Promise<T>;
    /**
     * Processes the provided identifier.
     * @template T
     * @param {string} identifier the cache identifier
     * @param {Etag | null} etag the etag
     * @param {T} data the value to store
     * @param {CallbackCache<void>} callback signals when the value is stored
     * @returns {void}
     */
    store<T>(identifier: string, etag: Cache.Etag | null, data: T, callback: CallbackCache<void>): void;
    /**
     * Stores the provided identifier.
     * @template T
     * @param {string} identifier the cache identifier
     * @param {Etag | null} etag the etag
     * @param {T} data the value to store
     * @returns {Promise<void>} promise signals when the value is stored
     */
    storePromise<T>(identifier: string, etag: Cache.Etag | null, data: T): Promise<void>;
    /**
     * Processes the provided identifier.
     * @template T
     * @param {string} identifier the cache identifier
     * @param {Etag | null} etag the etag
     * @param {(callback: CallbackNormalErrorCache<T>) => void} computer function to compute the value if not cached
     * @param {CallbackNormalErrorCache<T>} callback signals when the value is retrieved
     * @returns {void}
     */
    provide<T>(identifier: string, etag: Cache.Etag | null, computer: (callback: CallbackNormalErrorCache<T>) => void, callback: CallbackNormalErrorCache<T>): void;
    /**
     * Returns promise with the data.
     * @template T
     * @param {string} identifier the cache identifier
     * @param {Etag | null} etag the etag
     * @param {() => Promise<T> | T} computer function to compute the value if not cached
     * @returns {Promise<T>} promise with the data
     */
    providePromise<T>(identifier: string, etag: Cache.Etag | null, computer: () => Promise<T> | T): Promise<T>;
}
declare namespace CacheFacade {
    export { ItemCacheFacade, MultiItemCache, CallbackCache, CallbackNormalErrorCache };
}
import type Cache from "./Cache";
import type { HashFunction } from "../util/Hash";
declare class ItemCacheFacade {
    /**
     * Creates an instance of ItemCacheFacade.
     * @param {Cache} cache the root cache
     * @param {string} name the child cache item name
     * @param {Etag | null} etag the etag
     */
    constructor(cache: Cache, name: string, etag: Cache.Etag | null);
    /** @type {Cache} */
    _cache: Cache;
    /** @type {string} */
    _name: string;
    /** @type {Etag | null} */
    _etag: Cache.Etag | null;
    /**
     * Returns value.
     * @template T
     * @param {CallbackCache<T>} callback signals when the value is retrieved
     * @returns {void}
     */
    get<T>(callback: CallbackCache<T>): void;
    /**
     * Returns promise with the data.
     * @template T
     * @returns {Promise<T>} promise with the data
     */
    getPromise<T>(): Promise<T>;
    /**
     * Processes the provided data.
     * @template T
     * @param {T} data the value to store
     * @param {CallbackCache<void>} callback signals when the value is stored
     * @returns {void}
     */
    store<T>(data: T, callback: CallbackCache<void>): void;
    /**
     * Stores the provided data.
     * @template T
     * @param {T} data the value to store
     * @returns {Promise<void>} promise signals when the value is stored
     */
    storePromise<T>(data: T): Promise<void>;
    /**
     * Processes the provided computer.
     * @template T
     * @param {(callback: CallbackNormalErrorCache<T>) => void} computer function to compute the value if not cached
     * @param {CallbackNormalErrorCache<T>} callback signals when the value is retrieved
     * @returns {void}
     */
    provide<T>(computer: (callback: CallbackNormalErrorCache<T>) => void, callback: CallbackNormalErrorCache<T>): void;
    /**
     * Returns promise with the data.
     * @template T
     * @param {() => Promise<T> | T} computer function to compute the value if not cached
     * @returns {Promise<T>} promise with the data
     */
    providePromise<T>(computer: () => Promise<T> | T): Promise<T>;
}
import getLazyHashedEtag = require("./getLazyHashedEtag");
/** @import Cache, { Etag } from "./Cache" */
/** @import { HashableObject } from "./getLazyHashedEtag" */
/** @import { HashFunction } from "../util/Hash" */
/**
 * Defines the callback cache callback.
 * @template T
 * @callback CallbackCache
 * @param {(Error | null)=} err
 * @param {(T | null)=} result
 * @returns {void}
 */
/**
 * Defines the callback normal error cache callback.
 * @template T
 * @callback CallbackNormalErrorCache
 * @param {(Error | null)=} err
 * @param {T=} result
 * @returns {void}
 */
declare class MultiItemCache {
    /**
     * Creates an instance of MultiItemCache.
     * @param {ItemCacheFacade[]} items item caches
     */
    constructor(items: ItemCacheFacade[]);
    /** @type {ItemCacheFacade[]} */
    _items: ItemCacheFacade[];
    /**
     * Returns value.
     * @template T
     * @param {CallbackCache<T>} callback signals when the value is retrieved
     * @returns {void}
     */
    get<T>(callback: CallbackCache<T>): void;
    /**
     * Returns promise with the data.
     * @template T
     * @returns {Promise<T>} promise with the data
     */
    getPromise<T>(): Promise<T>;
    /**
     * Processes the provided data.
     * @template T
     * @param {T} data the value to store
     * @param {CallbackCache<void>} callback signals when the value is stored
     * @returns {void}
     */
    store<T>(data: T, callback: CallbackCache<void>): void;
    /**
     * Stores the provided data.
     * @template T
     * @param {T} data the value to store
     * @returns {Promise<void>} promise signals when the value is stored
     */
    storePromise<T>(data: T): Promise<void>;
}
/**
 * Defines the callback cache callback.
 */
type CallbackCache<T> = (err?: (Error | null) | undefined, result?: (T | null) | undefined) => void;
/**
 * Defines the callback normal error cache callback.
 */
type CallbackNormalErrorCache<T> = (err?: (Error | null) | undefined, result?: T | undefined) => void;
