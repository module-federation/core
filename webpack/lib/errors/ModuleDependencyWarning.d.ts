export = ModuleDependencyWarning;
/** @import { DependencyLocation } from "../graph/Dependency" */
/** @import Module from "../module/Module" */
/** @import { ErrorWithHideStack } from "./ModuleBuildError" */
declare class ModuleDependencyWarning extends WebpackError {
    /**
     * Creates an instance of ModuleDependencyWarning.
     * @param {Module} module module tied to dependency
     * @param {ErrorWithHideStack} err error thrown
     * @param {DependencyLocation} loc location of dependency
     */
    constructor(module: Module, err: ErrorWithHideStack, loc: DependencyLocation);
    /**
     * error is not (de)serialized, so it might be undefined after deserialization
     * @type {ErrorWithHideStack}
     */
    error: ErrorWithHideStack;
}
import WebpackError = require("./WebpackError");
import type { ErrorWithHideStack } from "./ModuleBuildError";
import type Module from "../module/Module";
import type { DependencyLocation } from "../graph/Dependency";
