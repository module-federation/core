/**
 * The three elements `</form>` and the block end tags share a close path with.
 * @type {Set<string>}
 */
export const ADDRESS_DIV_P: Set<string>;
/**
 * The elements that push a marker onto the list of active formatting elements.
 * @type {Set<string>}
 */
export const APPLET_MARQUEE_OBJECT: Set<string>;
/**
 * End tags "in body" closes a block for — `BLOCK_START` plus the elements with no start-tag clause of their own.
 * @type {Set<string>}
 */
export const BLOCK_END: Set<string>;
/**
 * Elements §15 gives a non-inline default display. Whitespace against one of their edges renders as nothing, which is what `collapseWhitespace: "smart"` drops. Author CSS can still make one inline, so the mode is opt-in.
 * @type {Set<string>}
 */
export const BLOCK_LEVEL_ELEMENTS: Set<string>;
/**
 * Start tags "in body" closes an open `<p>` before inserting.
 * @type {Set<string>}
 */
export const BLOCK_START: Set<string>;
/**
 * The end tags "after body" acts on rather than ignores.
 * @type {Set<string>}
 */
export const BODY_HTML_BR: Set<string>;
/**
 * §13.1.2.4: the elements that keep a `<body>` start tag when the body opens
 * with one — the parser reads them as head content and would move them out of
 * the body once the tag goes.
 * @type {Set<string>}
 */
export const BODY_START_KEPT_BEFORE: Set<string>;
/**
 * §2.4.2 boolean attributes, mapped to the elements each one is boolean *on*
 * (`null` = a global attribute). Elsewhere the same name is an ordinary
 * attribute whose value a script may read.
 * @type {Map<string, Set<string> | null>}
 */
export const BOOLEAN_ATTRIBUTES: Map<string, Set<string> | null>;
/**
 * End tags "in caption" ignores.
 * @type {Set<string>}
 */
export const CAPTION_IGNORED_ENDS: Set<string>;
/**
 * Start tags "in caption" closes the caption for.
 * @type {Set<string>}
 */
export const CAPTION_TABLE_STARTS: Set<string>;
/**
 * End tags "in cell" ignores.
 * @type {Set<string>}
 */
export const CELL_IGNORED_ENDS: Set<string>;
/**
 * "clear the stack back to a table context" stops here.
 * @type {Set<string>}
 */
export const CLEAR_TABLE: Set<string>;
/**
 * "clear the stack back to a table body context" stops here.
 * @type {Set<string>}
 */
export const CLEAR_TABLE_BODY: Set<string>;
/**
 * "clear the stack back to a table row context" stops here.
 * @type {Set<string>}
 */
export const CLEAR_TABLE_ROW: Set<string>;
/**
 * Attributes whose value is a comma-separated list, so the whitespace around
 * each comma and around the ends carries nothing. Whitespace *inside* an item is
 * never dropped: it belongs to the token `accept` keeps, separates numbers in
 * `coords`, and carries the media condition in `sizes`.
 * @type {Set<string>}
 */
export const COMMA_LIST_ATTRIBUTES: Set<string>;
/**
 * The token lists reflected as a `DOMTokenList`, which is an ordered *set* — a
 * repeated token was never a second token, so dropping it changes nothing the
 * DOM reads. The rest are read back as written, and `ping` sends one request
 * per token, so a repeat there is not the printer's to drop.
 * @type {Set<string>}
 */
export const DOM_TOKEN_LIST_ATTRIBUTES: Set<string>;
/**
 * Elements `removeEmptyElements` may drop: with no children and no attributes each renders nothing and is read by nothing; every other element, a custom one included, is kept.
 * @type {Set<string>}
 */
export const EMPTY_ELEMENT_DROPPED: Set<string>;
/**
 * A void element that belongs in the head: with no attributes it states nothing,
 * so `removeEmptyElements` may drop it even though every other void element is
 * kept. Derived as the head elements that are also void.
 * @type {Set<string>}
 */
export const EMPTY_METADATA_ELEMENTS: Set<string>;
/**
 * Attributes `removeEmptyAttributes` may drop when their value is empty or all whitespace, mapped to the elements they mean that on (`null` = a global attribute): the spec gives each the same state empty and absent. Four hand-reasoned globals, plus every token-list attribute (no tokens is what absence gives). The element matters — on any element the spec does not define it for, `rel` or `headers` is an ordinary author attribute a script reads back, so `<x-foo rel="">` keeps it. `sandbox` is the token list held back: its empty list is the most restrictive state an `<iframe>` has. Only a presence selector (`[class]`) or a script reading the attribute back can tell, which is what keeps the option off by default.
 * @type {Map<string, Set<string> | null>}
 */
