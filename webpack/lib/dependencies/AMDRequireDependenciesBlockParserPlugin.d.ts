export = AMDRequireDependenciesBlockParserPlugin;
declare class AMDRequireDependenciesBlockParserPlugin {
    /**
     * @param {JavascriptParserOptions} options parserOptions
     */
    constructor(options: JavascriptParserOptions);
    options: import("../../declarations/WebpackOptions").JavascriptParserOptions;
    /**
     * @param {JavascriptParser} parser the parser
     * @param {Expression | SpreadElement} expression expression
     * @returns {boolean} need bind this
     */
    processFunctionArgument(parser: JavascriptParser, expression: Expression | SpreadElement): boolean;
    /**
     * @param {JavascriptParser} parser the parser
     * @returns {void}
     */
    apply(parser: JavascriptParser): void;
    /**
     * @param {JavascriptParser} parser the parser
     * @param {CallExpression} expr call expression
     * @param {BasicEvaluatedExpression} param param
     * @returns {boolean | undefined} result
     */
    processArray(parser: JavascriptParser, expr: CallExpression, param: BasicEvaluatedExpression): boolean | undefined;
    /**
     * @param {JavascriptParser} parser the parser
     * @param {CallExpression} expr call expression
     * @param {BasicEvaluatedExpression} param param
     * @returns {boolean | undefined} result
     */
    processItem(parser: JavascriptParser, expr: CallExpression, param: BasicEvaluatedExpression): boolean | undefined;
    /**
     * @param {JavascriptParser} parser the parser
     * @param {CallExpression} expr call expression
     * @param {BasicEvaluatedExpression} param param
     * @returns {boolean | undefined} result
     */
    processContext(parser: JavascriptParser, expr: CallExpression, param: BasicEvaluatedExpression): boolean | undefined;
    /**
     * @param {BasicEvaluatedExpression} param param
     * @returns {string | undefined} result
     */
    processArrayForRequestString(param: BasicEvaluatedExpression): string | undefined;
    /**
     * @param {BasicEvaluatedExpression} param param
     * @returns {string | undefined} result
     */
    processItemForRequestString(param: BasicEvaluatedExpression): string | undefined;
    /**
     * @param {JavascriptParser} parser the parser
     * @param {CallExpression} expr call expression
     * @returns {boolean | undefined} result
     */
    processCallRequire(parser: JavascriptParser, expr: CallExpression): boolean | undefined;
    /**
     * @param {DependencyLocation} loc location
     * @param {string=} request request
     * @returns {AMDRequireDependenciesBlock} AMDRequireDependenciesBlock
     */
    newRequireDependenciesBlock(loc: DependencyLocation, request?: string | undefined): AMDRequireDependenciesBlock;
    /**
     * @param {Range} outerRange outer range
     * @param {Range} arrayRange array range
     * @param {Range | null} functionRange function range
     * @param {Range | null} errorCallbackRange error callback range
     * @returns {AMDRequireDependency} dependency
     */
    newRequireDependency(outerRange: Range, arrayRange: Range, functionRange: Range | null, errorCallbackRange: Range | null): AMDRequireDependency;
    /**
     * @param {string} request request
     * @param {Range=} range range
     * @returns {AMDRequireItemDependency} AMDRequireItemDependency
     */
    newRequireItemDependency(request: string, range?: Range | undefined): AMDRequireItemDependency;
    /**
     * @param {(string | LocalModuleDependency | AMDRequireItemDependency)[]} depsArray deps array
     * @param {Range} range range
     * @returns {AMDRequireArrayDependency} AMDRequireArrayDependency
     */
    newRequireArrayDependency(depsArray: (string | LocalModuleDependency | AMDRequireItemDependency)[], range: Range): AMDRequireArrayDependency;
}
declare namespace AMDRequireDependenciesBlockParserPlugin {
    export { CallExpression, Expression, Identifier, SourceLocation, SpreadElement, JavascriptParserOptions, DependencyLocation, BasicEvaluatedExpression, JavascriptParser, Range };
}
import AMDRequireDependenciesBlock = require("./AMDRequireDependenciesBlock");
import AMDRequireDependency = require("./AMDRequireDependency");
import AMDRequireItemDependency = require("./AMDRequireItemDependency");
import LocalModuleDependency = require("./LocalModuleDependency");
import AMDRequireArrayDependency = require("./AMDRequireArrayDependency");
type CallExpression = import("estree").CallExpression;
type Expression = import("estree").Expression;
type Identifier = import("estree").Identifier;
type SourceLocation = import("estree").SourceLocation;
type SpreadElement = import("estree").SpreadElement;
type JavascriptParserOptions = import("../../declarations/WebpackOptions").JavascriptParserOptions;
type DependencyLocation = import("../Dependency").DependencyLocation;
type BasicEvaluatedExpression = import("../javascript/BasicEvaluatedExpression");
type JavascriptParser = import("../javascript/JavascriptParser");
type Range = import("../javascript/JavascriptParser").Range;
