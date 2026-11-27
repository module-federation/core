export = SourceProcessor;
/**
 * Visitor coordinator: owns the visitor registry and drives a language
 * `grammar` over the source. Language-agnostic — each syntax (CSS, HTML, …)
 * binds its own grammar, node-type enum and (optionally) node printer.
 * Usage:
 *
 * ```
 * processor.use({ [NodeType.X]: (path) => {}, [NodeType.Y]: { enter, exit } });
 * processor.process(source);
 * ```
 * @template {NodePath<TNode>} TPath
 * @template TNode
 * @template [TProcessOptions=object]
 * @template [TPrintOptions=object]
 * @template {NodeParts} [TParts=AnyParts] the language's parts, which type each visitor's path by node type
 * @template [TState=unknown] what `process` hands every visitor as `path.state`
 * @template [TVisitors=VisitorMap<TPath>] the language's visitor map, each path typed by its key and with `TState`
 */
declare class SourceProcessor<TPath extends NodePath<TNode>, TNode, TProcessOptions = any, TPrintOptions = any, TParts extends NodeParts = AnyParts, TState = unknown, TVisitors = VisitorMap<TPath>> {
    /**
     * @param {Grammar<TPath, TNode, TProcessOptions, TPrintOptions>} grammar the grammar to drive over the source
     * @param {NodePrinter<TPath, TNode, TPrintOptions>=} printer the node printer, fired per node once its visitors and children are done; the same `path` a visitor gets plus the print context as its writer. Required to print (e.g. `mode`); a future API can let a developer supply their own
     * @param {(() => NodePrinter<TPath, TNode, TPrintOptions>)=} loadPrinter asked for the printer the first time something prints, for a language that keeps its printer in a module of its own — so a walk that never prints never loads it
     * @param {TPath=} path the path the grammar hands its visitors, whose `state` a run sets
     */
    constructor(grammar: Grammar<TPath, TNode, TProcessOptions, TPrintOptions>, printer?: NodePrinter<TPath, TNode, TPrintOptions> | undefined, loadPrinter?: (() => NodePrinter<TPath, TNode, TPrintOptions>) | undefined, path?: TPath | undefined);
    /** @type {Grammar<TPath, TNode, TProcessOptions, TPrintOptions>} */
    _grammar: Grammar<TPath, TNode, TProcessOptions, TPrintOptions>;
    /** @type {CompiledVisitorMap<TPath>} */
    _visitors: CompiledVisitorMap<TPath>;
    /** @type {NodePrinter<TPath, TNode, TPrintOptions> | undefined} */
    _printer: NodePrinter<TPath, TNode, TPrintOptions> | undefined;
    /** @type {(() => NodePrinter<TPath, TNode, TPrintOptions>) | undefined} */
    _loadPrinter: (() => NodePrinter<TPath, TNode, TPrintOptions>) | undefined;
    /** @type {TPath | undefined} */
    _path: TPath | undefined;
    /** @type {((ctx: PrintContext<TPath, TNode, TPrintOptions>, build: () => { code: string, map: SourceMap | undefined }) => void) | null} */
    _deferred: ((ctx: PrintContext<TPath, TNode, TPrintOptions>, build: () => {
        code: string;
        map: SourceMap | undefined;
    }) => void) | null;
    /**
     * Register one bucket for several node types, as a map naming each would;
     * its path takes only the parts those types have.
     * @template {number} T
     * @overload
     * @param {T[]} types the node types the bucket visits
     * @param {VisitorBucket<TypedNodePath<TPath, TNode, TParts, T, TState>>} bucket the visitor
     * @returns {SourceProcessor<TPath, TNode, TProcessOptions, TPrintOptions, TParts, TState, TVisitors>} `this`, for chaining
     */
    use<T extends number>(types: T[], bucket: VisitorBucket<TypedNodePath<TPath, TNode, TParts, T, TState>>): SourceProcessor<TPath, TNode, TProcessOptions, TPrintOptions, TParts, TState, TVisitors>;
    /**
     * Register a visitor map; calls accumulate per node type, and each
     * visitor's path takes only its type's parts.
     * A bucket is a function (= `{ enter }`) or `{ enter?, exit? }`.
     * @overload
     * @param {TVisitors} map visitor map keyed by node type
     * @returns {SourceProcessor<TPath, TNode, TProcessOptions, TPrintOptions, TParts, TState, TVisitors>} `this`, for chaining
     */
    use(map: TVisitors): SourceProcessor<TPath, TNode, TProcessOptions, TPrintOptions, TParts, TState, TVisitors>;
    /**
     * Register a visitor map built at runtime, keyed by any node type.
     * @overload
     * @param {VisitorMap<TPath>} map visitor map keyed by node type
     * @returns {SourceProcessor<TPath, TNode, TProcessOptions, TPrintOptions, TParts, TState, TVisitors>} `this`, for chaining
     */
    use(map: VisitorMap<TPath>): SourceProcessor<TPath, TNode, TProcessOptions, TPrintOptions, TParts, TState, TVisitors>;
    /**
     * @param {number} type node type
     * @param {VisitorBucket<TPath>} visitor its visitor
     */
    _add(type: number, visitor: VisitorBucket<TPath>): void;
    /**
     * Run the grammar with the path's `state` set to the run's, put back after so
     * a run nested in a visitor leaves its caller's.
     * @param {string} input the source
     * @param {PrintContext<TPath, TNode, TPrintOptions> | undefined} ctx the print context, when printing
     * @param {TProcessOptions} opts process options
     */
    _run(input: string, ctx: PrintContext<TPath, TNode, TPrintOptions> | undefined, opts: TProcessOptions): void;
    /**
     * Parse `input` once and fire the visitors in source order. Asking for output
     * — `mode`, the one thing that names it — makes the same walk print, given a
     * printer supplied at construction: a
     * {@link PrintContext} is created, each node's printer fires into it as the node
     * finishes, and the result is returned as `{ code, map }`: the serialized output
     * and, for a caller that named its input with `source` / `content`, the
     * input->output source map — `map` is `undefined` without one. Asking for
     * none of it only walks and returns `undefined`. A single parse — printing
     * never re-parses; all configuration is per-call.
     * @overload
     * @param {string} input the source
     * @param {TProcessOptions & RunState<TState> & { mode: PrintOptions["mode"] } & { source: string, content?: string }} options process options, naming the input so a map is built
     * @returns {{ code: string, map: SourceMap }} the output and its map
     */
    process(input: string, options: TProcessOptions & RunState<TState> & {
        mode: PrintOptions["mode"];
    } & {
        source: string;
        content?: string;
    }): {
        code: string;
        map: SourceMap;
    };
    /**
     * @overload
     * @param {string} input the source
     * @param {TProcessOptions & RunState<TState> & { mode: PrintOptions["mode"] }} options process options, asking for output but no map
     * @returns {{ code: string, map: undefined }} the output alone
     */
    process(input: string, options: TProcessOptions & RunState<TState> & {
        mode: PrintOptions["mode"];
    }): {
        code: string;
        map: undefined;
    };
    /**
     * @overload
     * @param {string} input the source
     * @param {(TProcessOptions & RunState<TState>)=} options process options, asking for no output
     * @returns {undefined} nothing — the walk alone
     */
    process(input: string, options?: (TProcessOptions & RunState<TState>) | undefined): undefined;
    /**
     * {@link process}, for a caller whose renderer answers asynchronously. Code
     * generation is synchronous — a printer returns its node's text, it cannot
     * await one — so the walk leaves a marker where each answer goes, they are
     * asked for together, and {@link PrintContext.substitute} stands each in its
     * place before the output and its map are built. One parse either way, and
     * the async boundary stays at the top rather than on every node.
     *
     * This is the shape `process` itself takes once it is async: how the answers
     * are waited for is this method's business, so nothing above it changes.
     * @param {string} input the source
     * @param {Omit<TProcessOptions, "renderEmbeddedSource"> & RunState<TState> & { mode: PrintOptions["mode"] } & { source?: string, content?: string, renderEmbeddedSource?: (source: string, hole: DeferredEmbeddedSource) => Promise<string | undefined> | string | undefined }} options process options; a print, so `mode` names which one, and naming the input builds a map. `renderEmbeddedSource` is the grammar's own option with a wider answer — it may answer asynchronously, and is handed each {@link DeferredWrite} whole. Absent, this is `process` with a promise around it
     * @returns {Promise<{ code: string, map: SourceMap | undefined }>} the output and its map
     */
    processAsync(input: string, options: Omit<TProcessOptions, "renderEmbeddedSource"> & RunState<TState> & {
        mode: PrintOptions["mode"];
    } & {
        source?: string;
        content?: string;
        renderEmbeddedSource?: (source: string, hole: DeferredEmbeddedSource) => Promise<string | undefined> | string | undefined;
    }): Promise<{
        code: string;
        map: SourceMap | undefined;
    }>;
    /**
     * Print `input` holding the deferred writes open: `finish` puts the answers
     * in their place and only then builds the output and its map, so neither has
     * to be corrected for what an answer changed in length. The one mechanism
     * {@link processAsync} is built on, and private for that reason: a caller
     * asks for an asynchronous print, not for the way one is arranged.
     * @param {string} input the source
     * @param {TProcessOptions & RunState<TState> & { mode: PrintOptions["mode"] } & { source?: string, content?: string }} options process options; a print, so `mode` names which one, and naming the input builds a map
     * @returns {{ finish: (resolve: (id: number) => string | undefined) => { code: string, map: SourceMap | undefined } }} the deferred print
     */
    _processDeferred(input: string, options: TProcessOptions & RunState<TState> & {
        mode: PrintOptions["mode"];
    } & {
        source?: string;
        content?: string;
    }): {
        finish: (resolve: (id: number) => string | undefined) => {
            code: string;
            map: SourceMap | undefined;
        };
    };
}
declare namespace SourceProcessor {
    export { PrintContext, declineDeferredWrites, deferredWrite, VisitorFn, NodePath, NodePathReads, NodePathFields, TypedNode, PartOf, NodeParts, TypedNodePath, AnyParts, RunState, VisitorBucket, VisitorMap, CompiledVisitorBucket, CompiledVisitorMap, PrintOptions, DeferredWrite, SourceMap, SourceMapOptions, NodePrinter, Grammar };
}
/**
 * A language node printer, fired for one node once all its visitors have run and
 * its children are printed. It takes the same `path` a visitor gets plus the
 * print context as its `writer`; it switches on `path.type()` and **returns** the
 * node's serialized text, reading its children's text from `writer.get` — knowing
 * nothing of the walk. Returning (rather than writing to a buffer) is what lets a
 * parent compose / transform its text from its finished children.
 * @template TPath
 * @template TNode
 * @template [TPrintOptions=object]
 * @typedef {(path: TPath, writer: PrintContext<TPath, TNode, TPrintOptions>) => string} NodePrinter
 */
