export = ParallelismFactorCalculator;
/** @typedef {function(number): void} Callback */
declare class ParallelismFactorCalculator {
  /** @type {number[]} */
  _rangePoints: number[];
  /** @type {Callback[]} */
  _rangeCallbacks: Callback[];
  /**
   * @param {number} start range start
   * @param {number} end range end
   * @param {Callback} callback callback
   * @returns {void}
   */
  range(start: number, end: number, callback: Callback): void;
  calculate(): void;
}
declare namespace ParallelismFactorCalculator {
  export { Callback };
}
type Callback = (arg0: number) => void;
