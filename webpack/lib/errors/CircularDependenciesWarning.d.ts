export = CircularDependenciesWarning;
/**
 * @typedef {object} CircularDependencyDetails
 * @property {number} size how many modules can all reach each other
 * @property {string} cycle the shortest cycle through one of them
 */
declare class CircularDependenciesWarning extends WebpackError {
    /**
     * Creates an instance of CircularDependenciesWarning.
     * @param {CircularDependencyDetails[]} groups the largest groups, biggest first
     * @param {number} total how many groups of modules import each other
     */
    constructor(groups: CircularDependencyDetails[], total: number);
}
declare namespace CircularDependenciesWarning {
    export { CircularDependencyDetails };
}
import WebpackError = require("./WebpackError");
type CircularDependencyDetails = {
    /**
     * how many modules can all reach each other
     */
    size: number;
    /**
     * the shortest cycle through one of them
     */
    cycle: string;
};
