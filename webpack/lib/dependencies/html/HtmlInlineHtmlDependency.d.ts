export = HtmlInlineHtmlDependency;
/**
 * Represents an `<iframe srcdoc="...">` attribute — an entity-encoded HTML
 * document. The decoded document is fed back through webpack's HTML pipeline as
 * a virtual `data:text/html` module so its asset URLs resolve relative to the
 * host HTML file. At render time the attribute value is replaced with the
 * processed HTML read from the nested module's `html` code-generation data,
 * re-escaped so the surrounding attribute stays valid.
 */
declare class HtmlInlineHtmlDependency extends ModuleDependency {
    /**
     * @param {string} request virtual request resolving to the inline HTML (data URI)
     * @param {Range} range range of the `srcdoc` attribute value
     */
    constructor(request: string, range: Range);
}
declare namespace HtmlInlineHtmlDependency {
    export { HtmlInlineHtmlDependencyTemplate as Template };
}
import ModuleDependency = require("../core/ModuleDependency");
import type { Range } from "../../javascript/JavascriptParser";
declare const HtmlInlineHtmlDependencyTemplate_base: typeof import("../../template/DependencyTemplate");
declare class HtmlInlineHtmlDependencyTemplate extends HtmlInlineHtmlDependencyTemplate_base {
}
