export = AMDDefineDependencyParserPlugin;
declare class AMDDefineDependencyParserPlugin {
    /**
     * Creates an instance of AMDDefineDependencyParserPlugin.
     * @param {JavascriptParserOptions} options parserOptions
     */
    constructor(options: JavascriptParserOptions);
    /** @type {JavascriptParserOptions} */
    options: JavascriptParserOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {JavascriptParser} parser the parser
     * @returns {void}
     */
    apply(parser: JavascriptParser): void;
    /**
     * Processes the provided parser.
     * @param {JavascriptParser} parser the parser
     * @param {CallExpression} expr call expression
     * @param {BasicEvaluatedExpression} param param
     * @param {Identifiers} identifiers identifiers
     * @param {string=} namedModule named module
     * @returns {boolean | undefined} result
     */
    processArray(parser: JavascriptParser, expr: CallExpression, param: BasicEvaluatedExpression, identifiers: Identifiers, namedModule?: string | undefined): boolean | undefined;
    /**
     * Processes the provided parser.
     * @param {JavascriptParser} parser the parser
     * @param {CallExpression} expr call expression
     * @param {BasicEvaluatedExpression} param param
     * @param {string=} namedModule named module
     * @returns {boolean | undefined} result
     */
    processItem(parser: JavascriptParser, expr: CallExpression, param: BasicEvaluatedExpression, namedModule?: string | undefined): boolean | undefined;
    /**
     * Processes the provided parser.
     * @param {JavascriptParser} parser the parser
     * @param {CallExpression} expr call expression
     * @param {BasicEvaluatedExpression} param param
     * @returns {boolean | undefined} result
     */
    processContext(parser: JavascriptParser, expr: CallExpression, param: BasicEvaluatedExpression): boolean | undefined;
    /**
     * Process call define.
     * @param {JavascriptParser} parser the parser
     * @param {CallExpression} expr call expression
     * @returns {boolean | undefined} result
     */
    processCallDefine(parser: JavascriptParser, expr: CallExpression): boolean | undefined;
    /**
     * New define dependency.
     * @param {Range} range range
     * @param {Range | null} arrayRange array range
     * @param {Range | null} functionRange function range
     * @param {Range | null} objectRange object range
     * @param {string | null} namedModule true, when define is called with a name
     * @returns {AMDDefineDependency} AMDDefineDependency
     */
    newDefineDependency(range: JavascriptParser.Range, arrayRange: JavascriptParser.Range | null, functionRange: JavascriptParser.Range | null, objectRange: JavascriptParser.Range | null, namedModule: string | null): AMDDefineDependency;
    /**
     * New require array dependency.
     * @param {(string | LocalModuleDependency | AMDRequireItemDependency)[]} depsArray deps array
     * @param {Range} range range
     * @returns {AMDRequireArrayDependency} AMDRequireArrayDependency
     */
    newRequireArrayDependency(depsArray: (string | LocalModuleDependency | AMDRequireItemDependency)[], range: JavascriptParser.Range): AMDRequireArrayDependency;
    /**
     * New require item dependency.
     * @param {string} request request
     * @param {Range=} range range
     * @returns {AMDRequireItemDependency} AMDRequireItemDependency
     */
    newRequireItemDependency(request: string, range?: JavascriptParser.Range | undefined): AMDRequireItemDependency;
}
declare namespace AMDDefineDependencyParserPlugin {
    export { UnboundFunctionExpression, Identifiers };
}
import type { JavascriptParserOptions } from "../../../declarations/WebpackOptions";
import type JavascriptParser from "../../javascript/JavascriptParser";
import type { CallExpression } from "estree";
import type BasicEvaluatedExpression from "../../javascript/BasicEvaluatedExpression";
import AMDDefineDependency = require("./AMDDefineDependency");
import LocalModuleDependency = require("./LocalModuleDependency");
import AMDRequireItemDependency = require("./AMDRequireItemDependency");
import AMDRequireArrayDependency = require("./AMDRequireArrayDependency");
type UnboundFunctionExpression = FunctionExpression | ArrowFunctionExpression;
type Identifiers = Record<number, string>;
import type { FunctionExpression } from "estree";
import type { ArrowFunctionExpression } from "estree";
