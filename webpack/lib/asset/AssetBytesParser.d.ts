export = AssetBytesParser;
/** @import { BuiltAssetModule } from "./AssetModule" */
/** @import { ParserState, PreparsedAst } from "../module/Parser" */
/**
 * @extends {Parser<BuiltAssetModule>}
 */
declare class AssetBytesParser extends Parser<BuiltAssetModule> {
    constructor();
}
import type { BuiltAssetModule } from "./AssetModule";
import Parser = require("../module/Parser");
