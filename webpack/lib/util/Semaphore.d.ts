export = Semaphore;
declare class Semaphore {
  /**
   * Creates an instance of Semaphore.
   * @param {number} available the amount available number of "tasks"
   * in the Semaphore
   */
  constructor(available: number);
  available: number;
  /** @type {(() => void)[]} */
  waiters: (() => void)[];
  _continue(): void;
  /**
   * @param {() => void} callback function block to capture and run
   * @returns {void}
   */
  acquire(callback: () => void): void;
  release(): void;
}
