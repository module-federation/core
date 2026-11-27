/**
 * A condition in the minimizer plugin's `extractComments`. A function's arguments
 * are each minimizer's own, so these minifiers hand it what `MinimizeExtractCommentsCondition` names.
 */
export type PluginExtractCommentsCondition = boolean | string | RegExp | ((...args: never[]) => boolean);
/**
 * The minimizer plugin's `extractComments`, as far as these minifiers read it: a
 * condition, or an object holding one.
 */
export type PluginExtractComments = PluginExtractCommentsCondition | {
    condition?: PluginExtractCommentsCondition;
};
export type MinimizeExtractComments = import("../../declarations/WebpackOptions").OptimizationMinimizeExtractComments;
export type MinimizeExtractCommentsCondition = import("../../declarations/WebpackOptions").OptimizationMinimizeExtractCommentsCondition;
export type CommentsOption = boolean | string | RegExp | ((comment: string) => boolean);
export type CommentPredicate = (comment: string, line: number, column: number) => boolean;
/**
 * How one language writes a comment, and which it keeps where nothing is extracted.
 */
export type CommentSyntax = {
    /**
     * what opens a comment, e.g. `/*`
     */
    open: string;
    /**
     * what closes it
     */
    close: string;
    /**
     * what the `comments: "some"` level keeps
     */
    some: (comment: string) => boolean;
    /**
     * what is kept when `comments` is unset
     */
    unstated: (comment: string) => boolean;
};
/**
 * The `comments` predicate a print takes to extract comments, and the list
 * they are collected into, deduplicated and written with their delimiters.
 * @param {PluginExtractComments | MinimizeExtractComments | undefined} option `extractComments` as configured
 * @param {CommentsOption | undefined} comments the language's `comments` option
 * @param {CommentSyntax} syntax how the language writes and keeps comments
 * @returns {{ comments: CommentPredicate, extracted: string[] } | undefined} undefined when nothing is extracted
 */
export function extractComments(option: PluginExtractComments | MinimizeExtractComments | undefined, comments: CommentsOption | undefined, syntax: CommentSyntax): {
    comments: CommentPredicate;
    extracted: string[];
} | undefined;
/**
 * A condition in the minimizer plugin's `extractComments`. A function's arguments
 * are each minimizer's own, so these minifiers hand it what `MinimizeExtractCommentsCondition` names.
 * @typedef {boolean | string | RegExp | ((...args: never[]) => boolean)} PluginExtractCommentsCondition
 */
/**
 * The minimizer plugin's `extractComments`, as far as these minifiers read it: a
 * condition, or an object holding one.
 * @typedef {PluginExtractCommentsCondition | { condition?: PluginExtractCommentsCondition }} PluginExtractComments
 */
/** @typedef {import("../../declarations/WebpackOptions").OptimizationMinimizeExtractComments} MinimizeExtractComments */
/** @typedef {import("../../declarations/WebpackOptions").OptimizationMinimizeExtractCommentsCondition} MinimizeExtractCommentsCondition */
/** @typedef {boolean | string | RegExp | ((comment: string) => boolean)} CommentsOption */
/** @typedef {(comment: string, line: number, column: number) => boolean} CommentPredicate */
/**
 * How one language writes a comment, and which it keeps where nothing is extracted.
 * @typedef {object} CommentSyntax
 * @property {string} open what opens a comment, e.g. `/*`
 * @property {string} close what closes it
 * @property {(comment: string) => boolean} some what the `comments: "some"` level keeps
 * @property {(comment: string) => boolean} unstated what is kept when `comments` is unset
 */
/**
 * A `comments` value as the predicate over a comment's text it stands for.
 * @param {CommentsOption} comments as configured
 * @param {(comment: string) => boolean} some what `"some"` keeps
 * @returns {(comment: string) => boolean} whether a comment is kept
 */
export function keepCondition(comments: CommentsOption, some: (comment: string) => boolean): (comment: string) => boolean;
