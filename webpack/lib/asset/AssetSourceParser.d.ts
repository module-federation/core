export = AssetSourceParser;
/** @import { BuiltAssetModule } from "./AssetModule" */
/** @import { ParserState, PreparsedAst } from "../module/Parser" */
/**
 * @extends {Parser<BuiltAssetModule>}
 */
declare class AssetSourceParser extends Parser<BuiltAssetModule> {
    constructor();
}
import type { BuiltAssetModule } from "./AssetModule";
import Parser = require("../module/Parser");
