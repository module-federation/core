export = EnvironmentNotSupportAsyncWarning;
/** @typedef {import("./Module")} Module */
/** @typedef {import("./RuntimeTemplate")} RuntimeTemplate */
/** @typedef {"asyncWebAssembly" | "topLevelAwait" | "external promise" | "external script" | "external import" | "external module"} Feature */
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
    export { Module, RuntimeTemplate, Feature };
}
import WebpackError = require("./WebpackError");
type Module = import("./Module");
type RuntimeTemplate = import("./RuntimeTemplate");
type Feature = "asyncWebAssembly" | "topLevelAwait" | "external promise" | "external script" | "external import" | "external module";
