export = JsonGenerator;
declare class JsonGenerator extends Generator {
    /**
     * @param {JsonGeneratorOptions} options options
     */
    constructor(options: JsonGeneratorOptions);
    options: import("../../declarations/WebpackOptions").JsonGeneratorOptions;
    /**
     * @param {Error} error the error
     * @param {NormalModule} module module for which the code should be generated
     * @param {GenerateContext} generateContext context for generate
     * @returns {Source | null} generated code
     */
    generateError(error: Error, module: NormalModule, generateContext: GenerateContext): Source | null;
}
declare namespace JsonGenerator {
    export { Source, JsonGeneratorOptions, ExportsInfo, GenerateContext, ConcatenationBailoutReasonContext, SourceType, SourceTypes, NormalModule, RuntimeSpec, JsonArray, JsonObject, JsonValue };
}
import Generator = require("../Generator");
type Source = import("webpack-sources").Source;
type JsonGeneratorOptions = import("../../declarations/WebpackOptions").JsonGeneratorOptions;
type ExportsInfo = import("../ExportsInfo");
type GenerateContext = import("../Generator").GenerateContext;
type ConcatenationBailoutReasonContext = import("../Module").ConcatenationBailoutReasonContext;
type SourceType = import("../Module").SourceType;
type SourceTypes = import("../Module").SourceTypes;
type NormalModule = import("../NormalModule");
type RuntimeSpec = import("../util/runtime").RuntimeSpec;
type JsonArray = import("../util/fs").JsonArray;
type JsonObject = import("../util/fs").JsonObject;
type JsonValue = import("../util/fs").JsonValue;
