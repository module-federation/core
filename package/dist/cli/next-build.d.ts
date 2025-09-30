#!/usr/bin/env node
import '../server/lib/cpu-profile';
export type NextBuildOptions = {
    debug?: boolean;
    profile?: boolean;
    lint: boolean;
    mangling: boolean;
    turbo?: boolean;
    turbopack?: boolean;
    experimentalDebugMemoryUsage: boolean;
    experimentalAppOnly?: boolean;
    experimentalTurbo?: boolean;
    experimentalBuildMode: 'default' | 'compile' | 'generate' | 'generate-env';
    experimentalUploadTrace?: string;
};
declare const nextBuild: (options: NextBuildOptions, directory?: string) => Promise<void>;
export { nextBuild };
