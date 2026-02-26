export = CacheFacade;
declare class CacheFacade {
  /**
   * @param {Cache} cache the root cache
   * @param {string} name the child cache name
   * @param {(string | HashConstructor)=} hashFunction the hash function to use
   */
  constructor(
    cache: Cache,
    name: string,
    hashFunction?: (string | HashConstructor) | undefined,
  );
  _cache: import('./Cache');
  _name: string;
  _hashFunction: string | typeof import('./util/Hash');
  /**
   * @param {string} name the child cache name#
   * @returns {CacheFacade} child cache
   */
  getChildCache(name: string): CacheFacade;
  /**
   * @param {string} identifier the cache identifier
   * @param {Etag | null} etag the etag
   * @returns {ItemCacheFacade} item cache
   */
  getItemCache(identifier: string, etag: Etag | null): ItemCacheFacade;
  /**
   * @param {HashableObject} obj an hashable object
   * @returns {Etag} an etag that is lazy hashed
   */
  getLazyHashedEtag(obj: HashableObject): Etag;
  /**
   * @param {Etag} a an etag
   * @param {Etag} b another etag
   * @returns {Etag} an etag that represents both
   */
  mergeEtags(a: Etag, b: Etag): Etag;
  /**
   * @template T
   * @param {string} identifier the cache identifier
   * @param {Etag | null} etag the etag
   * @param {CallbackCache<T>} callback signals when the value is retrieved
   * @returns {void}
   */
  get<T>(
    identifier: string,
    etag: Etag | null,
    callback: CallbackCache<T>,
  ): void;
  /**
   * @template T
   * @param {string} identifier the cache identifier
   * @param {Etag | null} etag the etag
   * @returns {Promise<T>} promise with the data
   */
  getPromise<T>(identifier: string, etag: Etag | null): Promise<T>;
  /**
   * @template T
   * @param {string} identifier the cache identifier
   * @param {Etag | null} etag the etag
   * @param {T} data the value to store
   * @param {CallbackCache<void>} callback signals when the value is stored
   * @returns {void}
   */
  store<T>(
    identifier: string,
    etag: Etag | null,
    data: T,
    callback: CallbackCache<void>,
  ): void;
  /**
   * @template T
   * @param {string} identifier the cache identifier
   * @param {Etag | null} etag the etag
   * @param {T} data the value to store
   * @returns {Promise<void>} promise signals when the value is stored
   */
  storePromise<T>(
    identifier: string,
    etag: Etag | null,
    data: T,
  ): Promise<void>;
  /**
   * @template T
   * @param {string} identifier the cache identifier
   * @param {Etag | null} etag the etag
   * @param {(callback: CallbackNormalErrorCache<T>) => void} computer function to compute the value if not cached
   * @param {CallbackNormalErrorCache<T>} callback signals when the value is retrieved
   * @returns {void}
   */
  provide<T>(
    identifier: string,
    etag: Etag | null,
    computer: (callback: CallbackNormalErrorCache<T>) => void,
    callback: CallbackNormalErrorCache<T>,
  ): void;
  /**
   * @template T
   * @param {string} identifier the cache identifier
   * @param {Etag | null} etag the etag
   * @param {() => Promise<T> | T} computer function to compute the value if not cached
   * @returns {Promise<T>} promise with the data
   */
  providePromise<T>(
    identifier: string,
    etag: Etag | null,
    computer: () => Promise<T> | T,
  ): Promise<T>;
}
declare namespace CacheFacade {
  export {
    ItemCacheFacade,
    MultiItemCache,
    Cache,
    Etag,
    HashableObject,
    HashConstructor,
    CallbackCache,
    CallbackNormalErrorCache,
  };
}
declare class ItemCacheFacade {
  /**
   * @param {Cache} cache the root cache
   * @param {string} name the child cache item name
   * @param {Etag | null} etag the etag
   */
  constructor(cache: Cache, name: string, etag: Etag | null);
  _cache: import('./Cache');
  _name: string;
  _etag: import('./Cache').Etag;
  /**
   * @template T
   * @param {CallbackCache<T>} callback signals when the value is retrieved
   * @returns {void}
   */
  get<T>(callback: CallbackCache<T>): void;
  /**
   * @template T
   * @returns {Promise<T>} promise with the data
   */
  getPromise<T>(): Promise<T>;
  /**
   * @template T
   * @param {T} data the value to store
   * @param {CallbackCache<void>} callback signals when the value is stored
   * @returns {void}
   */
  store<T>(data: T, callback: CallbackCache<void>): void;
  /**
   * @template T
   * @param {T} data the value to store
   * @returns {Promise<void>} promise signals when the value is stored
   */
  storePromise<T>(data: T): Promise<void>;
  /**
   * @template T
   * @param {(callback: CallbackNormalErrorCache<T>) => void} computer function to compute the value if not cached
   * @param {CallbackNormalErrorCache<T>} callback signals when the value is retrieved
   * @returns {void}
   */
  provide<T>(
    computer: (callback: CallbackNormalErrorCache<T>) => void,
    callback: CallbackNormalErrorCache<T>,
  ): void;
  /**
   * @template T
   * @param {() => Promise<T> | T} computer function to compute the value if not cached
   * @returns {Promise<T>} promise with the data
   */
  providePromise<T>(computer: () => Promise<T> | T): Promise<T>;
}
/** @typedef {import("./Cache")} Cache */
/** @typedef {import("./Cache").Etag} Etag */
/** @typedef {import("./cache/getLazyHashedEtag").HashableObject} HashableObject */
/** @typedef {typeof import("./util/Hash")} HashConstructor */
/**
 * @template T
 * @callback CallbackCache
 * @param {(Error | null)=} err
 * @param {(T | null)=} result
 * @returns {void}
 */
/**
 * @template T
 * @callback CallbackNormalErrorCache
 * @param {(Error | null)=} err
 * @param {T=} result
 * @returns {void}
 */
declare class MultiItemCache {
  /**
   * @param {ItemCacheFacade[]} items item caches
   */
  constructor(items: ItemCacheFacade[]);
  _items: ItemCacheFacade[];
  /**
   * @template T
   * @param {CallbackCache<T>} callback signals when the value is retrieved
   * @returns {void}
   */
  get<T>(callback: CallbackCache<T>): void;
  /**
   * @template T
   * @returns {Promise<T>} promise with the data
   */
  getPromise<T>(): Promise<T>;
  /**
   * @template T
   * @param {T} data the value to store
   * @param {CallbackCache<void>} callback signals when the value is stored
   * @returns {void}
   */
  store<T>(data: T, callback: CallbackCache<void>): void;
  /**
   * @template T
   * @param {T} data the value to store
   * @returns {Promise<void>} promise signals when the value is stored
   */
  storePromise<T>(data: T): Promise<void>;
}
type Cache = import('./Cache');
type Etag = import('./Cache').Etag;
type HashableObject = import('./cache/getLazyHashedEtag').HashableObject;
type HashConstructor = typeof import('./util/Hash');
type CallbackCache<T> = (
  err?: (Error | null) | undefined,
  result?: (T | null) | undefined,
) => void;
type CallbackNormalErrorCache<T> = (
  err?: (Error | null) | undefined,
  result?: T | undefined,
) => void;
