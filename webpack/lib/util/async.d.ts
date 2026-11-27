/**
 * Runs `iterator` over every item with unlimited concurrency.
 * Every item is started from one flat loop, so a synchronous iterator never
 * grows the stack.
 * @template T
 * @template E
 * @param {Iterable<T>} collection items to iterate
 * @param {(item: T, callback: (err?: E | null) => void) => void} iterator called once per item
 * @param {(err?: E | null) => void} callback called when every item is done, or with the first error
 * @returns {void}
 */
export function each<T, E>(collection: Iterable<T>, iterator: (item: T, callback: (err?: E | null) => void) => void, callback: (err?: E | null) => void): void;
/**
 * Runs `iterator` over every item, keeping at most `limit` of them in flight.
 * A synchronous iterator is drained by the dispatch loop instead of by
 * recursion, so the stack stays flat however long the collection is.
 * @template T
 * @template E
 * @param {Iterable<T>} collection items to iterate
 * @param {number} limit maximum number of items in flight
 * @param {(item: T, callback: (err?: E | null) => void) => void} iterator called once per item
 * @param {(err?: E | null) => void} callback called when every item is done, or with the first error
 * @returns {void}
 */
export function eachLimit<T, E>(collection: Iterable<T>, limit: number, iterator: (item: T, callback: (err?: E | null) => void) => void, callback: (err?: E | null) => void): void;
/**
 * Runs `iterator` over every item with unlimited concurrency and collects the
 * results in the order of the collection, not the order of completion.
 * @template T
 * @template R
 * @template E
 * @param {Iterable<T>} collection items to iterate
 * @param {(item: T, callback: (err?: E | null, result?: R) => void) => void} iterator called once per item
 * @param {(err?: E | null, results?: R[]) => void} callback called with every result, or with the first error
 * @returns {void}
 */
export function map<T, R, E>(collection: Iterable<T>, iterator: (item: T, callback: (err?: E | null, result?: R) => void) => void, callback: (err?: E | null, results?: R[]) => void): void;
/**
 * Runs `iterator` over every item, at most `limit` of them in flight, and
 * collects the results in the order of the collection, not of completion.
 * @template T
 * @template R
 * @template E
 * @param {Iterable<T>} collection items to iterate
 * @param {number} limit maximum number of items in flight
 * @param {(item: T, callback: (err?: E | null, result?: R) => void) => void} iterator called once per item
 * @param {(err?: E | null, results?: R[]) => void} callback called with every result, or with the first error
 * @returns {void}
 */
export function mapLimit<T, R, E>(collection: Iterable<T>, limit: number, iterator: (item: T, callback: (err?: E | null, result?: R) => void) => void, callback: (err?: E | null, results?: R[]) => void): void;
/**
 * Runs every task in parallel and collects the results in task order.
 * @template R
 * @template E
 * @param {((callback: (err?: E | null, result?: R) => void) => void)[]} tasks tasks to run
 * @param {(err?: E | null, results?: R[]) => void} callback called with every result, or with the first error
 * @returns {void}
 */
export function parallel<R, E>(tasks: ((callback: (err?: E | null, result?: R) => void) => void)[], callback: (err?: E | null, results?: R[]) => void): void;
