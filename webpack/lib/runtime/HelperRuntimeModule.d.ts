export = HelperRuntimeModule;
/** @import Chunk from "../graph/Chunk" */
/** @import ChunkGraph from "../graph/ChunkGraph" */
/**
 * Base class for runtime modules that only emit helper functions and do not
 * need special staging or attachment behavior beyond `RuntimeModule`.
 */
declare class HelperRuntimeModule extends RuntimeModule {
    /**
     * Creates a helper runtime module with the provided readable name.
     * @param {string} name a readable name
     */
    constructor(name: string);
    /**
     * Whether a hot update can deliver this helper, which then runs outside the
     * bootstrap scope and reaches its state only through `__webpack_require__`.
     * @returns {boolean} true, when the runtime accepts hot updates
     */
    receivesHotUpdates(): boolean;
}
import RuntimeModule = require("./RuntimeModule");