export const EMPTY_REMOVABLE_ATTRIBUTES: Map<string, Set<string> | null>;
/**
 * Every name `ENUMERATED_KEYWORDS` scopes, whatever the element. One miss here
 * rules an attribute out, which is what keeps the enumerated fold off the cost
 * of every attribute that enumerates nothing.
 * @type {Set<string>}
 */
export const ENUMERATED_ATTRIBUTE_NAMES: Set<string>;
/**
 * element -> attribute -> the keywords the spec enumerates for it, matched ASCII-case-insensitively. `*` holds the global attributes. Only a value already in the set is folded to lower case, so a spelling the spec does not enumerate keeps its case.
 * @type {Record<string, Record<string, Set<string>>>}
 */
export const ENUMERATED_KEYWORDS: Record<string, Record<string, Set<string>>>;
/**
 * Event handler content attributes, mapped to the elements each is one on
 * (`null` = a global attribute). Elsewhere the same name is an ordinary
 * attribute holding text — `onunload` is a handler on `<body>` and data on a
 * `<div>` — so the value is only read as JavaScript where the table says it is.
 * @type {Map<string, Set<string> | null>}
 */
export const EVENT_HANDLER_ATTRIBUTES: Map<string, Set<string> | null>;
/**
 * The `<font>` attributes that make it break out of foreign content.
 * @type {Set<string>}
 */
export const FONT_BREAKOUT_ATTRS: Set<string>;
/**
 * §13.2.6.1 "adjust foreign attributes": the attributes serialized with a namespace prefix.
 * @type {Record<string, string>}
 */
export const FOREIGN_ATTR_NS: Record<string, string>;
/**
 * HTML start tags that break out of foreign (SVG/MathML) content.
 * @type {Set<string>}
 */
export const FOREIGN_BREAKOUT: Set<string>;
/**
 * §13.2.4.3 formatting elements: the ones reconstructed from the list of active formatting elements.
 * @type {Set<string>}
 */
export const FORMATTING: Set<string>;
/**
 * The start tags §13.2.6.4.9 gives a rule of its own, so "in table" inserts them where they stand instead of taking the "anything else" arc that fosters one out. Read by the printer, which may only move a fostered run back inside the table when the table would foster all of it straight out again. Prose rather than a dataset: the IDL says nothing about insertion modes.
 * @type {Set<string>}
 */
export const FOSTER_KEPT: Set<string>;
/**
 * The heading elements, whose start tag closes an open one.
 * @type {Set<string>}
 */
export const HEADING: Set<string>;
/**
 * The end tags "after head" / "before head" act on rather than ignore.
 * @type {Set<string>}
 */
export const HEAD_BODY_HTML_BR: Set<string>;
/**
 * The elements that belong in `<head>`.
 * @type {Set<string>}
 */
export const HEAD_ELEMENTS: Set<string>;
/**
 * Void elements "in head" inserts and immediately pops.
 * @type {Set<string>}
 */
export const HEAD_VOID_ELEMENTS: Set<string>;
/**
 * §13.2.4.2 "the stack of open elements has an element in scope": the elements that stop the walk.
 * @type {Set<string>}
 */
export const HTML_SCOPE: Set<string>;
/**
 * Table start tags "in body" ignores outside a table.
 * @type {Set<string>}
 */
export const IGNORED_BODY_TABLE_STARTS: Set<string>;
/**
 * §13.2.6.4.7 "generate implied end tags": the elements popped without their end tag.
 * @type {Set<string>}
 */
export const IMPLIED: Set<string>;
/**
 * "generate all implied end tags thoroughly" — the wider list the table modes use.
 * @type {Set<string>}
 */
export const IMPLIED_THOROUGH: Set<string>;
/**
 * Attributes parsed with the integer rules, mapped to the elements they are one
 * on (`null` = a global attribute). Those rules skip leading whitespace and
 * stop at the first non-digit, so trimming and dropping leading zeros parse the
 * same. `width` / `height` are absent on `<td>` and `<table>`, where the
 * legacy dimension grammar also admits a percentage.
 * @type {Map<string, Set<string> | null>}
 */
