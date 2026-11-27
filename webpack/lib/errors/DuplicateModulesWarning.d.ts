export = DuplicateModulesWarning;
/**
 * @typedef {object} DuplicateModuleDetails
 * @property {string} name
 * @property {number} chunks how many chunks carry a copy
 * @property {string[]} entrypoints the entrypoints those chunks belong to, when more than one
 * @property {number} wasted bytes the extra copies cost
 */
declare class DuplicateModulesWarning extends WebpackError {
    /**
     * Creates an instance of DuplicateModulesWarning.
     * @param {DuplicateModuleDetails[]} modules the worst offenders, largest waste first
     * @param {number} wasted bytes all duplicated copies cost together
     */
    constructor(modules: DuplicateModuleDetails[], wasted: number);
}
declare namespace DuplicateModulesWarning {
    export { DuplicateModuleDetails };
}
import WebpackError = require("./WebpackError");
type DuplicateModuleDetails = {
    name: string;
    /**
     * how many chunks carry a copy
     */
    chunks: number;
    /**
     * the entrypoints those chunks belong to, when more than one
     */
    entrypoints: string[];
    /**
     * bytes the extra copies cost
     */
    wasted: number;
};
