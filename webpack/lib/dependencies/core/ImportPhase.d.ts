/**
 * Defines the import phase utils type used by this module.
 */
export type ImportPhaseUtils = {
    /**
     * true if phase is evaluation
     */
    isEvaluation: (phase: ImportPhaseType | undefined) => boolean;
    /**
     * true if phase is defer
     */
    isDefer: (phase: ImportPhaseType | undefined) => boolean;
    /**
     * true if phase is source
     */
    isSource: (phase: ImportPhaseType | undefined) => boolean;
    /**
     * return stringified name of phase
     */
    stringify: (phase: ImportPhaseType) => ImportPhaseName;
};
/**
 * Defines the get comment options type used by this module.
 */
export type GetCommentOptions = () => MagicCommentOptions | null;
/**
 * Defines the get import phase callback.
 */
export type GetImportPhase = (parser: JavascriptParser, node: ExportNamedDeclaration | ExportAllDeclaration | ImportDeclaration | JavascriptParser.ImportExpression, getCommentOptions?: GetCommentOptions | undefined) => ImportPhaseType;
export type ImportPhaseType = typeof ImportPhase.Evaluation | typeof ImportPhase.Defer | typeof ImportPhase.Source;
export type ImportPhaseName = "defer" | "source" | "evaluation";
/**
 * @import {
 * 	ExportAllDeclaration,
 * 	ExportNamedDeclaration,
 * 	ImportDeclaration
 * } from "estree"
 */
/**
 * @import JavascriptParser, {
 * 	ImportExpression
 * } from "../../javascript/JavascriptParser"
 */
/** @import { MagicCommentOptions } from "../../util/magicComment" */
/** @typedef {typeof ImportPhase.Evaluation | typeof ImportPhase.Defer | typeof ImportPhase.Source}  ImportPhaseType */
export const ImportPhase: Readonly<{
    Evaluation: 0;
    Defer: 1;
    Source: 2;
}>;
/** @typedef {"defer" | "source" | "evaluation"} ImportPhaseName */
/**
 * Defines the import phase utils type used by this module.
 * @typedef {object} ImportPhaseUtils
 * @property {(phase: ImportPhaseType | undefined) => boolean} isEvaluation true if phase is evaluation
 * @property {(phase: ImportPhaseType | undefined) => boolean} isDefer true if phase is defer
 * @property {(phase: ImportPhaseType | undefined) => boolean} isSource true if phase is source
 * @property {(phase: ImportPhaseType) => ImportPhaseName} stringify return stringified name of phase
 */
/** @type {ImportPhaseUtils} */
export const ImportPhaseUtils: ImportPhaseUtils;
/**
 * Defines the get comment options type used by this module.
 * @typedef {() => MagicCommentOptions | null} GetCommentOptions
 */
/**
 * Defines the get import phase callback.
 * @callback GetImportPhase
 * @param {JavascriptParser} parser parser
 * @param {ExportNamedDeclaration | ExportAllDeclaration | ImportDeclaration | ImportExpression} node node
 * @param {GetCommentOptions=} getCommentOptions optional function that returns the comment options object.
 * @returns {ImportPhaseType} import phase
 */
/**
 * Creates an import phase resolver.
 * @param {boolean=} enableDeferPhase enable defer phase detection
 * @param {boolean=} enableSourcePhase enable source phase detection
 * @returns {GetImportPhase} evaluates the import phase for ast node
 */
export function createGetImportPhase(enableDeferPhase?: boolean | undefined, enableSourcePhase?: boolean | undefined): GetImportPhase;
import type { MagicCommentOptions } from "../../util/magicComment";
import type JavascriptParser from "../../javascript/JavascriptParser";
import type { ExportNamedDeclaration } from "estree";
import type { ExportAllDeclaration } from "estree";
import type { ImportDeclaration } from "estree";
