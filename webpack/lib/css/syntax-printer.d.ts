/**
 * Renders source this stylesheet embeds — a `data:` URL's payload today.
 * Returning it unchanged, or anything but text, declines it, and the URL is
 * emitted as written.
 */
export type EmbeddedSourceRenderer = (source: string, info: {
    type: string;
    hostType: string;
}) => string | undefined;
/**
 * One embedded source recorded for a caller that can only answer
 * asynchronously, and the text to print once it has.
 */
export type DeferredEmbeddedSource = import("../util/dataURL").DeferredEmbeddedSource;
export type Node = import("./syntax-parser").Node;
export type ComponentValue = import("./syntax-parser").ComponentValue;
export type Rule = import("./syntax-parser").Rule;
export type BlockSpans = import("./syntax-parser").BlockSpans;
export type PrintContext = import("./syntax-parser").PrintContext;
export type PrefixScope = import("./syntax-parser").PrefixScope;
export type RuleEntry = import("./syntax-parser").RuleEntry;
export type CssPath = import("./syntax-parser").CssPath;
/**
 * One selector of a rule's prelude: the tokens it spans, and the sole prefixable
 * pseudo in it — `-1` where it has none, `-2` where it has more than one, which
 * leaves the whole rule alone.
 */
export type PrefixableSelector = {
    /**
     * its first prelude token
     */
    start: number;
    /**
     * one past its last
     */
    end: number;
    /**
     * the prefixable pseudo's token, or -1 / -2
     */
    at: number;
};
/**
 * The default CSS node printer — passed to the `SourceProcessor` and fired once a
 * node's visitors and children are done (a developer could supply their own).
 * It takes the same `path` a visitor gets plus the print context as its `writer`,
 * and knows nothing of the walk: it switches on `path.type()`, reads the node's
 * name / children through `path`, pulls its children's already-printed text from
 * `writer.get`, composes this node's text (with the CSS-local `_join` / `_SEP` /
 * spacing) and **returns** it. Structure keeps it safe: a declaration's
 * `name:value` drops the space around `:` a flat token stream could not, and
 * custom-property (`--*`) values stay verbatim. When minifying it also applies the
 * safe value transforms (number normalization, hex / rgb() color minification,
 * `cubic-bezier()` / `steps()` easing keywords, string / attribute-selector /
 * `url()` quote normalization, identifier escape shortening, `{1,4}` box and
 * `flex` shorthand collapsing), drops the
 * whitespace a query condition does not need, and drops rules whose block ends
 * up empty — each value-identical, so meaning never changes.
 * @experimental exposed as `webpack.css.syntax.printer`; unstable API
 * @param {CssPath} path the accessor positioned on the finished node
 * @param {PrintContext} writer the print context (children's printed text)
 * @returns {string} the node's serialized text
 */
export function printer(path: CssPath, writer: PrintContext): string;
