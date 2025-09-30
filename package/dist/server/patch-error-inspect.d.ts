import { type SourceMapPayload } from 'module';
type FindSourceMapPayload = (sourceURL: string) => ModernSourceMapPayload | undefined;
export declare function setBundlerFindSourceMapImplementation(findSourceMapImplementation: FindSourceMapPayload): void;
/**
 * https://tc39.es/source-map/#index-map
 */
interface IndexSourceMapSection {
    offset: {
        line: number;
        column: number;
    };
    map: ModernRawSourceMap;
}
interface IndexSourceMap {
    version: number;
    file: string;
    sections: IndexSourceMapSection[];
}
interface ModernRawSourceMap extends SourceMapPayload {
    ignoreList?: number[];
}
export type ModernSourceMapPayload = ModernRawSourceMap | IndexSourceMap;
export declare function patchErrorInspectNodeJS(errorConstructor: ErrorConstructor): void;
export declare function patchErrorInspectEdgeLite(errorConstructor: ErrorConstructor): void;
export {};
