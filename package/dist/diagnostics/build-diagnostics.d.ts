import type { ExportAppResult } from '../export/types';
interface BuildDiagnostics {
    buildStage?: string;
    buildOptions?: Record<string, string>;
}
/**
 * Saves the exact version of Next.js that was used to build the app to a diagnostics file.
 */
export declare function recordFrameworkVersion(version: string): Promise<void>;
/**
 * Saves build diagnostics information to a file. This method can be called
 * multiple times during a build to save additional information that can help
 * debug a build such as what stage the build was in when a failure happened.
 * Each time this method is called, the new information will be merged with any
 * existing build diagnostics that previously existed.
 */
export declare function updateBuildDiagnostics(diagnostics: BuildDiagnostics): Promise<void>;
/**
 * Writes fetch metrics collected during static generation to a file.
 */
export declare function recordFetchMetrics(exportResult: ExportAppResult): Promise<void>;
interface IncrementalBuildDiagnostics {
    changedAppPaths?: string[];
    unchangedAppPaths?: string[];
    changedPagePaths?: string[];
    unchangedPagePaths?: string[];
    changedDependencies?: Record<string, string>;
    shuttleGitSha?: string;
    currentGitSha?: string;
}
/**
 * Writes incremental build metrics to a file.
 */
export declare function updateIncrementalBuildMetrics(diagnostics: IncrementalBuildDiagnostics): Promise<void>;
export {};
