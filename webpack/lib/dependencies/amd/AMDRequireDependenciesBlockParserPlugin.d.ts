export = AMDRequireDependenciesBlockParserPlugin;
declare class AMDRequireDependenciesBlockParserPlugin {
    /**
     * Creates an instance of AMDRequireDependenciesBlockParserPlugin.
     * @param {JavascriptParserOptions} options parserOptions
     */
    constructor(options: JavascriptParserOptions);
    /** @type {JavascriptParserOptions} */
    options: JavascriptParserOptions;
    /**
     * Process function argument.
     * @param {JavascriptParser} parser the parser
     * @param {Expression | SpreadElement} expression expression
     * @returns {boolean} need bind this
     */
    processFunctionArgument(parser: JavascriptParser, expression: Expression | SpreadElement): boolean;
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
     * @returns {boolean | undefined} result
     */
    processArray(parser: JavascriptParser, expr: CallExpression, param: BasicEvaluatedExpression): boolean | undefined;
    /**
     * Processes the provided parser.
     * @param {JavascriptParser} parser the parser
     * @param {CallExpression} expr call expression
     * @param {BasicEvaluatedExpression} param param
     * @returns {boolean | undefined} result
     */
    processItem(parser: JavascriptParser, expr: CallExpression, param: BasicEvaluatedExpression): boolean | undefined;
    /**
     * Processes the provided parser.
     * @param {JavascriptParser} parser the parser
     * @param {CallExpression} expr call expression
     * @param {BasicEvaluatedExpression} param param
     * @returns {boolean | undefined} result
     */
    processContext(parser: JavascriptParser, expr: CallExpression, param: BasicEvaluatedExpression): boolean | undefined;
    /**
     * Process array for request string.
     * @param {BasicEvaluatedExpression} param param
     * @returns {string | undefined} result
     */
    processArrayForRequestString(param: BasicEvaluatedExpression): string | undefined;
    /**
     * Process item for request string.
     * @param {BasicEvaluatedExpression} param param
     * @returns {string | undefined} result
     */
    processItemForRequestString(param: BasicEvaluatedExpression): string | undefined;
    /**
     * Process call require.
     * @param {JavascriptParser} parser the parser
     * @param {CallExpression} expr call expression
     * @returns {boolean | undefined} result
     */
    processCallRequire(parser: JavascriptParser, expr: CallExpression): boolean | undefined;
    /**
     * New require dependencies block.
     * @param {DependencyLocation} loc location
     * @param {string=} request request
     * @returns {AMDRequireDependenciesBlock} AMDRequireDependenciesBlock
     */
    newRequireDependenciesBlock(loc: Dependency.DependencyLocation, request?: string | undefined): AMDRequireDependenciesBlock;
    /**
     * New require dependency.
     * @param {Range} outerRange outer range
     * @param {Range} arrayRange array range
     * @param {Range | null} functionRange function range
     * @param {Range | null} errorCallbackRange error callback range
     * @returns {AMDRequireDependency} dependency
     */
    newRequireDependency(outerRange: JavascriptParser.Range, arrayRange: JavascriptParser.Range, functionRange: JavascriptParser.Range | null, errorCallbackRange: JavascriptParser.Range | null): AMDRequireDependency;
    /**
     * New require item dependency.
     * @param {string} request request
     * @param {Range=} range range
     * @returns {AMDRequireItemDependency} AMDRequireItemDependency
     */
    newRequireItemDependency(request: string, range?: JavascriptParser.Range | undefined): AMDRequireItemDependency;
    /**
     * New require array dependency.
     * @param {(string | LocalModuleDependency | AMDRequireItemDependency)[]} depsArray deps array
     * @param {Range} range range
     * @returns {AMDRequireArrayDependency} AMDRequireArrayDependency
     */
    newRequireArrayDependency(depsArray: (string | LocalModuleDependency | AMDRequireItemDependency)[], range: JavascriptParser.Range): AMDRequireArrayDependency;
}
import type { JavascriptParserOptions } from "../../../declarations/WebpackOptions";
import type JavascriptParser from "../../javascript/JavascriptParser";
import type { Expression } from "estree";
import type { SpreadElement } from "estree";
import type { CallExpression } from "estree";
import type BasicEvaluatedExpression from "../../javascript/BasicEvaluatedExpression";
import type Dependency from "../../graph/Dependency";
import AMDRequireDependenciesBlock = require("./AMDRequireDependenciesBlock");
import AMDRequireDependency = require("./AMDRequireDependency");
import AMDRequireItemDependency = require("./AMDRequireItemDependency");
import LocalModuleDependency = require("./LocalModuleDependency");
import AMDRequireArrayDependency = require("./AMDRequireArrayDependency");
