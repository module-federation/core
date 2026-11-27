export = DuplicatePackagesWarning;
/**
 * Warning emitted when one package is included more than once in a build,
 * either in different versions or as several copies of the same version.
 */
declare class DuplicatePackagesWarning extends WebpackError {
    /**
     * @param {string} name name of the package
     * @param {PackageCopy[]} copies copies of the package, sorted by path
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {RequestShortener} requestShortener the request shortener
     */
    constructor(name: string, copies: PackageCopy[], moduleGraph: ModuleGraph, requestShortener: RequestShortener);
}
import WebpackError = require("./WebpackError");
import type { PackageCopy } from "../performance/DuplicatePackagesPlugin";
import type ModuleGraph from "../graph/ModuleGraph";
import type RequestShortener from "../util/RequestShortener";
