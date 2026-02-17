export = OptionsApply;
/** @typedef {import("./config/defaults").WebpackOptionsNormalizedWithDefaults} WebpackOptions */
/** @typedef {import("./Compiler")} Compiler */
declare class OptionsApply {
    /**
     * @param {WebpackOptions} options options object
     * @param {Compiler} compiler compiler object
     * @returns {WebpackOptions} options object
     */
    process(options: WebpackOptions, compiler: Compiler): WebpackOptions;
}
declare namespace OptionsApply {
    export { WebpackOptions, Compiler };
}
type WebpackOptions = import("./config/defaults").WebpackOptionsNormalizedWithDefaults;
type Compiler = import("./Compiler");
