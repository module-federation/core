export = AMDPlugin;
/** @typedef {Exclude<Amd, false>} AmdOptions */
declare class AMDPlugin {
    /**
     * @param {AmdOptions} amdOptions the AMD options
     */
    constructor(amdOptions: AmdOptions);
    amdOptions: {
        [k: string]: any;
    };
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace AMDPlugin {
    export { Amd, JavascriptParserOptions, Compiler, DependencyLocation, Parser, Range, GetMembers, AmdOptions };
}
type Amd = import("../../declarations/WebpackOptions").Amd;
type JavascriptParserOptions = import("../../declarations/WebpackOptions").JavascriptParserOptions;
type Compiler = import("../Compiler");
type DependencyLocation = import("../Dependency").DependencyLocation;
type Parser = import("../javascript/JavascriptParser");
type Range = import("../javascript/JavascriptParser").Range;
type GetMembers = import("../javascript/BasicEvaluatedExpression").GetMembers;
type AmdOptions = Exclude<Amd, false>;