/**
 * A language grammar: parse `input` once and fire the compiled visitors in
 * source order. When `writer` is given it is also printing — after each node's
 * visitors have run and its children are printed, the grammar fires the node
 * printer into `writer`; a single parse with no re-tokenizing.
 * @template TPath
 * @template TNode
 * @template TProcessOptions
 * @template [TPrintOptions=object]
 * @typedef {(input: string, visitors: CompiledVisitorMap<TPath>, writer: PrintContext<TPath, TNode, TPrintOptions> | undefined, options: TProcessOptions) => void} Grammar
 */
/**
 * The per-node output store handed to a language node printer as its `writer`. It
 * carries the print `options` (today just `mode`) and one map: a finished node ->
 * its printed text. A printer *returns* its text (`printNode` stores it) and reads
 * a child's with `get`, so a parent composes its own text from its children's —
 * the map is what makes that composition (and the CSS value transforms built on
 * it) possible. `take` flushes a finished top-level node into the output and drops
 * the map, so a streaming grammar never holds more than one top-level subtree.
 * @template TPath
 * @template TNode
 * @template [TPrintOptions=object]
 */
declare class PrintContext<TPath, TNode, TPrintOptions = any> {
    /**
     * @param {PrintOptions & TPrintOptions} options the print options
     * @param {NodePrinter<TPath, TNode, TPrintOptions>} printer the node printer
     */
    constructor(options: PrintOptions & TPrintOptions, printer: NodePrinter<TPath, TNode, TPrintOptions>);
    /** @type {PrintOptions & TPrintOptions} */
    options: PrintOptions & TPrintOptions;
    /** @type {NodePrinter<TPath, TNode, TPrintOptions>} */
    _printer: NodePrinter<TPath, TNode, TPrintOptions>;
    /** @type {(string | null)[]} each finished node's printed text */
    _storeText: (string | null)[];
    /** @type {Int32Array} the epoch each slot was written in */
    _storeGen: Int32Array;
    /** @type {((node: TNode) => string) | undefined} reads a `null` slot's text */
    _sourceText: ((node: TNode) => string) | undefined;
    /** @type {number} current epoch; a slot from an older one reads as absent */
    _gen: number;
    /** @type {number} lowest slot written since the epoch last moved */
    _storeLow: number;
    /** @type {number} highest slot written since the epoch last moved */
    _storeHigh: number;
    /** @type {string[]} pieces already cut off, in output order */
    _chunks: string[];
    /** @type {Map<number, { readonly text: string }> | null} pieces whose text is read only once the output is */
    _deferred: Map<number, {
        readonly text: string;
    }> | null;
    /** @type {string} output after the last cut piece */
    _tail: string;
    /** @type {number} characters in `_tail`, so its length is not read off a rope */
    _tailLength: number;
    /** @type {number} scratch for the flattening read in {@link _cutTail} */
    _flattened: number;
    /** @type {boolean} whether {@link sourceMap} can still be asked for one */
    mapWanted: boolean;
    /** @type {number[]} `chunkIndex, offsetInChunk, srcLine, srcCol` per mapping, output-ordered; a `srcLine` of -1 is one {@link retract} took back with its piece */
    _mappings: number[];
    /** @type {number[] | null} by retractable piece index, the index in `_mappings` of the mapping anchored to it, so taking the piece back takes its mapping too */
    _retractableMappings: number[] | null;
    /** @type {[number, string][]} source-anchored literals to keep (comments), source-ordered */
    _inserts: [number, string][];
    /** @type {number} next `_inserts` entry not yet flushed */
    _insertIdx: number;
    /** @type {string[]} openers not yet emitted, outermost first */
    _pending: string[];
    /** @type {[number | undefined, number | undefined, number | undefined] | null} anchor for the first pending opener */
    _pendingAnchor: [number | undefined, number | undefined, number | undefined] | null;
    /**
     * Hold `text` back as the opener of a node being printed in pieces. Nothing
     * reaches the output until {@link flushPending}, so {@link dropPending} can
     * still take it back if the node turns out to be empty.
     * @param {string} text the node's opener
     * @returns {number} the opener's depth, for {@link isPending}
     */
    pushPending(text: string): number;
    /**
     * Rewrite a held-back opener — an opener whose text depends on what turns out
     * to follow it can only be settled once something does.
     * @param {number} depth the opener's depth, from {@link pushPending}
     * @param {string} text its opener
     */
    setPending(depth: number, text: string): void;
    /**
     * Emit every held-back opener, outermost first — something inside the
     * innermost one has content, so all of them do.
     * @returns {void}
     */
    flushPending(): void;
    /**
     * Anchor the outermost held-back opener, applied when it is flushed. Openers
     * are flushed together, so only the outermost carries one.
     * @param {number=} srcOffset the node's source offset (kept-comment flush boundary)
     * @param {number=} srcLine 0-based source line of the node's start
     * @param {number=} srcCol 0-based source column of the node's start
     */
    anchorPending(srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined): void;
    /**
     * @param {number} depth an opener's depth, from {@link pushPending}
     * @returns {boolean} whether it is still held back (nothing inside it printed)
     */
    isPending(depth: number): boolean;
    /**
     * Drop the innermost held-back opener — its node printed to nothing.
     * @returns {void}
     */
    dropPending(): void;
    /**
     * Close off what has been emitted so far and return the index the next piece
     * will take. Cutting is the point: a caller bounding a later edit by this
     * (see {@link dropTrailing}) must not be able to reach output from before it,
     * which a mark taken while the tail was still open would sit in the middle of.
     * @returns {number} the index the next emitted piece will get
     */
    markCut(): number;
    /**
     * Append a piece of a node that is being printed in pieces. Nothing takes it
     * back, so it only extends the output.
     * @param {string} text output text
     */
    emitStreamed(text: string): void;
    /**
     * Widen both columns to hold `need` handles, keeping what they already hold.
     * @param {number} need required capacity
     */
    _growStore(need: number): void;
    /**
     * Forget every node's printed text. A node printed in pieces does this once
     * each child is emitted, so the store never holds more than one of them —
     * which is also what keeps a recycled node id from reading as an earlier
     * node's text.
     */
    dropStore(): void;
    /**
     * Move the epoch on and release the text every slot written under the old one
     * holds. Only the range actually written is walked, so the drop stays O(1)
     * per node.
     * @returns {void}
     */
    _moveEpoch(): void;
    /**
     * Drop trailing `charCode`s from the end of the output at or after `from` —
     * the separator the piece before a terminator no longer needs. Walks back over
     * pieces emptied by {@link retract}, so it sees what the output reads as.
     * @param {number} from earliest piece index this may touch
     * @param {number} charCode the character to drop
     */
    dropTrailing(from: number, charCode: number): void;
    /**
     * Stand `text` in place of the output's end, where that is `printed` followed
     * only by `closer`s — what the printer wrote after a value the input ran out in.
     * @param {string} printed the text the output must end with, before the closers
     * @param {string} text what to write in place of it and them
     * @param {number} closer the character that may follow `printed`
     * @returns {boolean} true when the output ended that way and was rewritten
     */
    replaceEnd(printed: string, text: string, closer: number): boolean;
    /**
     * Run the node printer for `node` and store what it returns (the grammar calls
     * this once the node's visitors and children are done). `path` is on `node`.
     * @param {TNode} node the finished node
     * @param {TPath} path the language accessor, positioned on `node`
     */
    printNode(node: TNode, path: TPath): void;
    /**
     * Store `text` as what `node` printed, where the grammar already knows what
     * the node printer would return and so does not call it.
     * @param {TNode} node the finished node
     * @param {string} text its printed text
     */
    printedAs(node: TNode, text: string): void;
    /**
     * Store that `node` printed as its source, which `sourceText` reads only once
     * something asks for its text.
     * @param {TNode} node the finished node
     * @param {(node: TNode) => string} sourceText reads a node's source
     */
    printedSource(node: TNode, sourceText: (node: TNode) => string): void;
    /**
     * Print one node and hand its text straight back — for a node inside one being
     * printed in pieces, whose text is emitted as it is printed, so the store
     * would only ever be written and read once.
     * @param {TPath} path path positioned on the node
     * @returns {string} its printed text
     */
    printPiece(path: TPath): string;
    /**
     * @param {TNode} node a child node whose printer already ran
     * @returns {string} its printed text
     */
    get(node: TNode): string;
    /**
     * Append `text` to the output. Where in the output that lands is worked out
     * only if a source map is asked for (see {@link sourceMap}), so printing
     * without one never walks the text looking for newlines.
     * @param {string} text output text
     */
    _emit(text: string): void;
    /**
     * Move the accumulated tail into the finished pieces, flattened.
     */
    _cutTail(): void;
    /**
     * Append `text` as a piece of its own, so {@link retract} can still take it
     * back once a later sibling turns out to override it. Cuts the accumulating
     * tail off in front of it, so it is for the text that may actually be taken
     * back and not for output at large.
     * @param {string} text output text
     * @returns {number} the piece's index, for {@link retract}
     */
    emitRetractable(text: string): number;
    /**
     * Take back an already-emitted piece — the printer has since found that a
     * later one overrides it. Pieces after it keep their place. A piece emitted by
     * {@link takeRetractable} takes the mapping anchored to it back as well; any
     * other anchor into the piece would be left pointing at what follows it, so
     * this must not be used on one (see {@link take}).
     * @param {number} index the piece's index, from {@link emitRetractable}
     */
    retract(index: number): void;
    /**
     * Whether the output after a piece holds a character outside ASCII, the
     * comments still waiting to be placed included.
     * @param {number} index the piece's index, from {@link emitRetractable}
     * @returns {boolean} true when it does
     */
    writesNonAscii(index: number): boolean;
    /**
     * Fold `text` into an already-emitted piece, in front of the character it ends
     * with — a later sibling whose body belongs inside that piece, as a repeated
     * named `@layer` block's does. Mappings are piece-relative and this only grows
     * the piece past everything already anchored in it, so they keep their
     * positions; the folded text carries none of its own.
     * @param {number} index the piece's index, from {@link emitRetractable}
     * @param {string} text what to fold in, its own closer included
     */
    foldIntoRetractable(index: number, text: string): void;
    /**
     * Write an already-emitted piece again, shorter — a rule inside it a later
     * copy makes dead. Mappings anchored in the piece keep the offsets they were
     * given, so one inside what was cut names what now follows it.
     * @param {number} index the piece's index, from {@link emitRetractable}
     * @param {string} text what the piece says now
     */
    rewriteRetractable(index: number, text: string): void;
    /**
     * {@link rewriteRetractable} with text that is asked for only once the output
     * is read: a piece rewritten many times over is then built once, not each time.
     * @param {number} index the piece's index, from {@link emitRetractable}
     * @param {{ readonly text: string }} source what holds the piece's text
     */
    deferRetractable(index: number, source: {
        readonly text: string;
    }): void;
    /**
     * Write every deferred piece's text in, before anything reads the pieces.
     */
    _settleDeferred(): void;
    /**
     * {@link take} for a top-level node a later sibling may still make dead — the
     * unprefixed twin of a vendor-prefixed rule, which can stand anywhere after
     * it. The node is emitted as a piece of its own, with its mapping recorded
     * against that piece, so {@link retract} takes both back.
     * @param {TNode} node the top-level node
     * @param {number=} srcOffset the node's source offset (kept-comment flush boundary)
     * @param {number=} srcLine 0-based source line of the node's start
     * @param {number=} srcCol 0-based source column of the node's start
     * @param {string=} text what to emit instead of the node's own printed text
     * @returns {number} the piece's index, for {@link retract}
     */
    takeRetractable(node: TNode, srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined, text?: string | undefined): number;
    /**
     * Emit one finished top-level node: first any kept comments that precede it,
     * then a source mapping anchoring its output start to `[srcLine, srcCol]`, then
     * its text — and drop the per-node store so the next top-level node starts
     * clean. `srcOffset` / `srcLine` / `srcCol` are the node's source position; a
     * grammar that doesn't map positions (e.g. HTML) omits them (no comments, no
     * mapping — the map ends up empty).
     * @param {TNode | undefined} node the top-level node, or undefined where `text` is given and no node is the whole of it
     * @param {number=} srcOffset the node's source offset (kept-comment flush boundary)
     * @param {number=} srcLine 0-based source line of the node's start
     * @param {number=} srcCol 0-based source column of the node's start
     * @param {string=} text what to emit instead of the node's own printed text,
     * for a printer that folded a later node into this one
     */
    take(node: TNode | undefined, srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined, text?: string | undefined): void;
    /**
     * Tie whatever is emitted next to a source position: flush the kept comments
     * that precede it, then record the mapping. Split out of {@link take} for a
     * node printed in pieces, whose first piece is emitted well after the printer
     * for it began.
     * @param {number=} srcOffset the node's source offset (kept-comment flush boundary)
     * @param {number=} srcLine 0-based source line of the node's start
     * @param {number=} srcCol 0-based source column of the node's start
     */
    anchor(srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined): void;
    /**
     * Whether a kept literal is queued to land before `pos`. A printer folding two
     * top-level nodes together asks first: the literal belongs between them, so
     * the fold would move it past what it was written above.
     * @param {number} pos source offset
     * @returns {boolean} true if a kept literal lands before `pos`
     */
    hasInsertBefore(pos: number): boolean;
    /**
     * Emit the kept literals landing before `pos`. A printer holding a node back
     * calls this at hold time, so what was written above it is still emitted
     * above it — and {@link hasInsertBefore} then answers about the gap to the
     * next node rather than the whole span since the last node taken.
     * @param {number} pos source offset to flush up to
     * @returns {void}
     */
    flushInsertsBefore(pos: number): void;
    /**
     * Queue a literal to carry through to the output at source offset `pos` — a
     * comment the printer chose to keep (e.g. a `/*!` license banner). Calls
     * arrive in source order; each lands just before the first top-level node
     * starting after `pos` (or at the end, via {@link result}).
     * @param {number} pos source offset the literal sits before
     * @param {string} text the literal text
     */
    insert(pos: number, text: string): void;
    /**
     * Take the queued inserts sitting in `[start, end)` — a printer that writes
     * that source range out itself places them, so the writer must not flush
     * them ahead of the next top-level node as well.
     * @param {number} start first source offset of the range
     * @param {number} end offset past its last
     * @returns {string} their text, in source order
     */
    takeInserts(start: number, end: number): string;
    /**
     * Emit every queued insert positioned before source offset `pos` (all of them
     * for `Infinity`), in source order, so kept comments keep their place relative
     * to the rules.
     * @param {number} pos source offset to flush up to
     */
    _flushBefore(pos: number): void;
    /**
     * @param {SourceMapOptions} options the input's name / content
     * @param {string=} code the output {@link result} built, walked for its line breaks
     * @returns {SourceMap} the input->output source map
     */
    sourceMap(options: SourceMapOptions, code?: string | undefined): SourceMap;
    /**
     * Stand the text `resolve` gives back in place of every deferred write left
     * in the output, and move the mappings that follow one in the same piece by
     * what its text changed in length. Runs before {@link result} and
     * {@link sourceMap}, so both read the substituted output rather than
     * correcting for it.
     *
     * The marker is `NUL id NUL`. A NUL mostly cannot reach printed output on its
     * own account — both preprocessors turn one into U+FFFD — but an RCDATA
     * element and an attribute value keep the one they were written with, so a
     * pair of them is read as a write only where what stands between spells an id
     * this answers for. Anything else is the source's own text and is left alone.
     * @param {(id: number) => string | undefined} resolve the final text for a deferred write, or undefined where it answers for no such write
     * @param {string} infix what this print marked its writes with
     * @returns {void}
     */
    substitute(resolve: (id: number) => string | undefined, infix: string): void;
    /**
     * @returns {string} the printed output
     */
    /**
     * Throw away everything printed and stand `text` in its place. For the one
     * caller that can only tell its output is wrong once it has all of it.
     * @param {string} text the output to keep instead
     */
    replaceAll(text: string): void;
    result(): string;
}
import type { DeferredEmbeddedSource } from "./dataURL";
/**
 * The text this print spells with every deferred write declined: each marker
 * replaced by what would stand there had no renderer answered. What a print
 * verifying itself by re-parsing has to read, since a marker otherwise parses
 * as text where its node stood. `build` rather than `source` so a write inside
 * an attribute comes back escaped for where it sits.
 * @param {string} text the printed output, holding this print's markers
 * @param {DeferredWrite[]} writes what the print deferred, indexed by id
 * @returns {string} the text with every marker put back
 */
