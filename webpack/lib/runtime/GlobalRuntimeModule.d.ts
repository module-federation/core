export = GlobalRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
declare class GlobalRuntimeModule extends RuntimeModule {
    constructor();
}
declare namespace GlobalRuntimeModule {
    export { Compilation };
}
import RuntimeModule = require("./RuntimeModule");
type Compilation = import("../Compilation");
