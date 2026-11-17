export = MissingSideEffectsWarning;
declare const MissingSideEffectsWarning_base: typeof import("./WebpackError");
/** @typedef {{ name: string, modules: number, size: number }} MissingSideEffectsDetails */
declare class MissingSideEffectsWarning extends MissingSideEffectsWarning_base {
    /**
     * Creates an instance of MissingSideEffectsWarning.
     * @param {MissingSideEffectsDetails[]} packages the packages to name, costliest first
     * @param {number} total how many packages were found
     * @param {number} wasted the bytes they keep in the bundle
     */
    constructor(packages: MissingSideEffectsDetails[], total: number, wasted: number);
}
declare namespace MissingSideEffectsWarning {
    export { MissingSideEffectsDetails };
}
type MissingSideEffectsDetails = {
    name: string;
    modules: number;
    size: number;
};
