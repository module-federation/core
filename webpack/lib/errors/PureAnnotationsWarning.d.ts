export = PureAnnotationsWarning;
/**
 * @typedef {object} PureAnnotationDetails
 * @property {string} name the module, shortened for the report
 * @property {number} count how many of its annotations do nothing
 */
declare class PureAnnotationsWarning extends WebpackError {
    /**
     * Creates an instance of PureAnnotationsWarning.
     * @param {PureAnnotationDetails[]} modules the worst offenders, most first
     * @param {number} total how many annotations do nothing in all
     */
    constructor(modules: PureAnnotationDetails[], total: number);
}
declare namespace PureAnnotationsWarning {
    export { PureAnnotationDetails };
}
import WebpackError = require("./WebpackError");
type PureAnnotationDetails = {
    /**
     * the module, shortened for the report
     */
    name: string;
    /**
     * how many of its annotations do nothing
     */
    count: number;
};