export const INTEGER_ATTRIBUTES: Map<string, Set<string> | null>;
/**
 * `<element> <attribute>` for each enumerated attribute whose invalid value default names a different state from its missing value default, so a value matching no keyword may not be dropped as redundant.
 * @type {Set<string>}
 */
export const INVALID_VALUE_DEFAULT_DIFFERS: Set<string>;
/**
 * "in head noscript" start tags handled by reprocessing in "in head".
 * @type {Set<string>}
 */
export const IN_HEAD_NOSCRIPT_PASSTHROUGH: Set<string>;
/**
 * End tags "in table" ignores.
 * @type {Set<string>}
 */
export const IN_TABLE_IGNORED_ENDS: Set<string>;
/**
 * `<script>` `type` values that make the body executable JavaScript, per the spec's JavaScript MIME type essence list plus the empty and `module` spellings. Anything else is a data block, which must pass through as an asset rather than be bundled as an entry. The IDL says nothing about MIME essences, so this cannot be read out of webref.
 * @type {Set<string>}
 */
export const JAVASCRIPT_SCRIPT_TYPES: Set<string>;
/**
 * `<script>` bodies that are JSON: the two dedicated types plus any `+json` subtype (`application/ld+json`).
 * @type {Set<string>}
 */
export const JSON_SCRIPT_TYPES: Set<string>;
/**
 * Elements the parser strips one leading newline from, so a serialized body that still begins with one needs it re-added.
 * @type {Set<string>}
 */
export const LEADING_NEWLINE_ELEMENTS: Set<string>;
/**
 * Elements whose text children serialize literally, no escaping. `textarea` / `title` are escapable, so they are not here. `noscript` holds text only as a printed document is parsed, with scripting on.
 * @type {Set<string>}
 */
export const LITERAL_TEXT_PARENTS: Set<string>;
/**
 * The MathML elements an HTML breakout pops back to.
 * @type {Set<string>}
 */
export const MATHML_SPECIAL: Set<string>;
/**
 * MathML text integration points (§13.2.6.5): HTML content resumes inside them.
 * @type {Set<string>}
 */
export const MATHML_TEXT_INTEGRATION: Set<string>;
/**
 * The raw-text elements "in head" tokenizes as such.
 * @type {Set<string>}
 */
export const NOFRAMES_STYLE_NOSCRIPT: Set<string>;
/**
 * Elements whose text is tokenized raw, so no character reference in it is decoded.
 * @type {Set<string>}
 */
export const NO_DECODE_TEXT: Set<string>;
/**
 * The subset of `OPTIONAL_END_TAG_FOLLOWERS` that may also drop the end tag with
 * nothing left in the parent. `<dt>` and `<thead>` are absent: the spec gives
 * them no such clause.
 * @type {Set<string>}
 */
export const OPTIONAL_END_TAG_AT_END: Set<string>;
/**
 * §13.1.2.4: the element names whose end tag may be omitted when the next
 * sibling is one of the mapped names. `<html>`, `<head>` and `<body>` are
 * deliberately absent — their end tags are omissible too, but non-browser
 * consumers routinely mis-parse a document that is missing them.
 * @type {Map<string, Set<string>>}
 */
export const OPTIONAL_END_TAG_FOLLOWERS: Map<string, Set<string>>;
/**
 * §13.1.2.4: the elements whose end tag may be omitted unless ASCII whitespace
 * or a comment follows. A different condition from the follower-set rule above:
 * what closes these is the insertion mode, whatever the next element is, so only
 * a node that would move inside them keeps the tag.
 * @type {Set<string>}
 */
export const OPTIONAL_END_TAG_UNLESS_TRAILING_NODE: Set<string>;
/**
 * Void start tags "in body" that do not reconstruct.
 * @type {Set<string>}
 */
export const PARAM_SOURCE_TRACK: Set<string>;
/**
 * Parents whose own end tag generates implied end tags, so a trailing `</p>`
 * inside one is closed by it and can be left out (§13.2.6.4.7). Listed rather
 * than excluded: an end tag not named here is "any other end tag", which a
 * special element on the stack makes the parser ignore — so anything unknown,
 * a custom element included, keeps its `</p>`.
 * @type {Set<string>}
 */
