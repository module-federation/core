export = EmbeddedSourceMapsWarning;
declare class EmbeddedSourceMapsWarning extends WebpackError {
    /**
     * Creates an instance of EmbeddedSourceMapsWarning.
     * @param {string} devtool the devtool that embeds them
     */
    constructor(devtool: string);
}
import WebpackError = require("./WebpackError");
