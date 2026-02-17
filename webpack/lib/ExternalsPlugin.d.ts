export = ExternalsPlugin;
declare class ExternalsPlugin {
    /**
     * @param {ExternalsType} type default external type
     * @param {Externals} externals externals config
     */
    constructor(type: ExternalsType, externals: Externals);
    type: import("../declarations/WebpackOptions").ExternalsType;
    externals: import("../declarations/WebpackOptions").Externals;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ExternalsPlugin {
    export { ExternalsType, Externals, Compiler, Imported };
}
type ExternalsType = import("../declarations/WebpackOptions").ExternalsType;
type Externals = import("../declarations/WebpackOptions").Externals;
type Compiler = import("./Compiler");
type Imported = import("./ExternalModule").Imported;
