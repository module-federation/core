export = UnusedFederationWarning;
/**
 * @typedef {object} UnusedFederationDetails
 * @property {string} name the share key or remote name, as declared
 * @property {"shared" | "remote"} kind which list declared it
 */
declare class UnusedFederationWarning extends WebpackError {
    /**
     * Creates an instance of UnusedFederationWarning.
     * @param {UnusedFederationDetails[]} entries the entries nothing used
     */
    constructor(entries: UnusedFederationDetails[]);
}
declare namespace UnusedFederationWarning {
    export { UnusedFederationDetails };
}
import WebpackError = require("./WebpackError");
type UnusedFederationDetails = {
    /**
     * the share key or remote name, as declared
     */
    name: string;
    /**
     * which list declared it
     */
    kind: "shared" | "remote";
};
