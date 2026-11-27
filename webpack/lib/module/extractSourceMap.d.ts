export = extractSourceMap;
/**
 * Extract source map from code content
 * @param {StringOrBuffer} stringOrBuffer The input code content as string or buffer
 * @param {string} resourcePath The path to the resource file
 * @param {ReadResource} readResource The read resource function
 * @returns {Promise<{ source: StringOrBuffer, sourceMap: string | RawSourceMap | undefined }>} Promise resolving to extracted source map information
 */
declare function extractSourceMap(stringOrBuffer: StringOrBuffer, resourcePath: string, readResource: ReadResource): Promise<{
    source: StringOrBuffer;
    sourceMap: string | RawSourceMap | undefined;
}>;
declare namespace extractSourceMap {
    export { getSourceMappingURL, StringOrBuffer, SourceMapExtractorFunction, ReadResource, SourceMappingURL };
}
import type { RawSourceMap } from "webpack-sources";
/**
 * Extract source mapping URL from code comments
 * @param {string} code source code content
 * @returns {SourceMappingURL} source mapping information
 */
declare function getSourceMappingURL(code: string): SourceMappingURL;
type StringOrBuffer = string | Buffer<ArrayBufferLike>;
type SourceMapExtractorFunction = (input: StringOrBuffer, resourcePath: string, fs: InputFileSystem) => Promise<{
    source: StringOrBuffer;
    sourceMap: string | RawSourceMap | undefined;
    fileDependencies: string[];
}>;
type ReadResource = (resourcePath: string) => Promise<StringOrBuffer>;
/**
 * Defines the source mapping url type used by this module.
 */
type SourceMappingURL = {
    sourceMappingURL: string;
    replacementString: string;
    replacementStart: number;
};
import type { InputFileSystem } from "../fs/fs";
