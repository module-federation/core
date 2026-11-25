export = AssetParser;
/** @import { BuiltAssetModule } from "./AssetModule" */
/**
 * @import {
 * 	AssetParserDataUrlOptions,
 * 	AssetParserOptions
 * } from "../../declarations/WebpackOptions"
 */
/** @import Module from "../module/Module" */
/** @import { ParserState, PreparsedAst } from "../module/Parser" */
/** @typedef {((source: string | Buffer, context: { filename: string, module: Module }) => boolean)} AssetParserDataUrlFunction */
/**
 * @extends {Parser<BuiltAssetModule>}
 */
declare class AssetParser extends Parser<BuiltAssetModule> {
    /**
     * Creates an instance of AssetParser.
     * @param {AssetParserOptions["dataUrlCondition"] | boolean} dataUrlCondition condition for inlining as DataUrl
     */
    constructor(dataUrlCondition: AssetParserOptions["dataUrlCondition"] | boolean);
    /** @type {AssetParserOptions["dataUrlCondition"] | boolean} */
    dataUrlCondition: AssetParserOptions["dataUrlCondition"] | boolean;
}
declare namespace AssetParser {
    export { AssetParserDataUrlFunction };
}
import type { BuiltAssetModule } from "./AssetModule";
import Parser = require("../module/Parser");
import type { AssetParserOptions } from "../../declarations/WebpackOptions";
type AssetParserDataUrlFunction = ((source: string | Buffer, context: {
    filename: string;
    module: Module;
}) => boolean);
import type Module from "../module/Module";
