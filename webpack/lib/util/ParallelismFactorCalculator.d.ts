export = ParallelismFactorCalculator;
/** @typedef {(value: number) => void} Callback */
declare class ParallelismFactorCalculator {
    /** @type {number[]} */
    _rangePoints: number[];
    /** @type {Callback[]} */
    _rangeCallbacks: Callback[];
    /**
     * Processes the provided start.
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
type Callback = (value: number) => void;
