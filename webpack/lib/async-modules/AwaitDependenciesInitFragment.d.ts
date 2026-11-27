export = AwaitDependenciesInitFragment;
/** @import { Source } from "webpack-sources" */
/** @import { GenerateContext } from "../module/Generator" */
/** @typedef {Map<string, string>} Dependencies */
/**
 * Represents AwaitDependenciesInitFragment.
 * @extends {InitFragment<GenerateContext>}
 */
declare class AwaitDependenciesInitFragment extends InitFragment<GenerateContext> {
    /**
     * Creates an instance of AwaitDependenciesInitFragment.
     * @param {Dependencies} dependencies maps an import var to an async module that needs to be awaited
     * @param {boolean=} generatorLowered module is emitted as a generator, so use `yield` instead of `await`
     */
    constructor(dependencies: Dependencies, generatorLowered?: boolean | undefined);
    /** @type {Dependencies} */
    dependencies: Dependencies;
    /** @type {boolean} */
    generatorLowered: boolean;
    /**
     * Merges another await-dependencies fragment into this fragment.
     * @param {AwaitDependenciesInitFragment} other other AwaitDependenciesInitFragment
     * @returns {AwaitDependenciesInitFragment} AwaitDependenciesInitFragment
     */
    merge(other: AwaitDependenciesInitFragment): AwaitDependenciesInitFragment;
}
declare namespace AwaitDependenciesInitFragment {
    export { Dependencies };
}
import type { GenerateContext } from "../module/Generator";
import InitFragment = require("../template/InitFragment");
type Dependencies = Map<string, string>;
