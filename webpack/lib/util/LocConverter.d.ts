export = LocConverter;
declare class LocConverter {
    /**
     * Creates an instance of LocConverter.
     * @param {string} input input
     */
    constructor(input: string);
    /** @type {string} */
    _input: string;
    /** @type {number} */
    line: number;
    /** @type {number} */
    column: number;
    /** @type {number} */
    pos: number;
    /** @type {number} */
    _nextNewline: number;
    /**
     * Returns location converter.
     * @param {number} pos position
     * @returns {LocConverter} location converter
     */
    get(pos: number): LocConverter;
}
