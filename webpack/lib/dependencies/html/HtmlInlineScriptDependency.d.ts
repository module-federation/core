export = HtmlInlineScriptDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import Dependency from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[number, Range, string, string, Range | undefined, boolean]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[number, Range, string, string, Range | undefined, boolean]>} ObjectSerializerContext */
/**
 * Represents an inline `<script>...</script>` block in an HTML module. The
 * tag's body is bundled as its own entry chunk — the same pipeline that
 * processes `<script src>` — and the inline body is replaced with a
 * `src` attribute pointing at the emitted chunk URL. A tag sharing an
 * earlier tag's entry carries a `removeRange` and is dropped instead.
 */
declare class HtmlInlineScriptDependency extends ModuleDependency {
    /**
     * Creates an instance of HtmlInlineScriptDependency.
     * @param {string} request virtual request resolving to the inline JS (data URI)
     * @param {number} insertPos position right after `<script` where ` src="…"` is inserted
     * @param {Range} contentRange range of the inline JS body (between `<script>` and `</script>`)
     * @param {string} entryName name of the entry the inline JS is bundled into
     * @param {string=} category dependency category used for resolving and grouping
     * @param {Range=} removeRange range of the whole element, when the tag is dropped
     * @param {boolean=} forceInline `<!-- webpackInline: true -->` was set before this tag
     */
    constructor(request: string, insertPos: number, contentRange: Range, entryName: string, category?: string | undefined, removeRange?: Range | undefined, forceInline?: boolean | undefined);
    /** @type {number} */
    insertPos: number;
    contentRange: Range;
    /** @type {string} */
    entryName: string;
    /** @type {string} */
    _category: string;
    /** @type {Range | undefined} */
    removeRange: Range | undefined;
    /** @type {boolean} */
    forceInline: boolean;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     */
    deserialize(context: ObjectDeserializerContext): void;
}
declare namespace HtmlInlineScriptDependency {
    export { HtmlInlineScriptDependencyTemplate as Template, ObjectDeserializerContext, ObjectSerializerContext };
}
import ModuleDependency = require("../core/ModuleDependency");
import type { Range } from "../../javascript/JavascriptParser";
declare const HtmlInlineScriptDependencyTemplate_base: typeof import("../../template/DependencyTemplate");
declare class HtmlInlineScriptDependencyTemplate extends HtmlInlineScriptDependencyTemplate_base {
}
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[number, Range, string, string, Range | undefined, boolean]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[number, Range, string, string, Range | undefined, boolean]>;
