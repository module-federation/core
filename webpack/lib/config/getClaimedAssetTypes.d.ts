declare namespace _exports {
    export { MinimizerOptions };
}
declare function _exports(compiler: Compiler): {
    css: boolean;
    html: boolean;
    json: boolean;
    xml: boolean;
};
export = _exports;
type MinimizerOptions = MatchObject & {
    minimizer?: import("minimizer-webpack-plugin").InternalPluginOptions<import("terser").MinifyOptions>["minimizer"];
};
import type Compiler from "../Compiler";
import type { MatchObject } from "../devtool/ModuleFilenameHelpers";
