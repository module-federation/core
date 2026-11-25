export = WebManifestGenerator;
/**
 * The module type the JSDoc inherited from `Generator` names.
 * @typedef {AssetNormalModule} TModule
 */
/**
 * A Web App Manifest is a "typed asset": a variant of `AssetGenerator` (reusing
 * its filename/hash and `ASSET_URL_TYPE` machinery) whose emitted content is the
 * raw JSON with each icon `src` rewritten to its bundled asset URL. The manifest
 * itself is emitted — with its own URL exposed to the referencing
 * `<link rel="manifest">` — by `AssetModulesPlugin`'s `renderManifest`, which
 * resolves the per-file public path (like the CSS/HTML plugins).
 */
declare class WebManifestGenerator extends AssetGenerator {
    /**
     * @param {ModuleGraph} moduleGraph the module graph
     */
    constructor(moduleGraph: ModuleGraph);
    /**
     * Rewrites each icon `src` in the raw manifest to its emitted asset URL.
     * @param {TModule} module the manifest module
     * @param {GenerateContext} generateContext context for generate
     * @returns {string} the rewritten manifest content
     */
    _rewrite(module: TModule, generateContext: GenerateContext): string;
}
declare namespace WebManifestGenerator {
    export { TModule };
}
import AssetGenerator = require("./AssetGenerator");
import type { GenerateContext } from "../module/Generator";
import type ModuleGraph from "../graph/ModuleGraph";
/**
 * The module type the JSDoc inherited from `Generator` names.
 */
type TModule = AssetNormalModule;
import type { AssetNormalModule } from "./AssetModule";
