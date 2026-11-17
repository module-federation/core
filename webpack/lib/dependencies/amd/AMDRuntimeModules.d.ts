/** @import { AmdOptions } from "./AMDPlugin" */
export class AMDDefineRuntimeModule extends RuntimeModule {
    constructor();
}
export class AMDOptionsRuntimeModule extends RuntimeModule {
    /**
     * Creates an instance of AMDOptionsRuntimeModule.
     * @param {AmdOptions} options the AMD options
     */
    constructor(options: AmdOptions);
    options: {
        [key: string]: any;
    };
}
import RuntimeModule = require("../../runtime/RuntimeModule");
import type { AmdOptions } from "./AMDPlugin";
