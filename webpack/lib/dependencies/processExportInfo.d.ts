export = processExportInfo;
/** @typedef {import("../ExportsInfo").ExportInfo} ExportInfo */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
/**
 * @param {RuntimeSpec} runtime the runtime
 * @param {string[][]} referencedExports list of referenced exports, will be added to
 * @param {string[]} prefix export prefix
 * @param {ExportInfo=} exportInfo the export info
 * @param {boolean} defaultPointsToSelf when true, using default will reference itself
 * @param {Set<ExportInfo>} alreadyVisited already visited export info (to handle circular reexports)
 */
declare function processExportInfo(
  runtime: RuntimeSpec,
  referencedExports: string[][],
  prefix: string[],
  exportInfo?: ExportInfo | undefined,
  defaultPointsToSelf?: boolean,
  alreadyVisited?: Set<ExportInfo>,
): void;
declare namespace processExportInfo {
  export { ExportInfo, RuntimeSpec };
}
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
type ExportInfo = import('../ExportsInfo').ExportInfo;
