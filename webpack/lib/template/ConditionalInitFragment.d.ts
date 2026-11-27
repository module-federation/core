export = ConditionalInitFragment;
/**
 * Represents ConditionalInitFragment.
 * @extends {InitFragment<GenerateContext>}
 */
declare class ConditionalInitFragment extends InitFragment<GenerateContext> {
    /**
     * Creates an instance of ConditionalInitFragment.
     * @param {string | Source | undefined} content the source code that will be included as initialization code
     * @param {number} stage category of initialization code (contribute to order)
     * @param {number} position position in the category (contribute to order)
     * @param {string | undefined} key unique key to avoid emitting the same initialization code twice
     * @param {RuntimeSpec | boolean} runtimeCondition in which runtime this fragment should be executed
     * @param {string | Source=} endContent the source code that will be included at the end of the module
     */
    constructor(content: string | Source | undefined, stage: number, position: number, key: string | undefined, runtimeCondition?: RuntimeSpec | boolean, endContent?: (string | Source) | undefined);
    runtimeCondition: boolean | RuntimeSpec;
    /**
     * Returns merged fragment.
     * @param {ConditionalInitFragment} other fragment to merge with
     * @returns {ConditionalInitFragment} merged fragment
     */
    merge(other: ConditionalInitFragment): ConditionalInitFragment;
}
import type { GenerateContext } from "../module/Generator";
import InitFragment = require("./InitFragment");
import type { RuntimeSpec } from "../util/runtime";
import type { Source } from "webpack-sources";
