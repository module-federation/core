export = CssModule;
/** @import { CssData } from "../template/DependencyTemplate" */
/** @import Module, { BuildMeta, ModuleKinds } from "../module/Module" */
/**
 * @import {
 * 	NormalModuleBuildInfo,
 * 	NormalModuleCreateData
 * } from "../module/NormalModule"
 */
/** @import RequestShortener from "../util/RequestShortener" */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[CssLayer, Supports, Media, Inheritance | undefined, CssParserExportType | undefined]>} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext<[CssLayer, Supports, Media, Inheritance | undefined, CssParserExportType | undefined]>} ObjectSerializerContext */
/** @import { CssParserExportType } from "../../declarations/WebpackOptions" */
/** @typedef {string | undefined} CssLayer */
/** @typedef {string | undefined} Supports */
/** @typedef {string | undefined} Media */
/** @typedef {[CssLayer, Supports, Media]} InheritanceItem */
/** @typedef {InheritanceItem[]} Inheritance */
/** @typedef {NormalModuleCreateData & { cssLayer: CssLayer, supports: Supports, media: Media, inheritance?: Inheritance, exportType?: CssParserExportType }} CssModuleCreateData */
/**
 * Defines the build info properties specific to css modules.
 * @typedef {object} KnownCssModuleBuildInfo
 * @property {CssData=} cssData
 * @property {string=} charset charset at-rule
 */
/** @typedef {NormalModuleBuildInfo & KnownCssModuleBuildInfo} CssModuleBuildInfo */
/**
 * Defines the build meta properties specific to css modules.
 * @typedef {object} KnownCssModuleBuildMeta
 * @property {boolean=} isCssModule
 * @property {boolean=} needIdInConcatenation
 */
/** @typedef {BuildMeta & KnownCssModuleBuildMeta} CssModuleBuildMeta */
/**
 * A css module before or after its build, typed with its build info and build meta.
 * @typedef {NormalModule & { buildInfo?: CssModuleBuildInfo, buildMeta?: CssModuleBuildMeta }} CssNormalModule
 */
/**
 * A built css module, typed with its build info and build meta.
 * @typedef {NormalModule & { buildInfo: CssModuleBuildInfo, buildMeta: CssModuleBuildMeta }} BuiltCssModule
 */
declare class CssModule extends NormalModule {
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     * @returns {CssModule} the deserialized object
     */
    static deserialize(context: ObjectDeserializerContext): CssModule;
    /**
     * Creates an instance of CssModule.
     * @param {CssModuleCreateData} options options object
     */
    constructor(options: CssModuleCreateData);
    /** @type {CssModuleCreateData['cssLayer']} */
    cssLayer: CssModuleCreateData["cssLayer"];
    /** @type {CssModuleCreateData['supports']} */
    supports: CssModuleCreateData["supports"];
    /** @type {CssModuleCreateData['media']} */
    media: CssModuleCreateData["media"];
    /** @type {CssModuleCreateData['inheritance']} */
    inheritance: CssModuleCreateData["inheritance"];
    /** @type {CssModuleCreateData['exportType']} */
    exportType: CssModuleCreateData["exportType"];
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
declare namespace CssModule {
    export { KINDS, ObjectDeserializerContext, ObjectSerializerContext, CssLayer, Supports, Media, InheritanceItem, Inheritance, CssModuleCreateData, KnownCssModuleBuildInfo, CssModuleBuildInfo, KnownCssModuleBuildMeta, CssModuleBuildMeta, CssNormalModule, BuiltCssModule };
}
import NormalModule = require("../module/NormalModule");
declare var KINDS: Set<keyof Module.ModuleKinds>;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[CssLayer, Supports, Media, Inheritance | undefined, CssParserExportType | undefined]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[CssLayer, Supports, Media, Inheritance | undefined, CssParserExportType | undefined]>;
type CssLayer = string | undefined;
type Supports = string | undefined;
type Media = string | undefined;
type InheritanceItem = [CssLayer, Supports, Media];
type Inheritance = InheritanceItem[];
type CssModuleCreateData = NormalModule.NormalModuleCreateData & {
    cssLayer: CssLayer;
    supports: Supports;
    media: Media;
    inheritance?: Inheritance;
    exportType?: CssParserExportType;
};
/**
 * Defines the build info properties specific to css modules.
 */
type KnownCssModuleBuildInfo = {
    cssData?: CssData | undefined;
    /**
     * charset at-rule
     */
    charset?: string | undefined;
};
type CssModuleBuildInfo = NormalModule.NormalModuleBuildInfo & KnownCssModuleBuildInfo;
/**
 * Defines the build meta properties specific to css modules.
 */
type KnownCssModuleBuildMeta = {
    isCssModule?: boolean | undefined;
    needIdInConcatenation?: boolean | undefined;
};
type CssModuleBuildMeta = Module.BuildMeta & KnownCssModuleBuildMeta;
/**
 * A css module before or after its build, typed with its build info and build meta.
 */
type CssNormalModule = NormalModule & {
    buildInfo?: CssModuleBuildInfo;
    buildMeta?: CssModuleBuildMeta;
};
/**
 * A built css module, typed with its build info and build meta.
 */
type BuiltCssModule = NormalModule & {
    buildInfo: CssModuleBuildInfo;
    buildMeta: CssModuleBuildMeta;
};
import type Module from "../module/Module";
import type { CssParserExportType } from "../../declarations/WebpackOptions";
import type { CssData } from "../template/DependencyTemplate";
