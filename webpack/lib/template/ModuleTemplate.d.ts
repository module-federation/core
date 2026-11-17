export = ModuleTemplate;
/** @import { Tap } from "tapable" */
/** @import { Source } from "webpack-sources" */
/** @import Compilation from "../Compilation" */
/** @import DependencyTemplates from "./DependencyTemplates" */
/** @import Module from "../module/Module" */
/** @import RuntimeTemplate from "./RuntimeTemplate" */
/**
 * @import {
 * 	ChunkRenderContext,
 * 	ModuleRenderContext
 * } from "../javascript/JavascriptModulesPlugin"
 */
/** @import Hash from "../util/Hash" */
/**
 * Defines the if set type used by this module.
 * @template T
 * @typedef {import("tapable").IfSet<T>} IfSet
 */
declare class ModuleTemplate {
    /**
     * Creates an instance of ModuleTemplate.
     * @param {RuntimeTemplate} runtimeTemplate the runtime template
     * @param {Compilation} compilation the compilation
     */
    constructor(runtimeTemplate: RuntimeTemplate, compilation: Compilation);
    /** @type {RuntimeTemplate} */
    _runtimeTemplate: RuntimeTemplate;
    /** @type {string} */
    type: string;
    hooks: Readonly<{
        content: {
            tap: <AdditionalOptions>(options: string | (Tap & IfSet<AdditionalOptions>), fn: (source: Source, module: Module, moduleRenderContext: JavascriptModulesPlugin.ModuleRenderContext, dependencyTemplates: DependencyTemplates) => Source) => void;
        };
        module: {
            tap: <AdditionalOptions>(options: string | (Tap & IfSet<AdditionalOptions>), fn: (source: Source, module: Module, moduleRenderContext: JavascriptModulesPlugin.ModuleRenderContext, dependencyTemplates: DependencyTemplates) => Source) => void;
        };
        render: {
            tap: <AdditionalOptions>(options: string | (Tap & IfSet<AdditionalOptions>), fn: (source: Source, module: Module, chunkRenderContext: JavascriptModulesPlugin.ChunkRenderContext, dependencyTemplates: DependencyTemplates) => Source) => void;
        };
        package: {
            tap: <AdditionalOptions>(options: string | (Tap & IfSet<AdditionalOptions>), fn: (source: Source, module: Module, chunkRenderContext: JavascriptModulesPlugin.ChunkRenderContext, dependencyTemplates: DependencyTemplates) => Source) => void;
        };
        hash: {
            tap: <AdditionalOptions>(options: string | (Tap & IfSet<AdditionalOptions>), fn: (hash: Hash) => void) => void;
        };
    }>;
    get runtimeTemplate(): RuntimeTemplate;
}
declare namespace ModuleTemplate {
    export { IfSet };
}
import type RuntimeTemplate from "./RuntimeTemplate";
import type { Tap } from "tapable";
import type { Source } from "webpack-sources";
import type Module from "../module/Module";
import JavascriptModulesPlugin = require("../javascript/JavascriptModulesPlugin");
import type DependencyTemplates from "./DependencyTemplates";
import type Hash from "../util/Hash";
import type Compilation from "../Compilation";
/**
 * Defines the if set type used by this module.
 */
type IfSet<T> = import("tapable").IfSet<T>;
