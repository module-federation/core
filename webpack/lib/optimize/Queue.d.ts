export = Queue;
/**
 * FIFO queue that keeps items unique by storing them in insertion order inside
 * a `Set`.
 * @template T
 */
declare class Queue<T> {
    /**
     * Seeds the queue with an optional iterable of initial unique items.
     * @param {Iterable<T>=} items The initial elements.
     */
    constructor(items?: Iterable<T> | undefined);
    /**
     * @private
     * @type {Set<T>}
     */
    private _set;
    /**
     * Returns the number of unique items currently waiting in the queue.
     * @returns {number} The number of elements in this queue.
     */
    get length(): number;
    /**
     * Enqueues an item, moving nothing if that value is already present.
     * @param {T} item The element to add.
     * @returns {void}
     */
    enqueue(item: T): void;
    /**
     * Removes and returns the oldest enqueued item.
     * @returns {T | undefined} The head of the queue of `undefined` if this queue is empty.
     */
    dequeue(): T | undefined;
}
