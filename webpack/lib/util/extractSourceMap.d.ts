export = extractSourceMap;
/**
 * Extract source map from code content
 * @param {string | Buffer<ArrayBufferLike>} stringOrBuffer The input code content as string or buffer
 * @param {string} resourcePath The path to the resource file
 * @param {ReadResource} readResource The read resource function
 * @returns {Promise<{source: string | Buffer<ArrayBufferLike>, sourceMap: string | RawSourceMap | undefined}>} Promise resolving to extracted source map information
 */
declare function extractSourceMap(
  stringOrBuffer: string | Buffer<ArrayBufferLike>,
  resourcePath: string,
  readResource: ReadResource,
): Promise<{
  source: string | Buffer<ArrayBufferLike>;
  sourceMap: string | RawSourceMap | undefined;
}>;
declare namespace extractSourceMap {
  export {
    getSourceMappingURL,
    InputFileSystem,
    SourceMapExtractorFunction,
    RawSourceMap,
    ReadResource,
    SourceMappingURL,
  };
}
/**
 * Extract source mapping URL from code comments
 * @param {string} code source code content
 * @returns {SourceMappingURL} source mapping information
 */
declare function getSourceMappingURL(code: string): SourceMappingURL;
type InputFileSystem = import('./fs').InputFileSystem;
type SourceMapExtractorFunction = (
  input: string | Buffer<ArrayBufferLike>,
  resourcePath: string,
  fs: InputFileSystem,
) => Promise<{
  source: string | Buffer<ArrayBufferLike>;
  sourceMap: string | RawSourceMap | undefined;
  fileDependencies: string[];
}>;
type RawSourceMap = import('webpack-sources').RawSourceMap;
type ReadResource = (
  resourcePath: string,
) => Promise<string | Buffer<ArrayBufferLike>>;
type SourceMappingURL = {
  sourceMappingURL: string;
  replacementString: string;
};
