export = ScopeHoistingBailoutsWarning;
declare const ScopeHoistingBailoutsWarning_base: typeof import("./WebpackError");
declare class ScopeHoistingBailoutsWarning extends ScopeHoistingBailoutsWarning_base {
    /**
     * Creates an instance of ScopeHoistingBailoutsWarning.
     * @param {ScopeHoistingBailoutGroup[]} groups the reasons, most modules first
     * @param {number} total how many modules were left out
     */
    constructor(groups: ScopeHoistingBailoutGroup[], total: number);
}
declare namespace ScopeHoistingBailoutsWarning {
    export { ScopeHoistingBailoutGroup };
}
type ScopeHoistingBailoutGroup = {
    reason: string;
    count: number;
    names: string[];
};
