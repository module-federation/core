export = CaseSensitiveModulesWarning;
/**
 * Warning emitted when webpack finds modules whose identifiers differ only by
 * letter casing, which can behave inconsistently across filesystems.
 */
declare class CaseSensitiveModulesWarning extends WebpackError {
    /**
     * Builds a warning message that lists the case-conflicting modules and
     * representative importers that caused them to be included.
     * @param {Iterable<Module>} modules modules that were detected
     * @param {ModuleGraph} moduleGraph the module graph
     */
    constructor(modules: Iterable<Module>, moduleGraph: ModuleGraph);
}
import WebpackError = require("./WebpackError");
import type Module from "../module/Module";
import type ModuleGraph from "../graph/ModuleGraph";
