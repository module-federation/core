export = TupleQueue;
/**
 * FIFO queue for tuples that preserves uniqueness by delegating membership
 * tracking to `TupleSet`.
 * @template {EXPECTED_ANY[]} K
 * @template V
 */
declare class TupleQueue<K extends EXPECTED_ANY[], V> {
    /**
     * Seeds the queue with an optional iterable of tuples to visit.
     * @param {Iterable<[...K, V]>=} items The initial elements.
     */
    constructor(items?: Iterable<[...K, V]> | undefined);
    /**
     * @private
     * @type {TupleSet<K, V>}
     */
    private _set;
    /**
     * @private
     * @type {Iterator<[...K, V]>}
     */
    private _iterator;
    /**
     * Returns the number of distinct tuples currently queued.
     * @returns {number} The number of elements in this queue.
     */
    get length(): number;
    /**
     * Enqueues a tuple if it is not already present in the underlying set.
     * @param {[...K, V]} item The element to add.
     * @returns {void}
     */
    enqueue(...item: [...K, V]): void;
    /**
     * Removes and returns the next queued tuple, rebuilding the iterator when
     * the underlying tuple set has changed since the last full pass.
     * @returns {[...K, V] | undefined} The head of the queue of `undefined` if this queue is empty.
     */
    dequeue(): [...K, V] | undefined;
}
