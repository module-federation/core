import type { LoadedEnvFiles } from '@next/env';
export declare function createEnvDefinitions({ distDir, loadedEnvFiles, }: {
    distDir: string;
    loadedEnvFiles: LoadedEnvFiles;
}): Promise<string | undefined>;
