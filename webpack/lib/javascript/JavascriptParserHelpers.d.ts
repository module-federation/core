export function toConstantDependency(
  parser: JavascriptParser,
  value: string,
  runtimeRequirements?: string[] | undefined,
): (arg0: Expression) => true;
export function evaluateToString(
  value: string,
): (arg0: Expression) => BasicEvaluatedExpression;
export function evaluateToNumber(
  value: number,
): (arg0: Expression) => BasicEvaluatedExpression;
export function evaluateToBoolean(
  value: boolean,
): (arg0: Expression) => BasicEvaluatedExpression;
export function evaluateToIdentifier(
  identifier: string,
  rootInfo: string,
  getMembers: () => string[],
  truthy?: (boolean | null) | undefined,
): (arg0: Expression) => BasicEvaluatedExpression;
export function expressionIsUnsupported(
  parser: JavascriptParser,
  message: string,
): (arg0: Expression) => boolean | undefined;
export function skipTraversal(): boolean;
export function approve(): boolean;
export type Expression = import('estree').Expression;
export type Node = import('estree').Node;
export type SourceLocation = import('estree').SourceLocation;
export type JavascriptParser = import('./JavascriptParser');
export type Range = import('./JavascriptParser').Range;
import BasicEvaluatedExpression = require('./BasicEvaluatedExpression');
