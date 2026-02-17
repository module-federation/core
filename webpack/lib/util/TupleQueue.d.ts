export = TupleQueue;
/**
 * @template T
 * @template V
 */
declare class TupleQueue<T, V> {
    /**
     * @param {Iterable<[T, V, ...EXPECTED_ANY]>=} items The initial elements.
     */
    constructor(items?: Iterable<[T, V, ...EXPECTED_ANY]> | undefined);
    /**
     * @private
     * @type {TupleSet<T, V>}
     */
    private _set;
    /**
     * @private
     * @type {Iterator<[T, V, ...EXPECTED_ANY]>}
     */
    private _iterator;
    /**
     * Returns the number of elements in this queue.
     * @returns {number} The number of elements in this queue.
     */
    get length(): number;
    /**
     * Appends the specified element to this queue.
     * @param {[T, V, ...EXPECTED_ANY]} item The element to add.
     * @returns {void}
     */
    enqueue(item_0: T, item_1: V, ...item: EXPECTED_ANY[]): void;
    /**
     * Retrieves and removes the head of this queue.
     * @returns {[T, V, ...EXPECTED_ANY] | undefined} The head of the queue of `undefined` if this queue is empty.
     */
    dequeue(): [T, V, ...EXPECTED_ANY] | undefined;
}
