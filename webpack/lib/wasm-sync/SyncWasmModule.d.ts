export = SyncWasmModule;
/** @import { BuildMeta } from "../module/Module" */
/**
 * @import {
 * 	NormalModuleBuildInfo,
 * 	NormalModuleCreateData
 * } from "../module/NormalModule"
 */
/**
 * Defines the build meta properties specific to sync wasm modules.
 * @typedef {object} KnownSyncWasmModuleBuildMeta
 * @property {Record<string, string>=} jsIncompatibleExports
 */
/** @typedef {BuildMeta & KnownSyncWasmModuleBuildMeta} SyncWasmModuleBuildMeta */
/**
 * A sync wasm module before or after its build, typed with its build meta.
 * @typedef {NormalModule & { buildMeta?: SyncWasmModuleBuildMeta }} SyncWasmNormalModule
 */
/**
 * A built sync wasm module, typed with its build info and build meta.
 * @typedef {NormalModule & { buildInfo: NormalModuleBuildInfo, buildMeta: SyncWasmModuleBuildMeta }} BuiltSyncWasmModule
 */
/**
 * Module class for `webassembly/sync` modules. Wasm-specific properties should live here instead of `NormalModule`.
 */
declare class SyncWasmModule extends NormalModule {
}
declare namespace SyncWasmModule {
    export { KnownSyncWasmModuleBuildMeta, SyncWasmModuleBuildMeta, SyncWasmNormalModule, BuiltSyncWasmModule };
}
import NormalModule = require("../module/NormalModule");
/**
 * Defines the build meta properties specific to sync wasm modules.
 */
type KnownSyncWasmModuleBuildMeta = {
    jsIncompatibleExports?: Record<string, string> | undefined;
};
type SyncWasmModuleBuildMeta = BuildMeta & KnownSyncWasmModuleBuildMeta;
/**
 * A sync wasm module before or after its build, typed with its build meta.
 */
type SyncWasmNormalModule = NormalModule & {
    buildMeta?: SyncWasmModuleBuildMeta;
};
/**
 * A built sync wasm module, typed with its build info and build meta.
 */
type BuiltSyncWasmModule = NormalModule & {
    buildInfo: NormalModule.NormalModuleBuildInfo;
    buildMeta: SyncWasmModuleBuildMeta;
};
import type { BuildMeta } from "../module/Module";
