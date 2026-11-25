export = LegacyJavascriptWarning;
/**
 * @typedef {object} LegacyPackageDetails
 * @property {string} name the package doing the emulating
 * @property {number} modules how many of its modules are in the build
 * @property {number} size bytes they contribute
 */
declare class LegacyJavascriptWarning extends WebpackError {
    /**
     * Creates an instance of LegacyJavascriptWarning.
     * @param {LegacyPackageDetails[]} packages the ones found, largest first
     * @param {number} totalSize bytes they contribute between them
     * @param {string[]} features the ones the target already has
     */
    constructor(packages: LegacyPackageDetails[], totalSize: number, features: string[]);
}
declare namespace LegacyJavascriptWarning {
    export { LegacyPackageDetails };
}
import WebpackError = require("./WebpackError");
type LegacyPackageDetails = {
    /**
     * the package doing the emulating
     */
    name: string;
    /**
     * how many of its modules are in the build
     */
    modules: number;
    /**
     * bytes they contribute
     */
    size: number;
};
