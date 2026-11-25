export = HtmlModule;
/**
 * @import {
 * 	NormalModuleBuildInfo,
 * 	NormalModuleCreateData
 * } from "../module/NormalModule"
 */
/** @import { HtmlEntryInfo } from "./HtmlModulesPlugin" */
/** @import { BuildMeta, ModuleKinds } from "../module/Module" */
/**
 * Defines the build info properties specific to html modules.
 * @typedef {object} KnownHtmlModuleBuildInfo
 * @property {Record<string, HtmlEntryInfo[]>=} htmlEntries entries collected from the document, grouped by kind
 * @property {string=} baseUrlPrefix `../` per `<base href>` path segment, prepended to the auto-public-path undo path so a relative base doesn't misdirect bundled URLs
 */
/** @typedef {NormalModuleBuildInfo & KnownHtmlModuleBuildInfo} HtmlModuleBuildInfo */
/**
 * An html module before or after its build, typed with its build info.
 * @typedef {NormalModule & { buildInfo?: HtmlModuleBuildInfo }} HtmlNormalModule
 */
/**
 * A built html module, typed with its build info and build meta.
 * @typedef {NormalModule & { buildInfo: HtmlModuleBuildInfo, buildMeta: BuildMeta }} BuiltHtmlModule
 */
/**
 * Module class for `html` modules. HTML-specific properties should live here instead of `NormalModule`.
 */
declare class HtmlModule extends NormalModule {
}
declare namespace HtmlModule {
    export { KINDS, KnownHtmlModuleBuildInfo, HtmlModuleBuildInfo, HtmlNormalModule, BuiltHtmlModule };
}
import NormalModule = require("../module/NormalModule");
declare var KINDS: Set<keyof ModuleKinds>;
/**
 * Defines the build info properties specific to html modules.
 */
type KnownHtmlModuleBuildInfo = {
    /**
     * entries collected from the document, grouped by kind
     */
    htmlEntries?: Record<string, HtmlEntryInfo[]> | undefined;
    /**
     * `../` per `<base href>` path segment, prepended to the auto-public-path undo path so a relative base doesn't misdirect bundled URLs
     */
    baseUrlPrefix?: string | undefined;
};
type HtmlModuleBuildInfo = NormalModule.NormalModuleBuildInfo & KnownHtmlModuleBuildInfo;
/**
 * An html module before or after its build, typed with its build info.
 */
type HtmlNormalModule = NormalModule & {
    buildInfo?: HtmlModuleBuildInfo;
};
/**
 * A built html module, typed with its build info and build meta.
 */
type BuiltHtmlModule = NormalModule & {
    buildInfo: HtmlModuleBuildInfo;
    buildMeta: BuildMeta;
};
import type { ModuleKinds } from "../module/Module";
import type { HtmlEntryInfo } from "./HtmlModulesPlugin";
import type { BuildMeta } from "../module/Module";