declare function declineDeferredWrites(text: string, writes: DeferredWrite[]): string;
/**
 * The text to print in place of a deferred write.
 * @param {number} id the write's index among this print's deferred writes
 * @returns {string} the marker to emit
 */
declare function deferredWrite(id: number): string;
/**
 * Visitor map keyed by a numeric node-type discriminator; a bucket
 * is a function (enter-only) or `{ enter?, exit? }`.
 *
 * A visitor receives a single `path` argument: the
 * language's AST accessor with the current position on it — `path.node`,
 * `path.parent` (null at a root) — plus `path.skipChildren()` (enter only)
 * to stop the walk descending, and every field-read method (which defaults
 * to the current node). The path is one reused object rebound before each callback:
 * it is only valid during the callback, and future per-node functionality
 * lands on it without changing any visitor signature.
 */
type VisitorFn<TPath> = (path: TPath) => void;
/**
 * The members every language's `path` has under the same name and meaning, so
 * a visitor written against it reads any grammar; see `docs/syntax.md`.
 */
type NodePath<TNode, TValue = unknown> = NodePathReads<TNode, TValue> & NodePathFields<TNode>;
type NodePathReads<TNode, TValue = unknown> = {
    /**
     * the current node
     */
    node: TNode;
    /**
     * the enclosing node (null at a root)
     */
    parent: TNode | null;
    /**
     * the current node's index among its siblings
     */
    index: number;
    /**
     * stop the walk descending into the current node (enter only)
     */
    skipChildren: () => void;
    /**
     * end the walk: no visitor fires after the current one returns, and a print still completes
     */
    stop: () => void;
    /**
     * the run's state, as `process` was given it
     */
    state: unknown;
    /**
     * the node's `NodeType`
     */
    type: (n?: TNode) => number;
    /**
     * start and end offsets in the input
     */
    range: (n?: TNode) => [number, number];
    /**
     * where the node starts in the input
     */
    start: (n?: TNode) => number;
    /**
     * where the node ends in the input
     */
    end: (n?: TNode) => number;
    /**
     * start line and column, end line and column (lines from 1, columns from 0)
     */
    loc: (n?: TNode) => [number, number, number, number];
    /**
     * the node's source text, or the input between two offsets
     */
    source: (n?: TNode | number, end?: number) => string;
    /**
     * the node's name as the language defines it, decoded ("" when it has none)
     */
    name: (n?: TNode) => string;
    /**
     * the node's value as the language defines it, decoded
     */
    value: (n?: TNode) => TValue;
    /**
     * number of children
     */
    childCount: (n?: TNode) => number;
    /**
     * the i-th child
     */
    child: (i: number, n?: TNode) => TNode;
    /**
     * every child as a new array
     */
    children: (n?: TNode) => TNode[];
};
/**
 * Structure read through a language's `Field`, `Flag` and `Part`. Declared as
 * methods so a language's path may accept only the parts each node type has.
 */
