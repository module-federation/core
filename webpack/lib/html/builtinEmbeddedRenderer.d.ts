/**
 * What this minifies inline CSS with: the CSS minifier's own options, so an
 * inline declaration is held to the rules a `.css` asset is.
 */
export type BuiltinEmbeddedRendererOptions = Pick<CssProcessOptions, "environment" | "convertLengthUnits" | "convertApproximateColors" | "dropOverriddenDeclarations" | "rewriteCustomProperties" | "transforms" | "unusedSymbols" | "pseudoClasses"> & BuiltinSvgOptions;
export type BuiltinSvgOptions = {
    /**
     * minify an SVG `data:` URL as the `.svg` assets are, wherever that is shorter (default false)
     */
    svg?: boolean | undefined;
};
/**
 * The renderer webpack ships for what a document embeds: its own CSS minifier
 * for a `<style>` or `style=""`, `stripJsonWhitespace` for JSON and, with `svg`,
 * the XML minifier for an SVG `data:` URL, declining every other language. A
 * caller passes it where it has no renderer of its own, or behind one for the
 * languages that one declines — the HTML printer minifies none of this itself.
 * @param {BuiltinEmbeddedRendererOptions=} options the CSS minifier's options, so an inline declaration is minified as the `.css` assets are, and `svg`, whether an SVG `data:` URL is minified as the `.svg` assets are
 * @returns {EmbeddedSourceRenderer} the renderer
 */
export function builtinEmbeddedRenderer(options?: BuiltinEmbeddedRendererOptions | undefined): EmbeddedSourceRenderer;
/** @import { CssPrintOptions, CssProcessOptions } from "../css/syntax-parser" */
/** @import { EmbeddedSourceRenderer } from "./syntax-printer" */
/**
 * What this minifies inline CSS with: the CSS minifier's own options, so an
 * inline declaration is held to the rules a `.css` asset is.
 * @typedef {Pick<CssProcessOptions, "environment" | "convertLengthUnits" | "convertApproximateColors" | "dropOverriddenDeclarations" | "rewriteCustomProperties" | "transforms" | "unusedSymbols" | "pseudoClasses"> & BuiltinSvgOptions} BuiltinEmbeddedRendererOptions
 */
/**
 * @typedef {object} BuiltinSvgOptions
 * @property {boolean=} svg minify an SVG `data:` URL as the `.svg` assets are, wherever that is shorter (default false)
 */
/**
 * Strip the whitespace between a JSON body's tokens, every literal copied byte
 * for byte. Re-serializing would round numbers, drop a duplicate key and rewrite
 * the escapes that keep a string from closing the `<script>` early.
 * @param {string} json a `<script>` body
 * @returns {string} the stripped body, or the body as written where it is not JSON
 */
export function stripJsonWhitespace(json: string): string;
import type { CssProcessOptions } from "../css/syntax-parser";
import type { EmbeddedSourceRenderer } from "./syntax-printer";
