export = EntrypointsOverSizeLimitWarning;
/** @import { EntrypointDetails } from "../performance/SizeLimitsPlugin" */
declare class EntrypointsOverSizeLimitWarning extends WebpackError {
    /**
     * Creates an instance of EntrypointsOverSizeLimitWarning.
     * @param {EntrypointDetails[]} entrypoints the entrypoints
     * @param {number} entrypointLimit the size limit
     */
    constructor(entrypoints: EntrypointDetails[], entrypointLimit: number);
    /** @type {EntrypointDetails[]} */
    entrypoints: EntrypointDetails[];
}
import WebpackError = require("./WebpackError");
import type { EntrypointDetails } from "../performance/SizeLimitsPlugin";
