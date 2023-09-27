export = Queue;
/**
 * @template T
 */
declare class Queue<T> {
  /**
   * @param {Iterable<T>=} items The initial elements.
   */
  constructor(items?: Iterable<T> | undefined);
  /** @private @type {Set<T>} */
  private _set;
  /** @private @type {Iterator<T>} */
  private _iterator;
  /**
   * Returns the number of elements in this queue.
   * @returns {number} The number of elements in this queue.
   */
  get length(): number;
  /**
   * Appends the specified element to this queue.
   * @param {T} item The element to add.
   * @returns {void}
   */
  enqueue(item: T): void;
  /**
   * Retrieves and removes the head of this queue.
   * @returns {T | undefined} The head of the queue of `undefined` if this queue is empty.
   */
  dequeue(): T | undefined;
}
