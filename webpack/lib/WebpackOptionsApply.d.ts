export = WebpackOptionsApply;
declare class WebpackOptionsApply extends OptionsApply {
}
declare namespace WebpackOptionsApply {
    export { WebpackPluginFunction, WebpackOptions, Compiler, InputFileSystem, IntermediateFileSystem };
}
import OptionsApply = require("./OptionsApply");
type WebpackPluginFunction = import("../declarations/WebpackOptions").WebpackPluginFunction;
type WebpackOptions = import("./config/defaults").WebpackOptionsNormalizedWithDefaults;
type Compiler = import("./Compiler");
type InputFileSystem = import("./util/fs").InputFileSystem;
type IntermediateFileSystem = import("./util/fs").IntermediateFileSystem;
