export type ImportPhaseUtils = {
  /**
   * true if phase is defer
   */
  isDefer: (phase: ImportPhaseType) => boolean;
  /**
   * true if phase is source
   */
  isSource: (phase: ImportPhaseType) => boolean;
};
export type GetCommentOptions = () => Record<string, EXPECTED_ANY> | null;
export type GetImportPhase = (
  parser: JavascriptParser,
  node:
    | ExportNamedDeclaration
    | ExportAllDeclaration
    | ImportDeclaration
    | ImportExpression,
  getCommentOptions?: GetCommentOptions | undefined,
) => ImportPhaseType;
export type JavascriptParser = import('../javascript/JavascriptParser');
export type ExportAllDeclaration =
  import('../javascript/JavascriptParser').ExportAllDeclaration;
export type ExportNamedDeclaration =
  import('../javascript/JavascriptParser').ExportNamedDeclaration;
export type ImportDeclaration =
  import('../javascript/JavascriptParser').ImportDeclaration;
export type ImportExpression =
  import('../javascript/JavascriptParser').ImportExpression;
export type ImportPhaseType =
  | typeof ImportPhase.Evaluation
  | typeof ImportPhase.Defer
  | typeof ImportPhase.Source;
/** @typedef {import("../javascript/JavascriptParser")} JavascriptParser */
/** @typedef {import("../javascript/JavascriptParser").ExportAllDeclaration} ExportAllDeclaration */
/** @typedef {import("../javascript/JavascriptParser").ExportNamedDeclaration} ExportNamedDeclaration */
/** @typedef {import("../javascript/JavascriptParser").ImportDeclaration} ImportDeclaration */
/** @typedef {import("../javascript/JavascriptParser").ImportExpression} ImportExpression */
/** @typedef {typeof ImportPhase.Evaluation | typeof ImportPhase.Defer | typeof ImportPhase.Source}  ImportPhaseType */
export const ImportPhase: Readonly<{
  Evaluation: 0;
  Defer: 1;
  Source: 2;
}>;
/**
 * @typedef {object} ImportPhaseUtils
 * @property {(phase: ImportPhaseType) => boolean} isDefer true if phase is defer
 * @property {(phase: ImportPhaseType) => boolean} isSource true if phase is source
 */
/** @type {ImportPhaseUtils} */
export const ImportPhaseUtils: ImportPhaseUtils;
/**
 * @typedef {() => Record<string, EXPECTED_ANY> | null} GetCommentOptions
 */
/**
 * @callback GetImportPhase
 * @param {JavascriptParser} parser parser
 * @param {ExportNamedDeclaration | ExportAllDeclaration | ImportDeclaration | ImportExpression} node node
 * @param {GetCommentOptions=} getCommentOptions optional function that returns the comment options object.
 * @returns {ImportPhaseType} import phase
 */
/**
 * @param {boolean=} enableImportPhase enable import phase detection
 * @returns {GetImportPhase} evaluates the import phase for ast node
 */
export function createGetImportPhase(
  enableImportPhase?: boolean | undefined,
): GetImportPhase;
