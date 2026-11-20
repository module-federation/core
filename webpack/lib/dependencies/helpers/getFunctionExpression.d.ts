declare namespace _exports {
    export { FunctionExpressionResult };
}
declare function _exports(expr: Expression | SpreadElement): FunctionExpressionResult | undefined;
export = _exports;
type FunctionExpressionResult = {
    fn: FunctionExpression | ArrowFunctionExpression;
    expressions: (Expression | SpreadElement)[];
    needThis: boolean | undefined;
};
import type { Expression } from "estree";
import type { SpreadElement } from "estree";
import type { FunctionExpression } from "estree";
import type { ArrowFunctionExpression } from "estree";
