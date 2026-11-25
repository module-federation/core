export = DynamicExportsWarning;
declare const DynamicExportsWarning_base: typeof import("./WebpackError");
/** @typedef {{ name: string, size: number }} DynamicExportsDetails */
declare class DynamicExportsWarning extends DynamicExportsWarning_base {
    /**
     * Creates an instance of DynamicExportsWarning.
     * @param {DynamicExportsDetails[]} modules the modules to name, largest first
     * @param {number} total how many were found
     */
    constructor(modules: DynamicExportsDetails[], total: number);
}
declare namespace DynamicExportsWarning {
    export { DynamicExportsDetails };
}
type DynamicExportsDetails = {
    name: string;
    size: number;
};
