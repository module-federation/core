export = PublicPathRuntimeModule;
/** @import { PublicPath } from "../../declarations/WebpackOptions" */
/** @import Compilation from "../Compilation" */
declare class PublicPathRuntimeModule extends RuntimeModule {
    /**
     * @param {PublicPath} publicPath public path
     */
    constructor(publicPath: PublicPath);
    /** @type {PublicPath} */
    publicPath: PublicPath;
}
import RuntimeModule = require("./RuntimeModule");
import type { PublicPath } from "../../declarations/WebpackOptions";
