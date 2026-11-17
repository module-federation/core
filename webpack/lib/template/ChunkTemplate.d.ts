export = ChunkTemplate;
/** @import { Tap } from "tapable" */
/** @import { Source } from "webpack-sources" */
/**
 * @import {
 * 	OutputNormalizedWithDefaults as OutputOptions
 * } from "../config/defaults"
 */
/** @import Chunk from "../graph/Chunk" */
/** @import Compilation, { ChunkHashContext } from "../Compilation" */
/** @import ModuleTemplate from "./ModuleTemplate" */
/** @import { RenderContext } from "../javascript/JavascriptModulesPlugin" */
/** @import { RenderManifestEntry, RenderManifestOptions } from "./Template" */
/** @import Hash from "../util/Hash" */
/**
 * Defines the if set type used by this module.
 * @template T
 * @typedef {import("tapable").IfSet<T>} IfSet
 */
declare class ChunkTemplate {
    /**
     * Creates an instance of ChunkTemplate.
     * @param {OutputOptions} outputOptions output options
     * @param {Compilation} compilation the compilation
     */
    constructor(outputOptions: OutputOptions, compilation: Compilation);
    _outputOptions: {};
    hooks: Readonly<{
        renderManifest: {
            tap: <AdditionalOptions>(options: string | (Tap & IfSet<AdditionalOptions>), fn: (renderManifestEntries: RenderManifestEntry[], renderManifestOptions: RenderManifestOptions) => RenderManifestEntry[]) => void;
        };
        modules: {
            tap: <AdditionalOptions>(options: string | (Tap & IfSet<AdditionalOptions>), fn: (source: Source, moduleTemplate: ModuleTemplate, renderContext: JavascriptModulesPlugin.RenderContext) => Source) => void;
        };
        render: {
            tap: <AdditionalOptions>(options: string | (Tap & IfSet<AdditionalOptions>), fn: (source: Source, moduleTemplate: ModuleTemplate, renderContext: JavascriptModulesPlugin.RenderContext) => Source) => void;
        };
        renderWithEntry: {
            tap: <AdditionalOptions>(options: string | (Tap & IfSet<AdditionalOptions>), fn: (source: Source, chunk: Chunk) => Source) => void;
        };
        hash: {
            tap: <AdditionalOptions>(options: string | (Tap & IfSet<AdditionalOptions>), fn: (hash: Hash) => void) => void;
        };
        hashForChunk: {
            tap: <AdditionalOptions>(options: string | (Tap & IfSet<AdditionalOptions>), fn: (hash: Hash, chunk: Chunk, chunkHashContext: Compilation.ChunkHashContext) => void) => void;
        };
    }>;
    get outputOptions(): OutputOptions;
}
declare namespace ChunkTemplate {
    export { IfSet };
}
import type { Tap } from "tapable";
import type { RenderManifestEntry } from "./Template";
import type { RenderManifestOptions } from "./Template";
import type { Source } from "webpack-sources";
import type ModuleTemplate from "./ModuleTemplate";
import JavascriptModulesPlugin = require("../javascript/JavascriptModulesPlugin");
import type Chunk from "../graph/Chunk";
import type Hash from "../util/Hash";
import type Compilation from "../Compilation";
import type { OutputNormalizedWithDefaults as OutputOptions } from "../config/defaults";
/**
 * Defines the if set type used by this module.
 */
type IfSet<T> = import("tapable").IfSet<T>;
