declare namespace _exports {
    export { SyntaxParser, SyntaxPrinter, CssParts, CssVisitorMap, Node, CssProcessOptions, CssPrintOptions, CssPath };
}
declare namespace _exports {
    export const parser: SyntaxParser;
    export const printer: SyntaxPrinter;
    export { CssSourceProcessor as SourceProcessor };
}
export = _exports;
type SyntaxParser = typeof import("./syntax-parser");
type SyntaxPrinter = typeof import("./syntax-printer");
type CssParts = import("./syntax-parser").CssParts;
type CssVisitorMap<S = unknown> = import("./syntax-parser").CssVisitorMap<S>;
type Node = import("./syntax-parser").Node;
type CssProcessOptions = import("./syntax-parser").CssProcessOptions;
type CssPrintOptions = import("./syntax-parser").CssPrintOptions;
type CssPath = import("./syntax-parser").CssPath;
/**
 * The generic visitor coordinator (`util/SourceProcessor`) bound to the CSS
 * `grammar`. All configuration is per `process` call. `process(src, { minimize:
 * true })` returns `{ code, map }` — the safely-minified serialization (built by
 * the same walk that fires visitors) and its source map; without `minimize` it
 * just walks and returns `undefined`. Usage:
 *
 * ```
 * new CssSourceProcessor().use({ [NodeType.AtRule]: (path) => {} }).process(source, { skip });
 * ```
 * @experimental exposed as `webpack.css.syntax.SourceProcessor`; unstable API
 * @template [TState=unknown] what `process` hands every visitor as `path.state`
 * @extends {SourceProcessor<CssPath, Node, CssProcessOptions, CssPrintOptions, CssParts, TState, CssVisitorMap<TState>>}
 */
declare class CssSourceProcessor<TState = unknown> extends SourceProcessor<{
    state: unknown;
    readonly node: import("./syntax-parser").Node;
    readonly parent: import("./syntax-parser").Node | null;
    readonly index: number;
    skipChildren(): void;
    stop(): void;
    within(type: number): boolean;
    type(n?: import("./syntax-parser").Node | undefined): number;
    range(n?: import("./syntax-parser").Node | undefined): [number, number];
    start(n?: import("./syntax-parser").Node | undefined): number;
    end(n?: import("./syntax-parser").Node | undefined): number;
    loc(n?: import("./syntax-parser").Node | undefined): [number, number, number, number];
    source(n?: (import("./syntax-parser").Node | number) | undefined, end?: number | undefined): string;
    value(n?: import("./syntax-parser").Node | undefined): string | number;
    name(n?: import("./syntax-parser").Node | undefined): string;
    childCount(n?: import("./syntax-parser").Node | undefined): number;
    child(i: number, n?: import("./syntax-parser").Node | undefined): ComponentValue;
    children(n?: import("./syntax-parser").Node | undefined): ComponentValue[];
    fieldCount(field: number, n?: import("./syntax-parser").Node | undefined): number;
    field(i: number, field: number, n?: import("./syntax-parser").Node | undefined): import("./syntax-parser").Node;
    fieldNamed(field: number, name: string, n?: import("./syntax-parser").Node | undefined): import("./syntax-parser").Node;
    flag(flag: number, n?: import("./syntax-parser").Node | undefined): boolean;
    rangeOf(part: number, n?: import("./syntax-parser").Node | undefined): [number, number] | null;
    startOf(part: number, n?: import("./syntax-parser").Node | undefined): number;
    endOf(part: number, n?: import("./syntax-parser").Node | undefined): number;
    textOf(_part: number, _n?: import("./syntax-parser").Node | undefined): null;
}, import("./syntax-parser").Node, import("./syntax-parser").CssProcessOptions, import("./syntax-parser").CssPrintOptions, import("./syntax-parser").CssParts, TState, CssVisitorMap<TState>> {
    constructor();
}
import SourceProcessor = require("../util/SourceProcessor");
