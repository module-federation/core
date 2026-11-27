export = processExportInfo;
/** @import { RawReferencedExports } from "../../graph/Dependency" */
/** @import { ExportInfo } from "../../graph/ExportsInfo" */
/** @import { RuntimeSpec } from "../../util/runtime" */
/**
 * Process export info.
 * @param {RuntimeSpec} runtime the runtime
 * @param {RawReferencedExports} referencedExports list of referenced exports, will be added to
 * @param {string[]} prefix export prefix
 * @param {InstanceType<ExportInfo>=} exportInfo the export info
 * @param {boolean} defaultPointsToSelf when true, using default will reference itself
 * @param {Set<InstanceType<ExportInfo>>=} alreadyVisited already visited export info (to handle circular reexports)
 */
declare function processExportInfo(runtime: RuntimeSpec, referencedExports: RawReferencedExports, prefix: string[], exportInfo?: {
    name: import("../../graph/Dependency").ExportInfoName;
    _usedName: import("../../graph/ExportsInfo").ExportInfoUsedName;
    _globalUsed: import("../../graph/ExportsInfo").UsageStateType | undefined;
    _usedInRuntime: import("../../graph/ExportsInfo").UsedInRuntime | undefined;
    _hasUseInRuntimeInfo: boolean;
    provided: import("../../graph/ExportsInfo").ExportInfoProvided | undefined;
    terminalBinding: boolean;
    canMangleProvide: boolean | undefined;
    _inlinedValue: import("../../optimize/InlineExports").InlinedValue | undefined;
    canMangleUse: boolean | undefined;
    _inlineFlags: number;
    exportsInfoOwned: boolean;
    exportsInfo: import("../../graph/ExportsInfo") | undefined;
    _target: import("../../graph/ExportsInfo").Target | undefined;
    _maxTarget: import("../../graph/ExportsInfo").Target | undefined;
    get canInlineProvide(): import("../../optimize/InlineExports").InlinedValue | undefined;
    set canInlineProvide(value: import("../../optimize/InlineExports").InlinedValue | undefined);
    get canInlineUse(): boolean | undefined;
    set canInlineUse(value: boolean | undefined);
    get pureProvide(): boolean | undefined;
    set pureProvide(value: boolean | undefined);
    get canMangle(): boolean;
    canInline(): import("../../optimize/InlineExports").InlinedValue | undefined;
    setUsedInUnknownWay(runtime: RuntimeSpec): boolean;
    setUsedWithoutInfo(runtime: RuntimeSpec): boolean;
    setHasProvideInfo(): void;
    _resetProvideInfo(): void;
    _resetUseInfo(): void;
    setHasUseInfo(): void;
    setUsedConditionally(condition: (condition: UsageStateType) => boolean, newValue: UsageStateType, runtime: RuntimeSpec): boolean;
    setUsed(newValue: UsageStateType, runtime: RuntimeSpec): boolean;
    unsetTarget(key: import("../../graph/Dependency")): boolean;
    setTarget(key: import("../../graph/Dependency"), connection: import("../../graph/ModuleGraphConnection"), exportName?: (import("../../graph/Dependency").ExportInfoName[] | null) | undefined, priority?: number | undefined): boolean;
    getUsed(runtime: RuntimeSpec): UsageStateType;
    getUsedName(fallbackName: string | undefined, runtime: RuntimeSpec): string | import("../../optimize/InlineExports").InlinedUsedName | false;
    hasUsedName(): boolean;
    setUsedName(name: string | import("../../optimize/InlineExports").InlinedUsedName): void;
    getTerminalBinding(moduleGraph: import("../../graph/ModuleGraph"), resolveTargetFilter?: ResolveTargetFilter): /*elided*/ any | ExportsInfo | undefined;
    isReexport(): boolean;
    _getMaxTarget(): import("../../graph/ExportsInfo").Target;
    findTarget(moduleGraph: import("../../graph/ModuleGraph"), validTargetModuleFilter: ValidTargetModuleFilter): FoundTargetItem | null | undefined | false;
    _findTarget(moduleGraph: import("../../graph/ModuleGraph"), validTargetModuleFilter: ValidTargetModuleFilter, alreadyVisited: AlreadyVisitedExportInfo): FoundTargetItem | null | undefined | false;
    getTarget(moduleGraph: import("../../graph/ModuleGraph"), resolveTargetFilter?: ResolveTargetFilter): TargetItemWithConnection | undefined;
    hasCircularTarget(moduleGraph: import("../../graph/ModuleGraph")): boolean;
    _getTarget(moduleGraph: import("../../graph/ModuleGraph"), resolveTargetFilter: ResolveTargetFilter, alreadyVisited: AlreadyVisitedExportInfo | undefined): import("../../graph/ExportsInfo").TargetItemWithConnection | unique symbol;
    moveTarget(moduleGraph: import("../../graph/ModuleGraph"), resolveTargetFilter: ResolveTargetFilter, updateOriginalConnection?: ((target: TargetItemWithConnection) => import("../../graph/ModuleGraphConnection") | undefined) | undefined): TargetItemWithConnection | undefined;
    createNestedExportsInfo(): ExportsInfo;
    getNestedExportsInfo(): import("../../graph/ExportsInfo");
    hasInfo(baseInfo: /*elided*/ any, runtime: RuntimeSpec): boolean;
    updateHash(hash: import("../../util/Hash"), runtime: RuntimeSpec): void;
    _updateHash(hash: import("../../util/Hash"), runtime: RuntimeSpec, alreadyVisitedExportsInfo: Set<ExportsInfo>): void;
    getUsedInfo(): string;
    getProvidedInfo(): "no provided info" | "maybe provided (runtime-defined)" | "provided" | "not provided";
    getRenameInfo(): string;
}, defaultPointsToSelf?: boolean, alreadyVisited?: Set<{
    name: import("../../graph/Dependency").ExportInfoName;
    _usedName: import("../../graph/ExportsInfo").ExportInfoUsedName;
    _globalUsed: import("../../graph/ExportsInfo").UsageStateType | undefined;
    _usedInRuntime: import("../../graph/ExportsInfo").UsedInRuntime | undefined;
    _hasUseInRuntimeInfo: boolean;
    provided: import("../../graph/ExportsInfo").ExportInfoProvided | undefined;
    terminalBinding: boolean;
    canMangleProvide: boolean | undefined;
    _inlinedValue: import("../../optimize/InlineExports").InlinedValue | undefined;
    canMangleUse: boolean | undefined;
    _inlineFlags: number;
    exportsInfoOwned: boolean;
    exportsInfo: import("../../graph/ExportsInfo") | undefined;
    _target: import("../../graph/ExportsInfo").Target | undefined;
    _maxTarget: import("../../graph/ExportsInfo").Target | undefined;
    get canInlineProvide(): import("../../optimize/InlineExports").InlinedValue | undefined;
    set canInlineProvide(value: import("../../optimize/InlineExports").InlinedValue | undefined);
    get canInlineUse(): boolean | undefined;
    set canInlineUse(value: boolean | undefined);
    get pureProvide(): boolean | undefined;
    set pureProvide(value: boolean | undefined);
    get canMangle(): boolean;
    canInline(): import("../../optimize/InlineExports").InlinedValue | undefined;
    setUsedInUnknownWay(runtime: RuntimeSpec): boolean;
    setUsedWithoutInfo(runtime: RuntimeSpec): boolean;
    setHasProvideInfo(): void;
    _resetProvideInfo(): void;
    _resetUseInfo(): void;
    setHasUseInfo(): void;
    setUsedConditionally(condition: (condition: UsageStateType) => boolean, newValue: UsageStateType, runtime: RuntimeSpec): boolean;
    setUsed(newValue: UsageStateType, runtime: RuntimeSpec): boolean;
    unsetTarget(key: import("../../graph/Dependency")): boolean;
    setTarget(key: import("../../graph/Dependency"), connection: import("../../graph/ModuleGraphConnection"), exportName?: (import("../../graph/Dependency").ExportInfoName[] | null) | undefined, priority?: number | undefined): boolean;
    getUsed(runtime: RuntimeSpec): UsageStateType;
    getUsedName(fallbackName: string | undefined, runtime: RuntimeSpec): string | import("../../optimize/InlineExports").InlinedUsedName | false;
    hasUsedName(): boolean;
    setUsedName(name: string | import("../../optimize/InlineExports").InlinedUsedName): void;
    getTerminalBinding(moduleGraph: import("../../graph/ModuleGraph"), resolveTargetFilter?: ResolveTargetFilter): /*elided*/ any | ExportsInfo | undefined;
    isReexport(): boolean;
    _getMaxTarget(): import("../../graph/ExportsInfo").Target;
    findTarget(moduleGraph: import("../../graph/ModuleGraph"), validTargetModuleFilter: ValidTargetModuleFilter): FoundTargetItem | null | undefined | false;
    _findTarget(moduleGraph: import("../../graph/ModuleGraph"), validTargetModuleFilter: ValidTargetModuleFilter, alreadyVisited: AlreadyVisitedExportInfo): FoundTargetItem | null | undefined | false;
    getTarget(moduleGraph: import("../../graph/ModuleGraph"), resolveTargetFilter?: ResolveTargetFilter): TargetItemWithConnection | undefined;
    hasCircularTarget(moduleGraph: import("../../graph/ModuleGraph")): boolean;
    _getTarget(moduleGraph: import("../../graph/ModuleGraph"), resolveTargetFilter: ResolveTargetFilter, alreadyVisited: AlreadyVisitedExportInfo | undefined): import("../../graph/ExportsInfo").TargetItemWithConnection | unique symbol;
    moveTarget(moduleGraph: import("../../graph/ModuleGraph"), resolveTargetFilter: ResolveTargetFilter, updateOriginalConnection?: ((target: TargetItemWithConnection) => import("../../graph/ModuleGraphConnection") | undefined) | undefined): TargetItemWithConnection | undefined;
    createNestedExportsInfo(): ExportsInfo;
    getNestedExportsInfo(): import("../../graph/ExportsInfo");
    hasInfo(baseInfo: /*elided*/ any, runtime: RuntimeSpec): boolean;
    updateHash(hash: import("../../util/Hash"), runtime: RuntimeSpec): void;
    _updateHash(hash: import("../../util/Hash"), runtime: RuntimeSpec, alreadyVisitedExportsInfo: Set<ExportsInfo>): void;
    getUsedInfo(): string;
    getProvidedInfo(): "no provided info" | "maybe provided (runtime-defined)" | "provided" | "not provided";
    getRenameInfo(): string;
}>): void;
import type { RuntimeSpec } from "../../util/runtime";
import type { RawReferencedExports } from "../../graph/Dependency";
