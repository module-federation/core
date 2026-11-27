export = ConflictingResourceHintsWarning;
/**
 * @typedef {object} ConflictingResourceHintDetails
 * @property {string} parent the chunk group the directives were written in
 * @property {string} child the chunk group they point at
 */
declare class ConflictingResourceHintsWarning extends WebpackError {
    /**
     * Creates an instance of ConflictingResourceHintsWarning.
     * @param {ConflictingResourceHintDetails[]} links the conflicting links, parent name first
     */
    constructor(links: ConflictingResourceHintDetails[]);
}
declare namespace ConflictingResourceHintsWarning {
    export { ConflictingResourceHintDetails };
}
import WebpackError = require("./WebpackError");
type ConflictingResourceHintDetails = {
    /**
     * the chunk group the directives were written in
     */
    parent: string;
    /**
     * the chunk group they point at
     */
    child: string;
};
