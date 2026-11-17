/**
 * Magic comment options by name; each value is whatever the user's comment evaluates to.
 */
export type MagicCommentOptions = Record<string, EXPECTED_ANY>;
export const CompilerHintNotationRegExp: Readonly<{
    Pure: RegExp;
    NoSideEffects: RegExp;
}>;
/**
 * @returns {import("vm").Context} magic comment context
 */
export function createMagicCommentContext(): import("vm").Context;
/**
 * Comments fully inside `range`, via binary search over source-ordered `comments`.
 * @template {object} TComment
 * @param {(TComment & { range: [number, number] })[]} comments source-ordered comments
 * @param {[number, number]} range range
 * @returns {TComment[]} comments in the range
 */
export function getCommentsInRange<TComment extends unknown>(comments: (TComment & {
    range: [number, number];
})[], range: [number, number]): TComment[];
/**
 * Merge webpack magic-comment options from comments inside `range`.
 * @template {object} TComment
 * @param {(TComment & { range: [number, number], value: string })[]} comments source-ordered comments
 * @param {[number, number]} range range
 * @param {import("vm").Context} context context from `createMagicCommentContext`
 * @returns {{ options: MagicCommentOptions | null, errors: (Error & { comment: TComment })[] | null }} result
 */
export function parseCommentOptionsInRange<TComment extends unknown>(comments: (TComment & {
    range: [number, number];
    value: string;
})[], range: [number, number], context: import("vm").Context): {
    options: MagicCommentOptions | null;
    errors: (Error & {
        comment: TComment;
    })[] | null;
};
/**
 * Parse one magic comment's text into its options object.
 * @param {string} value comment text (should already match `webpackCommentRegExp`)
 * @param {import("vm").Context} context context from `createMagicCommentContext`
 * @returns {MagicCommentOptions} parsed options
 */
export function parseMagicComment(value: string, context: import("vm").Context): MagicCommentOptions;
export const webpackCommentRegExp: RegExp;