export const P_ENDS_ON_PARENT_END_TAG: Set<string>;
/**
 * §13.1.2.4: the elements a `<p>` end tag may be omitted in front of.
 * @type {Set<string>}
 */
export const P_FOLLOWED_BY: Set<string>;
/**
 * Public ids that force quirks mode exactly.
 * @type {Set<string>}
 */
export const QUIRKY_EXACT: Set<string>;
/**
 * Public-id prefixes that force quirks mode (the "quirks mode" doctype table).
 * @type {string[]}
 */
export const QUIRKY_PREFIXES: string[];
/**
 * Raw text / escapable raw text elements (§13.1.2) plus the other RAWTEXT/RCDATA/PLAINTEXT-tokenized ones.
 * @type {Set<string>}
 */
export const RAW_TEXT_ELEMENTS: Set<string>;
/**
 * element -> attribute -> the value the element already defaults to, for `removeRedundantAttributes: "all"`, grouped like `REDUNDANT_TYPE_ATTRIBUTES`. Dropping these is what makes the option unsafe: an attribute selector matches the content attribute, not the reflected default, so `input[type=text]` stops matching. Spec defaults, which the IDL does not state.
 * @type {Record<string, Record<string, string>>}
 */
export const REDUNDANT_DEFAULT_ATTRIBUTES: Record<string, Record<string, string>>;
/**
 * element -> attribute -> the value that states the element's own default, for `removeRedundantAttributes: "smart"` (the default). Grouped by element so the printer gates on one lookup for an element no entry names, which is nearly every attribute it prints. Only markers on elements that render nothing, so no rule that styles the page stops applying — unlike `input[type=text]`, which is why that tier is separate. A `querySelector` naming one of these can still tell it went. `media` defaults to `all`, and a `<script charset>` matching the document encoding is obsolete and ignored. Matched ASCII-case-insensitively, unlike `@swc/html`, which lowercases `type` but not `media` / `charset`. `<script type>` is not here — its redundant values are `JAVASCRIPT_SCRIPT_TYPES` minus the empty and `module` spellings, which mean something.
 * @type {Record<string, Record<string, string>>}
 */
export const REDUNDANT_TYPE_ATTRIBUTES: Record<string, Record<string, string>>;
/**
 * §4.13.1's exclusions from a valid custom element name: the hyphenated SVG and MathML names a parser would otherwise read as custom. Prose in the name production, and the SVG names are not among the camel-cased ones §13.2.6.5 adjusts, so nothing here derives them.
 * @type {Set<string>}
 */
export const RESERVED_ELEMENT_NAMES: Set<string>;
/**
 * Every attribute name a value rewrite can act on. One miss here rules an
 * attribute out of the whole chain, which is what most of them are.
 * @type {Set<string>}
 */
export const REWRITABLE_ATTRIBUTES: Set<string>;
/**
 * End tags "in row" ignores.
 * @type {Set<string>}
 */
export const ROW_IGNORED_ENDS: Set<string>;
/**
 * Start tags "in row" closes the row for.
 * @type {Set<string>}
 */
export const ROW_TRIGGER_STARTS: Set<string>;
/**
 * Open elements a start tag of another name ends through a scope check, for the pairs no broader rule already states — not the same name, not one heading behind another, and not two of `IMPLIED` ending each other. §13.2.6.4.7 pops an open `<select>` for an `<input>`, and generates implied end tags for an `<hr>` while a `<select>` is in scope. Prose rather than a dataset, for the same reason as `FOSTER_KEPT`.
 * @type {Map<string, Set<string> | null>}
 */
export const SCOPE_ENDED_BY: Map<string, Set<string> | null>;
/**
 * DOM §4.9's valid shadow host names — what `attachShadow()` accepts by name, so what a `<template shadowrootmode>` attaches to. Prose in the DOM spec, which publishes no element dataset, so webref's HTML IDL cannot state it.
 * @type {Set<string>}
 */
export const SHADOW_HOSTS: Set<string>;
/**
 * The three the parser implies around every document. Their end tags are omissible like any other, but non-browser consumers routinely mis-parse a document missing them, so the printer decides them by policy rather than by what follows — which is why `OPTIONAL_END_TAG_FOLLOWERS` leaves them out.
 * @type {Set<string>}
 */
