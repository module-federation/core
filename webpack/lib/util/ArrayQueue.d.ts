export = ArrayQueue;
/**
 * @template T
 */
declare class ArrayQueue<T> {
  /**
   * @param {Iterable<T>=} items The initial elements.
   */
  constructor(items?: Iterable<T> | undefined);
  /** @private @type {T[]} */
  private _list;
  /** @private @type {T[]} */
  private _listReversed;
  /**
   * Returns the number of elements in this queue.
   * @returns {number} The number of elements in this queue.
   */
  get length(): number;
  /**
   * Empties the queue.
   */
  clear(): void;
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
  /**
   * Finds and removes an item
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
