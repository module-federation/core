export = NodeStuffInWebError;
declare class NodeStuffInWebError extends WebpackError {
    /**
     * Creates an instance of NodeStuffInWebError.
     * @param {DependencyLocation} loc loc
     * @param {string} expression expression
     * @param {string} description description
     */
    constructor(loc: DependencyLocation, expression: string, description: string);
}
import WebpackError = require("./WebpackError");
import type { DependencyLocation } from "../graph/Dependency";
