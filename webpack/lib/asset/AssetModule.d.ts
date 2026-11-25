export = AssetModule;
/** @import { AssetInfo } from "../Compilation" */
/** @import { BuildMeta } from "../module/Module" */
/**
 * @import {
 * 	NormalModuleBuildInfo,
 * 	NormalModuleCreateData
 * } from "../module/NormalModule"
 */
/**
 * Defines the build info properties specific to asset modules.
 * @typedef {object} KnownAssetModuleBuildInfo
 * @property {boolean=} dataUrl whether the asset is inlined as a data url
 * @property {string=} filename
 * @property {AssetInfo=} assetInfo
 * @property {string=} fullContentHash
 * @property {string=} assetResource the resource this asset is named after, when
 * something re-encoded it. Unlike `matchResource` this is serialized, so a
 * rename set while building survives the persistent cache
 */
/** @typedef {NormalModuleBuildInfo & KnownAssetModuleBuildInfo} AssetModuleBuildInfo */
/**
 * An asset module before or after its build, typed with its build info.
 * @typedef {NormalModule & { buildInfo?: AssetModuleBuildInfo }} AssetNormalModule
 */
/**
 * A built asset module, typed with its build info and build meta.
 * @typedef {NormalModule & { buildInfo: AssetModuleBuildInfo, buildMeta: BuildMeta }} BuiltAssetModule
 */
/**
 * Module class for all `asset/*` modules. Asset-specific properties should live here instead of `NormalModule`.
 */
declare class AssetModule extends NormalModule {
    /**
     * @param {NormalModuleCreateData} options options object
     * @param {boolean=} sideEffectFree whether asset modules are side-effect-free (`AssetModulesPluginOptions`)
     */
    constructor(options: NormalModule.NormalModuleCreateData, sideEffectFree?: boolean | undefined);
}
declare namespace AssetModule {
    export { KnownAssetModuleBuildInfo, AssetModuleBuildInfo, AssetNormalModule, BuiltAssetModule };
}
import NormalModule = require("../module/NormalModule");
/**
 * Defines the build info properties specific to asset modules.
 */
type KnownAssetModuleBuildInfo = {
    /**
     * whether the asset is inlined as a data url
     */
    dataUrl?: boolean | undefined;
    filename?: string | undefined;
    assetInfo?: AssetInfo | undefined;
    fullContentHash?: string | undefined;
    /**
     * the resource this asset is named after, when
     * something re-encoded it. Unlike `matchResource` this is serialized, so a
     * rename set while building survives the persistent cache
     */
    assetResource?: string | undefined;
};
type AssetModuleBuildInfo = NormalModule.NormalModuleBuildInfo & KnownAssetModuleBuildInfo;
/**
 * An asset module before or after its build, typed with its build info.
 */
type AssetNormalModule = NormalModule & {
    buildInfo?: AssetModuleBuildInfo;
};
/**
 * A built asset module, typed with its build info and build meta.
 */
type BuiltAssetModule = NormalModule & {
    buildInfo: AssetModuleBuildInfo;
    buildMeta: BuildMeta;
};
import type { AssetInfo } from "../Compilation";
import type { BuildMeta } from "../module/Module";
