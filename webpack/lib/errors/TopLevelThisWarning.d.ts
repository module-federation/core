export = TopLevelThisWarning;
/**
 * @typedef {object} TopLevelThisDetails
 * @property {string} name the module, by request
 * @property {number} count how many times it reads `this` at the top level
 */
declare class TopLevelThisWarning extends WebpackError {
    /**
     * Creates an instance of TopLevelThisWarning.
     * @param {TopLevelThisDetails[]} modules the modules that do it
     * @param {number} total how many such reads there are in all
     */
    constructor(modules: TopLevelThisDetails[], total: number);
}
declare namespace TopLevelThisWarning {
    export { TopLevelThisDetails };
}
import WebpackError = require("./WebpackError");
type TopLevelThisDetails = {
    /**
     * the module, by request
     */
    name: string;
    /**
     * how many times it reads `this` at the top level
     */
    count: number;
};
