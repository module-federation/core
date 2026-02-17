export = processExportInfo;
/** @typedef {import("../Dependency").RawReferencedExports} RawReferencedExports */
/** @typedef {import("../ExportsInfo").ExportInfo} ExportInfo */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
/**
 * @param {RuntimeSpec} runtime the runtime
 * @param {RawReferencedExports} referencedExports list of referenced exports, will be added to
 * @param {string[]} prefix export prefix
 * @param {ExportInfo=} exportInfo the export info
 * @param {boolean} defaultPointsToSelf when true, using default will reference itself
 * @param {Set<ExportInfo>} alreadyVisited already visited export info (to handle circular reexports)
 */
declare function processExportInfo(
  runtime: RuntimeSpec,
  referencedExports: RawReferencedExports,
  prefix: string[],
  exportInfo?: ExportInfo | undefined,
  defaultPointsToSelf?: boolean,
  alreadyVisited?: Set<ExportInfo>,
): void;
declare namespace processExportInfo {
  export { RawReferencedExports, ExportInfo, RuntimeSpec };
}
type RawReferencedExports = import('../Dependency').RawReferencedExports;
type ExportInfo = import('../ExportsInfo').ExportInfo;
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
