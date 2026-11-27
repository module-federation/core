export = JsonParser;
/** @import { BuiltJsonModule } from "./JsonModule" */
/** @import { JsonParserOptions } from "../../declarations/WebpackOptions" */
/** @import { ParserState, PreparsedAst } from "../module/Parser" */
/** @import { JsonValue } from "../fs/fs" */
/** @typedef {(input: string) => Buffer | JsonValue} ParseFn */
/**
 * Defines the function returning type used by this module.
 * @template T
 * @typedef {import("../util/memoize").FunctionReturning<T>} FunctionReturning
 */
/**
 * @extends {Parser<BuiltJsonModule>}
 */
declare class JsonParser extends Parser<BuiltJsonModule> {
    /**
     * Creates an instance of JsonParser.
     * @param {JsonParserOptions} options parser options
     */
    constructor(options?: JsonParserOptions);
    /** @type {JsonParserOptions} */
    options: JsonParserOptions;
}
declare namespace JsonParser {
    export { ParseFn, FunctionReturning };
}
import type { BuiltJsonModule } from "./JsonModule";
import Parser = require("../module/Parser");
import type { JsonParserOptions } from "../../declarations/WebpackOptions";
type ParseFn = (input: string) => Buffer | JsonValue;
/**
 * Defines the function returning type used by this module.
 */
type FunctionReturning<T> = import("../util/memoize").FunctionReturning<T>;
import type { JsonValue } from "../fs/fs";
