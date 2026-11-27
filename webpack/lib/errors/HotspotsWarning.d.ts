export = HotspotsWarning;
/**
 * @typedef {object} HotspotDetails
 * @property {"loader" | "plugin"} kind what the name refers to
 * @property {string} name the loader or plugin, as it identified itself
 * @property {number} ms milliseconds it held the main thread
 * @property {number} runs how many times it ran
 */
/**
 * @typedef {object} HookDetails
 * @property {string} name the hook
 * @property {number} ms milliseconds its taps held the main thread
 */
declare class HotspotsWarning extends WebpackError {
    /**
     * Creates an instance of HotspotsWarning.
     * @param {HotspotDetails[]} hotspots the worst offenders, slowest first
     * @param {number} total how many are over the threshold in all
     * @param {HookDetails[]} hooks the same time grouped by hook instead
     */
    constructor(hotspots: HotspotDetails[], total: number, hooks: HookDetails[]);
}
declare namespace HotspotsWarning {
    export { HotspotDetails, HookDetails };
}
import WebpackError = require("./WebpackError");
type HotspotDetails = {
    /**
     * what the name refers to
     */
    kind: "loader" | "plugin";
    /**
     * the loader or plugin, as it identified itself
     */
    name: string;
    /**
     * milliseconds it held the main thread
     */
    ms: number;
    /**
     * how many times it ran
     */
    runs: number;
};
type HookDetails = {
    /**
     * the hook
     */
    name: string;
    /**
     * milliseconds its taps held the main thread
     */
    ms: number;
};
