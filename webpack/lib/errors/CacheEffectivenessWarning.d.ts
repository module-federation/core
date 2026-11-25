export = CacheEffectivenessWarning;
/**
 * @typedef {object} CacheEffectiveness
 * @property {number} total how many modules the compilation holds
 * @property {number} rebuilt how many of them were built rather than reused
 * @property {number} uncacheable how many can never be reused
 * @property {string[]} reasons why they cannot, most frequent first
 */
declare class CacheEffectivenessWarning extends WebpackError {
    /**
     * Creates an instance of CacheEffectivenessWarning.
     * @param {CacheEffectiveness} effectiveness what the compilation reused
     */
    constructor({ total, rebuilt, uncacheable, reasons }: CacheEffectiveness);
}
declare namespace CacheEffectivenessWarning {
    export { CacheEffectiveness };
}
import WebpackError = require("./WebpackError");
type CacheEffectiveness = {
    /**
     * how many modules the compilation holds
     */
    total: number;
    /**
     * how many of them were built rather than reused
     */
    rebuilt: number;
    /**
     * how many can never be reused
     */
    uncacheable: number;
    /**
     * why they cannot, most frequent first
     */
    reasons: string[];
};
