export = DebugHash;
/** @typedef {import("../../../declarations/WebpackOptions").HashDigest} Encoding */
declare class DebugHash extends Hash {
    string: string;
}
declare namespace DebugHash {
    export { Encoding };
}
import Hash = require("../Hash");
type Encoding = import("../../../declarations/WebpackOptions").HashDigest;