type NodePathFields<TNode> = {
    field(i: number, field: number, n?: TNode): TNode;
    fieldCount(field: number, n?: TNode): number;
    fieldNamed(field: number, name: string, n?: TNode): TNode;
    flag(flag: number, n?: TNode): boolean;
    rangeOf(part: number, n?: TNode): [number, number] | null;
    startOf(part: number, n?: TNode): number;
    endOf(part: number, n?: TNode): number;
    textOf(part: number, n?: TNode): string | null;
    within(type: number): boolean;
};
/**
 * A node that also says which `NodeType` it is, so reading a part that type
 * lacks fails to type-check; a plain `TNode` can be any node.
 */
type TypedNode<TNode, T> = TNode & {
    readonly __nodeType: T;
};
/**
 * What part `M` gives the node type `R` says it is; every part `D` when `R`
 * says none (a plain node reads `number` there).
 */
type PartOf<R, M extends Record<number, number>, D> = number extends (R & {
    readonly __nodeType: number;
})["__nodeType"] ? D : M[(R & {
    readonly __nodeType: number;
})["__nodeType"]];
/**
 * A language's parts, by node type: what its `Field`s and `Flag`s apply to.
 */
type NodeParts = {
    /**
     * every `NodeType` member
     */
    types: number;
    /**
     * every `Field`
     */
    field: number;
    /**
     * every `Flag`
     */
    flag: number;
    /**
     * every `Part` with a position
     */
    part: number;
    /**
     * every `Part` with text beyond the name and value
     */
    text: number;
    /**
     * the `Field`s of each node type
     */
    fields: Record<number, number>;
    /**
     * the `Flag`s of each node type
     */
    flags: Record<number, number>;
    /**
     * the `Part`s with a position, by node type
     */
    parts: Record<number, number>;
    /**
     * the `Part`s with text, by node type
     */
    texts: Record<number, number>;
    /**
     * the node type of each `Field`'s items
     */
    items: Record<number, number>;
};
/**
 * The path a visitor of node type `T` receives: its structure reads take only
 * the parts that type has, and its `state` is the run's.
 */
