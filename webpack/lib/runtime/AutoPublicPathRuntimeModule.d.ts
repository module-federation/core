export = AutoPublicPathRuntimeModule;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compilation")} Compilation */
declare class AutoPublicPathRuntimeModule extends RuntimeModule {
    constructor();
}
declare namespace AutoPublicPathRuntimeModule {
    export { Chunk, Compilation };
}
import RuntimeModule = require("../RuntimeModule");
type Chunk = import("../Chunk");
type Compilation = import("../Compilation");
