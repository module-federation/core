declare namespace _exports {
    export { SyntaxParser, SyntaxPrinter, HtmlParts, HtmlVisitorMap, HtmlNodeRef, HtmlPath, HtmlProcessOptions, HtmlPrintOptions };
}
declare namespace _exports {
    export const parser: SyntaxParser;
    export const printer: SyntaxPrinter;
    export { HtmlSourceProcessor as SourceProcessor };
}
export = _exports;
type SyntaxParser = typeof import("./syntax-parser");
type SyntaxPrinter = typeof import("./syntax-printer");
type HtmlParts = import("./syntax-parser").HtmlParts;
type HtmlVisitorMap<S = unknown> = import("./syntax-parser").HtmlVisitorMap<S>;
type HtmlNodeRef = import("./syntax-parser").HtmlNodeRef;
type HtmlPath = import("./syntax-parser").HtmlPath;
type HtmlProcessOptions = import("./syntax-printer").HtmlProcessOptions;
type HtmlPrintOptions = import("./syntax-printer").HtmlPrintOptions;
/**
 * The generic visitor coordinator (`util/SourceProcessor`) bound to the HTML
 * `grammar`. Usage:
 *
 * ```
 * new HtmlSourceProcessor().use({ [NodeType.Element]: (path) => {}, [NodeType.Comment]: { enter, exit } }).process(source, { skip });
 * ```
 * @experimental exposed as `webpack.html.syntax.SourceProcessor`; unstable API
 * @template [TState=unknown] what `process` hands every visitor as `path.state`
 * @extends {SourceProcessor<HtmlPath, HtmlNodeRef, HtmlProcessOptions, HtmlPrintOptions, HtmlParts, TState, HtmlVisitorMap<TState>>}
 */
declare class HtmlSourceProcessor<TState = unknown> extends SourceProcessor<{
    state: unknown;
    readonly node: import("./syntax-parser").HtmlNodeRef;
    readonly parent: import("./syntax-parser").HtmlNodeRef | null;
    readonly index: number;
    skipChildren(): void;
    stop(): void;
    within(type: number): boolean;
    type(n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
    range(n?: import("./syntax-parser").HtmlNodeRef | undefined): [number, number];
    start(n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
    end(n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
    loc(n?: import("./syntax-parser").HtmlNodeRef | undefined): [number, number, number, number];
    source(n?: (import("./syntax-parser").HtmlNodeRef | number) | undefined, end?: number | undefined): string;
    name(n?: import("./syntax-parser").HtmlNodeRef | undefined): string;
    fieldCount(field: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
    field(i: number, field: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): import("./syntax-parser").HtmlNodeRef;
    fieldNamed(field: number, name: string, n?: import("./syntax-parser").HtmlNodeRef | undefined): import("./syntax-parser").HtmlNodeRef;
    flag(flag: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): boolean;
    rangeOf(part: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): [number, number] | null;
    startOf(part: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
    endOf(part: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
    textOf(part: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): string | null;
    value(n?: import("./syntax-parser").HtmlNodeRef | undefined): string;
    childCount(n?: import("./syntax-parser").HtmlNodeRef | undefined): number;
    child(i: number, n?: import("./syntax-parser").HtmlNodeRef | undefined): import("./syntax-parser").HtmlNodeRef;
    children(n?: import("./syntax-parser").HtmlNodeRef | undefined): import("./syntax-parser").HtmlNodeRef[];
}, number, import("./syntax-printer").HtmlProcessOptions, import("./syntax-printer").HtmlPrintOptions, import("./syntax-parser").HtmlParts, TState, HtmlVisitorMap<TState>> {
    constructor();
}
import SourceProcessor = require("../util/SourceProcessor");
