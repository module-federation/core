export function approve(): boolean;
export function evaluateToBoolean(
  value: boolean,
): (expression: Expression) => BasicEvaluatedExpression;
export function evaluateToIdentifier(
  identifier: string,
  rootInfo: string,
  getMembers: GetMembers,
  truthy?: (boolean | null) | undefined,
): (expression: Expression) => BasicEvaluatedExpression;
export function evaluateToNumber(
  value: number,
): (expression: Expression) => BasicEvaluatedExpression;
export function evaluateToString(
  value: string,
): (expression: Expression) => BasicEvaluatedExpression;
export function expressionIsUnsupported(
  parser: JavascriptParser,
  message: string,
): (expression: Expression) => boolean | undefined;
export function skipTraversal(): boolean;
export function toConstantDependency(
  parser: JavascriptParser,
  value: string,
  runtimeRequirements?: (string[] | null) | undefined,
): (expression: Expression) => true;
export type Expression = import('estree').Expression;
export type SourceLocation = import('estree').SourceLocation;
export type JavascriptParser = import('./JavascriptParser');
export type Range = import('./JavascriptParser').Range;
export type GetMembers = import('./BasicEvaluatedExpression').GetMembers;
import BasicEvaluatedExpression = require('./BasicEvaluatedExpression');