type TypedNodePath<TPath, TNode, P extends NodeParts, T, S = unknown> = Omit<TPath, "node" | "state" | "within" | "field" | "fieldCount" | "fieldNamed" | "flag" | "rangeOf" | "startOf" | "endOf" | "textOf"> & {
    readonly node: TypedNode<TNode, T>;
    readonly state: S;
    within(type: P["types"]): boolean;
    field<R extends TNode = TypedNode<TNode, T>, F extends number = number>(i: number, field: F & PartOf<R, P["fields"], P["field"]>, n?: R): TypedNode<TNode, P["items"][F]>;
    fieldCount<R extends TNode = TypedNode<TNode, T>>(field: PartOf<R, P["fields"], P["field"]>, n?: R): number;
    fieldNamed<R extends TNode = TypedNode<TNode, T>, F extends number = number>(field: F & PartOf<R, P["fields"], P["field"]>, name: string, n?: R): TypedNode<TNode, P["items"][F]>;
    flag<R extends TNode = TypedNode<TNode, T>>(flag: PartOf<R, P["flags"], P["flag"]>, n?: R): boolean;
    rangeOf<R extends TNode = TypedNode<TNode, T>>(part: PartOf<R, P["parts"], P["part"]>, n?: R): [number, number] | null;
    startOf<R extends TNode = TypedNode<TNode, T>>(part: PartOf<R, P["parts"], P["part"]>, n?: R): number;
    endOf<R extends TNode = TypedNode<TNode, T>>(part: PartOf<R, P["parts"], P["part"]>, n?: R): number;
    textOf<R extends TNode = TypedNode<TNode, T>>(part: PartOf<R, P["texts"], P["text"]>, n?: R): string | null;
};
/**
 * The parts of a language that names none: every node type has every part.
 */
