import { TypesStatsJson } from '../types';
export declare class TypesCache {
    private static fsCache;
    private static typesCache;
    static getFsFiles(directory: string): string[] | undefined;
    static getCacheBustedFiles(remote: string, statsJson: TypesStatsJson): {
        filesToCacheBust: string[];
        filesToDelete: string[];
    };
}
