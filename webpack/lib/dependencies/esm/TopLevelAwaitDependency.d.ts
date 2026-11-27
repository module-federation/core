export = TopLevelAwaitDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import Dependency from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/**
 * @import {
 * 	ObjectDeserializerContext,
 * 	ObjectSerializerContext
 * } from "../../serialization/ObjectMiddleware"
 */
/**
 * Marks a top-level `await` expression so it can be rewritten to `(yield …)`
 * when the module is lowered to a generator (target without `async`/`await`).
 */
declare class TopLevelAwaitDependency extends NullDependency {
    /**
     * @param {Range} range range of the whole `await` expression
     * @param {Range} argumentRange range of the awaited argument
     */
    constructor(range: Range, argumentRange: Range);
    /** @type {Range} */
    range: Range;
    /** @type {Range} */
    argumentRange: Range;
}
declare namespace TopLevelAwaitDependency {
    export { TopLevelAwaitDependencyTemplate as Template };
}
import NullDependency = require("../core/NullDependency");
import type { Range } from "../../javascript/JavascriptParser";
declare const TopLevelAwaitDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
    };
};
declare class TopLevelAwaitDependencyTemplate extends TopLevelAwaitDependencyTemplate_base {
}
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
