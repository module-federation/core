export = GetMainFilenameRuntimeModule;
/** @import Chunk from "../graph/Chunk" */
/** @import Compilation from "../Compilation" */
declare class GetMainFilenameRuntimeModule extends RuntimeModule {
    /**
     * @param {string} name readable name
     * @param {string} global global object binding
     * @param {string} filename main file name
     */
    constructor(name: string, global: string, filename: string);
    /** @type {string} */
    global: string;
    /** @type {string} */
    filename: string;
}
import RuntimeModule = require("./RuntimeModule");
