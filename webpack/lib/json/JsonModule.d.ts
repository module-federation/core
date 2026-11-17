export = JsonModule;
/**
 * @import {
 * 	NormalModuleBuildInfo,
 * 	NormalModuleCreateData
 * } from "../module/NormalModule"
 */
/** @import JsonData from "./JsonData" */
/** @import { BuildMeta } from "../module/Module" */
/**
 * Defines the build info properties specific to json modules.
 * @typedef {object} KnownJsonModuleBuildInfo
 * @property {JsonData=} jsonData
 */
/** @typedef {NormalModuleBuildInfo & KnownJsonModuleBuildInfo} JsonModuleBuildInfo */
/**
 * A json module before or after its build, typed with its build info.
 * @typedef {NormalModule & { buildInfo?: JsonModuleBuildInfo }} JsonNormalModule
 */
/**
 * A built json module, typed with its build info and build meta.
 * @typedef {NormalModule & { buildInfo: JsonModuleBuildInfo, buildMeta: BuildMeta }} BuiltJsonModule
 */
/**
 * Module class for `json` modules. JSON-specific properties should live here instead of `NormalModule`.
 */
declare class JsonModule extends NormalModule {
}
declare namespace JsonModule {
    export { KnownJsonModuleBuildInfo, JsonModuleBuildInfo, JsonNormalModule, BuiltJsonModule };
}
import NormalModule = require("../module/NormalModule");
/**
 * Defines the build info properties specific to json modules.
 */
type KnownJsonModuleBuildInfo = {
    jsonData?: JsonData | undefined;
};
type JsonModuleBuildInfo = NormalModule.NormalModuleBuildInfo & KnownJsonModuleBuildInfo;
/**
 * A json module before or after its build, typed with its build info.
 */
type JsonNormalModule = NormalModule & {
    buildInfo?: JsonModuleBuildInfo;
};
/**
 * A built json module, typed with its build info and build meta.
 */
type BuiltJsonModule = NormalModule & {
    buildInfo: JsonModuleBuildInfo;
    buildMeta: BuildMeta;
};
import type JsonData from "./JsonData";
import type { BuildMeta } from "../module/Module";
