export = MainTemplate;
/** @import { Tap } from "tapable" */
/** @import { Source } from "webpack-sources" */
/**
 * @import {
 * 	OutputNormalizedWithDefaults as OutputOptions
 * } from "../config/defaults"
 */
/** @import ModuleTemplate from "./ModuleTemplate" */
/** @import Chunk from "../graph/Chunk" */
/**
 * @import Compilation, {
 * 	AssetInfo,
 * 	InterpolatedPathAndAssetInfo,
 * 	PathData
 * } from "../Compilation"
 */
/** @import Hash from "../util/Hash" */
/** @import DependencyTemplates from "./DependencyTemplates" */
/**
 * @import {
 * 	RenderBootstrapContext
 * } from "../javascript/JavascriptModulesPlugin"
 */
/** @import { RenderManifestOptions, RenderManifestEntry } from "./Template" */
/** @import { TemplatePath } from "./TemplatedPathPlugin" */
/**
 * Defines the if set type used by this module.
 * @template T
 * @typedef {import("tapable").IfSet<T>} IfSet
 */
declare class MainTemplate {
    /**
     * Creates an instance of MainTemplate.
     * @param {OutputOptions} outputOptions output options for the MainTemplate
     * @param {Compilation} compilation the compilation
     */
    constructor(outputOptions: OutputOptions, compilation: Compilation);
    /** @type {OutputOptions} */
    _outputOptions: OutputOptions;
    hooks: Readonly<{
        renderManifest: {
            tap: <AdditionalOptions>(options: string | (Tap & IfSet<AdditionalOptions>), fn: (renderManifestEntries: RenderManifestEntry[], renderManifestOptions: RenderManifestOptions) => RenderManifestEntry[]) => void;
        };
        modules: {
            tap: () => never;
        };
        moduleObj: {
            tap: () => never;
        };
        require: {
            tap: <AdditionalOptions>(options: string | (Tap & IfSet<AdditionalOptions>), fn: (value: string, renderBootstrapContext: JavascriptModulesPlugin.RenderBootstrapContext) => string) => void;
        };
        beforeStartup: {
            tap: () => never;
        };
        startup: {
            tap: () => never;
        };
        afterStartup: {
            tap: () => never;
        };
        render: {
            tap: <AdditionalOptions>(options: string | (Tap & IfSet<AdditionalOptions>), fn: (source: Source, chunk: Chunk, hash: string | undefined, moduleTemplate: ModuleTemplate, dependencyTemplates: DependencyTemplates) => Source) => void;
        };
        renderWithEntry: {
            tap: <AdditionalOptions>(options: string | (Tap & IfSet<AdditionalOptions>), fn: (source: Source, chunk: Chunk, hash: string | undefined) => Source) => void;
        };
        assetPath: {
            tap: <AdditionalOptions>(options: string | (Tap & IfSet<AdditionalOptions>), fn: (value: string, path: Compilation.PathData, assetInfo: Compilation.AssetInfo | undefined) => string) => void;
            call: (filename: TemplatePath, options: Compilation.PathData) => string;
        };
        hash: {
            tap: <AdditionalOptions>(options: string | (Tap & IfSet<AdditionalOptions>), fn: (hash: Hash) => void) => void;
        };
        hashForChunk: {
            tap: <AdditionalOptions>(options: string | (Tap & IfSet<AdditionalOptions>), fn: (hash: Hash, chunk: Chunk) => void) => void;
        };
        globalHashPaths: {
            tap: () => void;
        };
        globalHash: {
            tap: () => void;
        };
        hotBootstrap: {
            tap: () => never;
        };
        /** @type {SyncWaterfallHook<[string, Chunk, string, ModuleTemplate, DependencyTemplates]>} */
        bootstrap: SyncWaterfallHook<[string, Chunk, string, ModuleTemplate, DependencyTemplates]>;
        /** @type {SyncWaterfallHook<[string, Chunk, string]>} */
        localVars: SyncWaterfallHook<[string, Chunk, string]>;
        /** @type {SyncWaterfallHook<[string, Chunk, string]>} */
        requireExtensions: SyncWaterfallHook<[string, Chunk, string]>;
        /** @type {SyncWaterfallHook<[string, Chunk, string, string]>} */
        requireEnsure: SyncWaterfallHook<[string, Chunk, string, string]>;
        readonly jsonpScript: SyncWaterfallHook<[string, Chunk], string, import("tapable").UnsetAdditionalOptions>;
        readonly linkPrefetch: SyncWaterfallHook<[string, Chunk], string, import("tapable").UnsetAdditionalOptions>;
        readonly linkPreload: SyncWaterfallHook<[string, Chunk], string, import("tapable").UnsetAdditionalOptions>;
    }>;
    renderCurrentHashCode: (hash: string, length?: number | undefined) => string;
    getPublicPath: (options: Compilation.PathData) => string;
    getAssetPath: (path: TemplatePath, options: Compilation.PathData) => string;
    getAssetPathWithInfo: (path: TemplatePath, options: Compilation.PathData) => Compilation.InterpolatedPathAndAssetInfo;
    get requireFn(): "__webpack_require__";
    get outputOptions(): OutputOptions;
}
declare namespace MainTemplate {
    export { IfSet };
}
import type { OutputNormalizedWithDefaults as OutputOptions } from "../config/defaults";
import type { Tap } from "tapable";
import type { RenderManifestEntry } from "./Template";
import type { RenderManifestOptions } from "./Template";
import JavascriptModulesPlugin = require("../javascript/JavascriptModulesPlugin");
import type { Source } from "webpack-sources";
import type Chunk from "../graph/Chunk";
import type ModuleTemplate from "./ModuleTemplate";
import type DependencyTemplates from "./DependencyTemplates";
import type Compilation from "../Compilation";
import type { TemplatePath } from "./TemplatedPathPlugin";
import type Hash from "../util/Hash";
import { SyncWaterfallHook } from "tapable";
/**
 * Defines the if set type used by this module.
 */
type IfSet<T> = import("tapable").IfSet<T>;
