export = processAsyncTree;
/**
 * @template T
 * @template {Error} E
 * @param {Iterable<T>} items initial items
 * @param {number} concurrency number of items running in parallel
 * @param {function(T, function(T): void, function(E=): void): void} processor worker which pushes more items
 * @param {function(E=): void} callback all items processed
 * @returns {void}
 */
declare function processAsyncTree<T, E extends Error>(
  items: Iterable<T>,
  concurrency: number,
  processor: (
    arg0: T,
    arg1: (arg0: T) => void,
    arg2: (arg0?: E) => void,
  ) => void,
  callback: (arg0?: E) => void,
): void;