type AnyParts = {
    types: number;
    field: number;
    flag: number;
    part: number;
    text: number;
    fields: Record<number, number>;
    flags: Record<number, number>;
    parts: Record<number, number>;
    texts: Record<number, number>;
    items: Record<number, number>;
};
/**
 * what a run hands its visitors as `path.state`
 */
type RunState<S> = {
    state?: S;
};
type VisitorBucket<TPath> = VisitorFn<TPath> | {
    enter?: VisitorFn<TPath>;
    exit?: VisitorFn<TPath>;
};
type VisitorMap<TPath> = {
    [nodeType: number]: VisitorBucket<TPath>;
};
type CompiledVisitorBucket<TPath> = {
    enter: VisitorFn<TPath>[];
    exit: VisitorFn<TPath>[];
};
/**
 * a sparse array indexed by node type
 */
type CompiledVisitorMap<TPath> = CompiledVisitorBucket<TPath>[];
/**
 * What every language's print options carry, read by the node printer via
 * `writer.options`. Only `mode` is here: what else a printer may be told is the
 * language's own business, and a language names it by instantiating
 * {@link PrintContext} with its own type — nothing CSS reads belongs in a
 * typedef HTML also depends on.
 */
type PrintOptions = {
    mode: "minify" | "beautify";
};
/**
 * One write the print left a marker for, collected into the `deferEmbeddedSource`
 * print option by whichever grammar offered it — the other half of
 * {@link deferredWrite}. `source` is the text offered, `build` spells what is
 * printed around the answer (an untapped run's spelling where there is none), and
 * `decides` says whether the answer overturns a choice the print made without it.
 * A grammar carries whatever else describes the offer (`type`, `hostType`, `as`,
 * …) on the same object.
 */
