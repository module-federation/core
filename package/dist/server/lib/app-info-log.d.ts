import { type ConfiguredExperimentalFeature } from '../config';
export declare function logStartInfo({ networkUrl, appUrl, envInfo, experimentalFeatures, maxExperimentalFeatures, }: {
    networkUrl: string | null;
    appUrl: string | null;
    envInfo?: string[];
    experimentalFeatures?: ConfiguredExperimentalFeature[];
    maxExperimentalFeatures?: number;
}): void;
export declare function getStartServerInfo(dir: string, dev: boolean): Promise<{
    envInfo?: string[];
    experimentalFeatures?: ConfiguredExperimentalFeature[];
}>;
