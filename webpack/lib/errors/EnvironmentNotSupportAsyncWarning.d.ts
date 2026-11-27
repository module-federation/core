export = EnvironmentNotSupportAsyncWarning;
/** @import Module from "../module/Module" */
/** @import RuntimeTemplate from "../template/RuntimeTemplate" */
/** @typedef {"asyncWebAssembly" | "topLevelAwait" | "external promise" | "external script" | "external import" | "external module" | "external amd-async"} Feature */
declare class EnvironmentNotSupportAsyncWarning extends WebpackError {
    /**
     * Creates an instance of EnvironmentNotSupportAsyncWarning.
     * @param {Module} module module
     * @param {RuntimeTemplate} runtimeTemplate compilation
     * @param {Feature} feature feature
     */
    static check(module: Module, runtimeTemplate: RuntimeTemplate, feature: Feature): void;
    /**
     * Creates an instance of EnvironmentNotSupportAsyncWarning.
     * @param {Module} module module
     * @param {Feature} feature feature
     */
    constructor(module: Module, feature: Feature);
}
declare namespace EnvironmentNotSupportAsyncWarning {
    export { Feature };
}
import WebpackError = require("./WebpackError");
import type Module from "../module/Module";
import type RuntimeTemplate from "../template/RuntimeTemplate";
type Feature = "asyncWebAssembly" | "topLevelAwait" | "external promise" | "external script" | "external import" | "external module" | "external amd-async";