type DeferredWrite = {
    source: string;
    build: (answer: string | undefined) => string;
    decides?: (answer: string | undefined) => boolean;
};
/**
 * A version-3 source map. Written structurally (with the `3` literal) so it
 * satisfies both `webpack-sources` and the minimizer plugin's map types without
 * depending on either.
 */
type SourceMap = {
    version: 3;
    file: string;
    sources: string[];
    sourcesContent?: string[];
    names: string[];
    mappings: string;
};
/**
 * The `process` source-map option: turns map collection on and names the input
 * (`sources[0]` / optional `sourcesContent[0]`). Present => `process` returns
 * `{ code, map }` instead of a bare string.
 */
type SourceMapOptions = {
    source: string;
    content?: string;
};
/**
 * A language node printer, fired for one node once all its visitors have run and
 * its children are printed. It takes the same `path` a visitor gets plus the
 * print context as its `writer`; it switches on `path.type()` and **returns** the
 * node's serialized text, reading its children's text from `writer.get` — knowing
 * nothing of the walk. Returning (rather than writing to a buffer) is what lets a
 * parent compose / transform its text from its finished children.
 */
type NodePrinter<TPath, TNode, TPrintOptions = any> = (path: TPath, writer: PrintContext<TPath, TNode, TPrintOptions>) => string;
/**
 * A language grammar: parse `input` once and fire the compiled visitors in
 * source order. When `writer` is given it is also printing — after each node's
 * visitors have run and its children are printed, the grammar fires the node
 * printer into `writer`; a single parse with no re-tokenizing.
 */
type Grammar<TPath, TNode, TProcessOptions, TPrintOptions = any> = (input: string, visitors: CompiledVisitorMap<TPath>, writer: PrintContext<TPath, TNode, TPrintOptions> | undefined, options: TProcessOptions) => void;
