export = LargeModulesWarning;
/**
 * @typedef {object} LargeModuleDetails
 * @property {string} name the module, shortened for the report
 * @property {string} chunk the chunk it weighs down
 * @property {number} size bytes the module contributes
 * @property {number} chunkSize bytes the whole chunk contributes
 */
declare class LargeModulesWarning extends WebpackError {
    /**
     * Creates an instance of LargeModulesWarning.
     * @param {LargeModuleDetails[]} modules the worst offenders, largest first
     * @param {number} total how many dominating modules there are in all
     */
    constructor(modules: LargeModuleDetails[], total: number);
}
declare namespace LargeModulesWarning {
    export { LargeModuleDetails };
}
import WebpackError = require("./WebpackError");
type LargeModuleDetails = {
    /**
     * the module, shortened for the report
     */
    name: string;
    /**
     * the chunk it weighs down
     */
    chunk: string;
    /**
     * bytes the module contributes
     */
    size: number;
    /**
     * bytes the whole chunk contributes
     */
    chunkSize: number;
};
