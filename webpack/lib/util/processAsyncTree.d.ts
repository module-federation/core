export = processAsyncTree;
/**
 * Walks a dynamically expanding async work tree with bounded concurrency.
 * Each processed item may enqueue more items through `push`, allowing callers
 * to model breadth-first or depth-first discovery without managing the queue
 * themselves.
 * @template T
 * @template {Error} E
 * @param {Iterable<T>} items initial items
 * @param {number} concurrency number of items running in parallel
 * @param {(item: T, push: (item: T) => void, callback: (err?: E) => void) => void} processor worker which pushes more items
 * @param {(err?: E) => void} callback all items processed
 * @returns {void}
 */
declare function processAsyncTree<T, E extends Error>(items: Iterable<T>, concurrency: number, processor: (item: T, push: (item: T) => void, callback: (err?: E) => void) => void, callback: (err?: E) => void): void;
