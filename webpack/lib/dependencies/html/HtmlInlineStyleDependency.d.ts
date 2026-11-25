export = HtmlInlineStyleDependency;
/**
 * Represents inline CSS in an HTML module — either a `<style>...</style>`
 * block (a stylesheet) or an element's `style="..."` attribute (a CSS
 * block's contents). The content is fed into webpack's CSS pipeline as a
 * virtual CSS module with `exportType: "text"` so `url()` and `\@import`
 * references are resolved relative to the HTML file. At render time the
 * original content range is replaced with the processed CSS text read from
 * the CSS module's code generation data.
 */
declare class HtmlInlineStyleDependency extends ModuleDependency {
    /**
     * Creates an instance of HtmlInlineStyleDependency.
     * @param {string} request virtual request resolving to the inline CSS (data URI)
     * @param {Range} range range of the inline CSS content (between `<style>` and `</style>`, or the `style` attribute value)
     * @param {boolean=} attribute true when the source is a `style="..."` attribute (a block's contents) rather than a `<style>` block (stylesheet)
     * @param {boolean=} inAttribute true when the range is an attribute value (decoded on parse, so the processed CSS must be re-escaped on write-back); defaults to `attribute` — differs only for attribute values parsed as full stylesheets
     * @param {boolean=} characterData true when the range is a `<style>` body in a foreign (SVG/MathML) subtree, where the content model is character data rather than raw text, so the processed CSS is escaped as text on write-back
     */
    constructor(request: string, range: Range, attribute?: boolean | undefined, inAttribute?: boolean | undefined, characterData?: boolean | undefined);
    /** @type {boolean} */
    attribute: boolean;
    /** @type {boolean} */
    inAttribute: boolean;
    /** @type {boolean} */
    characterData: boolean;
    get category(): "html-style-attribute" | "html-style";
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
declare namespace HtmlInlineStyleDependency {
    export { HtmlInlineStyleDependencyTemplate as Template, ObjectDeserializerContext, ObjectSerializerContext };
}
import ModuleDependency = require("../core/ModuleDependency");
import type { Range } from "../../javascript/JavascriptParser";
declare const HtmlInlineStyleDependencyTemplate_base: typeof import("../../template/DependencyTemplate");
declare class HtmlInlineStyleDependencyTemplate extends HtmlInlineStyleDependencyTemplate_base {
}
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<boolean[]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<boolean[]>;
