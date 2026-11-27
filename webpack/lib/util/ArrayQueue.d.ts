export = ArrayQueue;
/**
 * FIFO queue backed by arrays with a reversed dequeue buffer to avoid the cost
 * of repeated `Array#shift` operations.
 * @template T
 */
declare class ArrayQueue<T> {
    /**
     * Seeds the queue with an optional iterable of items in dequeue order.
     * @param {Iterable<T>=} items The initial elements.
     */
    constructor(items?: Iterable<T> | undefined);
    /**
     * @private
     * @type {T[]}
     */
    private _list;
    /**
     * @private
     * @type {T[]}
     */
    private _listReversed;
    /**
     * Returns the current number of items waiting in either internal buffer.
     * @returns {number} The number of elements in this queue.
     */
    get length(): number;
    /**
     * Removes all pending items from both internal buffers.
     */
    clear(): void;
    /**
     * Appends an item to the tail of the queue.
     * @param {T} item The element to add.
     * @returns {void}
     */
    enqueue(item: T): void;
    /**
     * Removes and returns the next item in FIFO order, switching to a reversed
     * buffer when that is cheaper than shifting from the front of the array.
     * @returns {T | undefined} The head of the queue of `undefined` if this queue is empty.
     */
    dequeue(): T | undefined;
    /**
     * Removes the first matching item from whichever internal buffer currently
     * contains it.
     * @param {T} item the item
     * @returns {void}
     */
    delete(item: T): void;
    [Symbol.iterator](): {
        next: () => {
            done: boolean;
            value: T;
        };
    };
}
