export = JavascriptModule;
/** @import { BuildMeta } from "../module/Module" */
/**
 * @import {
 * 	NormalModuleBuildInfo,
 * 	NormalModuleCreateData
 * } from "../module/NormalModule"
 */
/**
 * Defines the build info properties specific to javascript modules.
 * @typedef {object} KnownJavascriptModuleBuildInfo
 * @property {string=} moduleConcatenationBailout using in CommonJs
 * @property {string=} moduleConcatenationRootBailout what rules the module out as a concatenation root, while it may still be an inner module
 * @property {boolean=} needCreateRequire using in APIPlugin
 * @property {boolean=} usingPublicPathOverride module reassigns `__webpack_public_path__` at runtime, using in APIPlugin
 * @property {Set<string>=} pureFunctions names of locally declared functions known to be free of side effects
 * @property {boolean=} inlineExports whether this module was parsed with `optimization.inlineExports` enabled (gates inlining of its exports)
 * @property {boolean=} usesTopLevelUsingDeclaration module scope holds a `using`/`await using` declaration, so its resources must be disposed when the module finished evaluating
 */
/** @typedef {NormalModuleBuildInfo & KnownJavascriptModuleBuildInfo} JavascriptModuleBuildInfo */
/**
 * Defines the build meta properties specific to javascript modules.
 * @typedef {object} KnownJavascriptModuleBuildMeta
 * @property {boolean=} strictHarmonyModule
 * @property {boolean=} treatAsCommonJs
 */
/** @typedef {BuildMeta & KnownJavascriptModuleBuildMeta} JavascriptModuleBuildMeta */
/**
 * A javascript module before or after its build, typed with its build info and build meta.
 * @typedef {NormalModule & { buildInfo?: JavascriptModuleBuildInfo, buildMeta?: JavascriptModuleBuildMeta }} JavascriptNormalModule
 */
/**
 * A built javascript module, typed with its build info and build meta.
 * @typedef {NormalModule & { buildInfo: JavascriptModuleBuildInfo, buildMeta: JavascriptModuleBuildMeta }} BuiltJavascriptModule
 */
/**
 * Module class for all `javascript/*` modules. JavaScript-specific properties should live here instead of `NormalModule`.
 */
declare class JavascriptModule extends NormalModule {
}
declare namespace JavascriptModule {
    export { KnownJavascriptModuleBuildInfo, JavascriptModuleBuildInfo, KnownJavascriptModuleBuildMeta, JavascriptModuleBuildMeta, JavascriptNormalModule, BuiltJavascriptModule };
}
import NormalModule = require("../module/NormalModule");
/**
 * Defines the build info properties specific to javascript modules.
 */
type KnownJavascriptModuleBuildInfo = {
    /**
     * using in CommonJs
     */
    moduleConcatenationBailout?: string | undefined;
    /**
     * what rules the module out as a concatenation root, while it may still be an inner module
     */
    moduleConcatenationRootBailout?: string | undefined;
    /**
     * using in APIPlugin
     */
    needCreateRequire?: boolean | undefined;
    /**
     * module reassigns `__webpack_public_path__` at runtime, using in APIPlugin
     */
    usingPublicPathOverride?: boolean | undefined;
    /**
     * names of locally declared functions known to be free of side effects
     */
    pureFunctions?: Set<string> | undefined;
    /**
     * whether this module was parsed with `optimization.inlineExports` enabled (gates inlining of its exports)
     */
    inlineExports?: boolean | undefined;
    /**
     * module scope holds a `using`/`await using` declaration, so its resources must be disposed when the module finished evaluating
     */
    usesTopLevelUsingDeclaration?: boolean | undefined;
};
type JavascriptModuleBuildInfo = NormalModule.NormalModuleBuildInfo & KnownJavascriptModuleBuildInfo;
/**
 * Defines the build meta properties specific to javascript modules.
 */
type KnownJavascriptModuleBuildMeta = {
    strictHarmonyModule?: boolean | undefined;
    treatAsCommonJs?: boolean | undefined;
};
type JavascriptModuleBuildMeta = BuildMeta & KnownJavascriptModuleBuildMeta;
/**
 * A javascript module before or after its build, typed with its build info and build meta.
 */
type JavascriptNormalModule = NormalModule & {
    buildInfo?: JavascriptModuleBuildInfo;
    buildMeta?: JavascriptModuleBuildMeta;
};
/**
 * A built javascript module, typed with its build info and build meta.
 */
type BuiltJavascriptModule = NormalModule & {
    buildInfo: JavascriptModuleBuildInfo;
    buildMeta: JavascriptModuleBuildMeta;
};
import type { BuildMeta } from "../module/Module";