export const SHELL_ELEMENTS: Set<string>;
/**
 * The subset of `INTEGER_ATTRIBUTES` parsed with the "rules for parsing
 * integers" rather than the non-negative ones — only those accept a `+` or
 * `-`, so elsewhere a signed value does not parse at all and has to stand.
 * @type {Set<string>}
 */
export const SIGNED_INTEGER_ATTRIBUTES: Set<string>;
/**
 * §13.2.4.2's "special" category — the elements the adoption agency and the scope tests treat as barriers.
 * @type {Set<string>}
 */
export const SPECIAL: Set<string>;
/**
 * The attributes whose value is a srcset (WHATWG "parse a srcset attribute").
 * @type {Set<string>}
 */
export const SRCSET_ATTRIBUTES: Set<string>;
/**
 * The head elements "in body" re-dispatches to "in head".
 * @type {Set<string>}
 */
export const STYLE_SCRIPT_TEMPLATE: Set<string>;
/**
 * §13.2.6.1 "adjust SVG attributes": lowercased source name -> the camelCased SVG attribute.
 * @type {Record<string, string>}
 */
export const SVG_ATTR_ADJUST: Record<string, string>;
/**
 * HTML integration points in SVG (§13.2.6.5).
 * @type {Set<string>}
 */
export const SVG_SPECIAL: Set<string>;
/**
 * §13.2.6.5 "adjust SVG tag name": lowercased source name -> the camelCased SVG name.
 * @type {Record<string, string>}
 */
export const SVG_TAG_ADJUST: Record<string, string>;
/**
 * The elements "in table" text is fostered out of.
 * @type {Set<string>}
 */
export const TABLE_CONTEXT: Set<string>;
/**
 * The table-scope barrier (§13.2.4.2 "has an element in table scope").
 * @type {Set<string>}
 */
export const TABLE_SCOPE_STOP: Set<string>;
/**
 * The three row-group elements, interchangeable in the table modes.
 * @type {Set<string>}
 */
export const TBODY_GROUP: Set<string>;
/**
 * End tags "in table body" ignores.
 * @type {Set<string>}
 */
export const TBODY_IGNORED_ENDS: Set<string>;
/**
 * Start tags "in table body" closes the row group for.
 * @type {Set<string>}
 */
export const TBODY_TRIGGER_STARTS: Set<string>;
/**
 * The two cell elements.
 * @type {Set<string>}
 */
export const TD_TH: Set<string>;
/**
 * The cell elements plus their row, closed together.
 * @type {Set<string>}
 */
export const TD_TH_TR: Set<string>;
/**
 * §13.2.6.4.18 "in template": the start tags that re-dispatch, each to the insertion mode it switches to. Named, not numbered — the numbering is the parser's own, so `syntax.js` binds these names to its constants.
 * @type {Record<string, string>}
 */
export const TEMPLATE_START_TAG_MODES: Record<string, string>;
/**
 * The attributes whose value is an ASCII-whitespace-separated token list, mapped
 * to the elements they are one on (`null` = a global attribute), so collapsing
 * the separators keeps the set the DOM reads. The element matters: `for` is a
 * token list on `<output>` but one id on `<label>`, and an id may contain a
 * space; `sizes` is one on `<link>` but a source-size list on `<img>`.
 * @type {Map<string, Set<string> | null>}
 */
export const TOKEN_LIST_ATTRIBUTES: Map<string, Set<string> | null>;
/**
 * The only elements the printer may leave transparent when they lack a source tag: the parser re-implies them identically. Any other tag-less element (adoption-agency clone, reconstructed formatting element, renamed token) must be materialized or the DOM changes.
 * @type {Set<string>}
 */
export const TRANSPARENT_IMPLIED_ELEMENTS: Set<string>;
/**
 * Attributes parsed as a URL, mapped to the elements they are one on. The URL
 * parser strips leading and trailing C0 controls and spaces, so trimming the
 * ASCII whitespace among them resolves to the same URL.
 * @type {Map<string, Set<string> | null>}
 */
export const URL_ATTRIBUTES: Map<string, Set<string> | null>;
/**
 * §13.1.2 void elements: no end tag, and no children to close one over.
 * @type {Set<string>}
 */
export const VOID: Set<string>;
/**
 * Void start tags "in body" that reconstruct the active formatting elements first.
 * @type {Set<string>}
 */
export const VOID_FORMATTING: Set<string>;
