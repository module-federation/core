export = UnusedModulesWarning;
/**
 * @typedef {object} UnusedModuleDetails
 * @property {string} name the module, by request
 * @property {number} size the bytes it adds to the bundle
 * @property {string} statement the statement that kept it, as `type at location`
 */
declare class UnusedModulesWarning extends WebpackError {
    /**
     * Creates an instance of UnusedModulesWarning.
     * @param {UnusedModuleDetails[]} modules the modules nothing uses
     * @param {number} total how many such modules there are
     * @param {number} size the bytes they add between them
     */
    constructor(modules: UnusedModuleDetails[], total: number, size: number);
}
declare namespace UnusedModulesWarning {
    export { UnusedModuleDetails };
}
import WebpackError = require("./WebpackError");
type UnusedModuleDetails = {
    /**
     * the module, by request
     */
    name: string;
    /**
     * the bytes it adds to the bundle
     */
    size: number;
    /**
     * the statement that kept it, as `type at location`
     */
    statement: string;
};
