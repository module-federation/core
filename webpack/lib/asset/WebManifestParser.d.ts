export = WebManifestParser;
/**
 * Parses a Web App Manifest (`.webmanifest`) so its icon/screenshot `src`
 * URLs are bundled as assets. Reuses acorn (JSON is a valid JS expression
 * literal) to recover the exact source offsets, then emits an
 * `HtmlSourceDependency` per URL so the generator can rewrite it in place.
 */
declare class WebManifestParser extends Parser<import("../module/NormalModule")> {
    constructor();
}
declare namespace WebManifestParser {
    export { Positioned };
}
import Parser = require("../module/Parser");
type Positioned = {
    start: number;
    end: number;
};
