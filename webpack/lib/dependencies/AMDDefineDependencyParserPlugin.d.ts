export = AMDDefineDependencyParserPlugin;
declare class AMDDefineDependencyParserPlugin {
    /**
     * @param {JavascriptParserOptions} options parserOptions
     */
    constructor(options: JavascriptParserOptions);
    options: import("../../declarations/WebpackOptions").JavascriptParserOptions;
    /**
     * @param {JavascriptParser} parser the parser
     * @returns {void}
     */
    apply(parser: JavascriptParser): void;
    /**
     * @param {JavascriptParser} parser the parser
     * @param {CallExpression} expr call expression
     * @param {BasicEvaluatedExpression} param param
     * @param {Identifiers} identifiers identifiers
     * @param {string=} namedModule named module
     * @returns {boolean | undefined} result
     */
    processArray(parser: JavascriptParser, expr: CallExpression, param: BasicEvaluatedExpression, identifiers: Identifiers, namedModule?: string | undefined): boolean | undefined;
    /**
     * @param {JavascriptParser} parser the parser
     * @param {CallExpression} expr call expression
     * @param {BasicEvaluatedExpression} param param
     * @param {string=} namedModule named module
     * @returns {boolean | undefined} result
     */
    processItem(parser: JavascriptParser, expr: CallExpression, param: BasicEvaluatedExpression, namedModule?: string | undefined): boolean | undefined;
    /**
     * @param {JavascriptParser} parser the parser
     * @param {CallExpression} expr call expression
     * @param {BasicEvaluatedExpression} param param
     * @returns {boolean | undefined} result
     */
    processContext(parser: JavascriptParser, expr: CallExpression, param: BasicEvaluatedExpression): boolean | undefined;
    /**
     * @param {JavascriptParser} parser the parser
     * @param {CallExpression} expr call expression
     * @returns {boolean | undefined} result
     */
    processCallDefine(parser: JavascriptParser, expr: CallExpression): boolean | undefined;
    /**
     * @param {Range} range range
     * @param {Range | null} arrayRange array range
     * @param {Range | null} functionRange function range
     * @param {Range | null} objectRange object range
     * @param {string | null} namedModule true, when define is called with a name
     * @returns {AMDDefineDependency} AMDDefineDependency
     */
    newDefineDependency(range: Range, arrayRange: Range | null, functionRange: Range | null, objectRange: Range | null, namedModule: string | null): AMDDefineDependency;
    /**
     * @param {(string | LocalModuleDependency | AMDRequireItemDependency)[]} depsArray deps array
     * @param {Range} range range
     * @returns {AMDRequireArrayDependency} AMDRequireArrayDependency
     */
    newRequireArrayDependency(depsArray: (string | LocalModuleDependency | AMDRequireItemDependency)[], range: Range): AMDRequireArrayDependency;
    /**
     * @param {string} request request
     * @param {Range=} range range
     * @returns {AMDRequireItemDependency} AMDRequireItemDependency
     */
    newRequireItemDependency(request: string, range?: Range | undefined): AMDRequireItemDependency;
}
declare namespace AMDDefineDependencyParserPlugin {
    export { ArrowFunctionExpression, CallExpression, Expression, FunctionExpression, Identifier, Literal, MemberExpression, ObjectExpression, SpreadElement, JavascriptParserOptions, DependencyLocation, BasicEvaluatedExpression, JavascriptParser, ExportedVariableInfo, Range, UnboundFunctionExpression, Identifiers };
}
import AMDDefineDependency = require("./AMDDefineDependency");
import LocalModuleDependency = require("./LocalModuleDependency");
import AMDRequireItemDependency = require("./AMDRequireItemDependency");
import AMDRequireArrayDependency = require("./AMDRequireArrayDependency");
type ArrowFunctionExpression = import("estree").ArrowFunctionExpression;
type CallExpression = import("estree").CallExpression;
type Expression = import("estree").Expression;
type FunctionExpression = import("estree").FunctionExpression;
type Identifier = import("estree").Identifier;
type Literal = import("estree").Literal;
type MemberExpression = import("estree").MemberExpression;
type ObjectExpression = import("estree").ObjectExpression;
type SpreadElement = import("estree").SpreadElement;
type JavascriptParserOptions = import("../../declarations/WebpackOptions").JavascriptParserOptions;
type DependencyLocation = import("../Dependency").DependencyLocation;
type BasicEvaluatedExpression = import("../javascript/BasicEvaluatedExpression");
type JavascriptParser = import("../javascript/JavascriptParser");
type ExportedVariableInfo = import("../javascript/JavascriptParser").ExportedVariableInfo;
type Range = import("../javascript/JavascriptParser").Range;
type UnboundFunctionExpression = FunctionExpression | ArrowFunctionExpression;
type Identifiers = Record<number, string>;
