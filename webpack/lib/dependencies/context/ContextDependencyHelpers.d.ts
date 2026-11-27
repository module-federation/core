export function create<T extends ContextDependencyConstructor>(Dep: T, range: JavascriptParser.Range, param: BasicEvaluatedExpression, expr: Expression, options: Pick<JavascriptParserOptions, `${"expr" | "wrapped"}Context${"Critical" | "Recursive" | "RegExp"}` | "exprContextRequest">, contextOptions: PartialContextDependencyOptions, parser: JavascriptParser, ...depArgs: GetAdditionalDepArgs<T>): ContextDependency;
export type PartialContextDependencyOptions = Partial<Omit<ContextDependency.ContextDependencyOptions, "resource">>;
export type ContextDependencyConstructor = {
    new (options: ContextDependency.ContextDependencyOptions, range: JavascriptParser.Range, valueRange: JavascriptParser.Range, ...args: never[]): ContextDependency;
};
/**
 * Defines the get additional dep args type used by this module.
 */
export type GetAdditionalDepArgs<T> = T extends new (options: ContextDependency.ContextDependencyOptions, range: JavascriptParser.Range, valueRange: JavascriptParser.Range, ...remains: infer R) => ContextDependency ? R : [];
import type JavascriptParser from "../../javascript/JavascriptParser";
import type BasicEvaluatedExpression from "../../javascript/BasicEvaluatedExpression";
import type { Expression } from "estree";
import type { JavascriptParserOptions } from "../../../declarations/WebpackOptions";
import type ContextDependency from "./ContextDependency";
