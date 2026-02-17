export type AmdOptions = import("./AMDPlugin").AmdOptions;
/** @typedef {import("./AMDPlugin").AmdOptions} AmdOptions */
export class AMDDefineRuntimeModule extends RuntimeModule {
    constructor();
}
export class AMDOptionsRuntimeModule extends RuntimeModule {
    /**
     * @param {AmdOptions} options the AMD options
     */
    constructor(options: AmdOptions);
    options: {
        [k: string]: any;
    };
}
import RuntimeModule = require("../RuntimeModule");
