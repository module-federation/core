import type { TelemetryPlugin } from '../../build/webpack/plugins/telemetry-plugin/telemetry-plugin';
import type { SWC_TARGET_TRIPLE } from '../../build/webpack/plugins/telemetry-plugin/telemetry-plugin';
import type { UseCacheTrackerKey } from '../../build/webpack/plugins/telemetry-plugin/use-cache-tracker-utils';
type EventTypeCheckCompleted = {
    durationInSeconds: number;
    typescriptVersion: string | null;
    inputFilesCount?: number;
    totalFilesCount?: number;
    incremental?: boolean;
};
export declare function eventTypeCheckCompleted(event: EventTypeCheckCompleted): {
    eventName: string;
    payload: EventTypeCheckCompleted;
};
export type EventLintCheckCompleted = {
    durationInSeconds: number;
    eslintVersion: string | null;
    lintedFilesCount?: number;
    lintFix?: boolean;
    buildLint?: boolean;
    nextEslintPluginVersion?: string | null;
    nextEslintPluginErrorsCount?: number;
    nextEslintPluginWarningsCount?: number;
    nextRulesEnabled: {
        [ruleName: `@next/next/${string}`]: 'off' | 'warn' | 'error';
    };
};
export declare function eventLintCheckCompleted(event: EventLintCheckCompleted): {
    eventName: string;
    payload: EventLintCheckCompleted;
};
type EventBuildCompleted = {
    bundler: 'webpack' | 'rspack' | 'turbopack';
    durationInSeconds: number;
    totalPageCount: number;
    hasDunderPages: boolean;
    hasTestPages: boolean;
    totalAppPagesCount?: number;
};
export declare function eventBuildCompleted(pagePaths: string[], event: Omit<EventBuildCompleted, 'totalPageCount' | 'hasDunderPages' | 'hasTestPages'>): {
    eventName: string;
    payload: EventBuildCompleted;
};
type EventBuildFailed = {
    bundler: 'webpack' | 'rspack' | 'turbopack';
    errorCode: string;
    durationInSeconds: number;
};
export declare function eventBuildFailed(event: EventBuildFailed): {
    eventName: string;
    payload: EventBuildFailed;
};
type EventBuildOptimized = {
    durationInSeconds: number;
    totalPageCount: number;
    staticPageCount: number;
    staticPropsPageCount: number;
    serverPropsPageCount: number;
    ssrPageCount: number;
    hasDunderPages: boolean;
    hasTestPages: boolean;
    hasStatic404: boolean;
    hasReportWebVitals: boolean;
    headersCount: number;
    rewritesCount: number;
    redirectsCount: number;
    headersWithHasCount: number;
    rewritesWithHasCount: number;
    redirectsWithHasCount: number;
    middlewareCount: number;
    isRspack: boolean;
    totalAppPagesCount?: number;
    staticAppPagesCount?: number;
    serverAppPagesCount?: number;
    edgeRuntimeAppCount?: number;
    edgeRuntimePagesCount?: number;
};
export declare function eventBuildOptimize(pagePaths: string[], event: Omit<EventBuildOptimized, 'totalPageCount' | 'hasDunderPages' | 'hasTestPages' | 'isRspack'>): {
    eventName: string;
    payload: EventBuildOptimized;
};
export declare const EVENT_BUILD_FEATURE_USAGE = "NEXT_BUILD_FEATURE_USAGE";
export type EventBuildFeatureUsage = {
    featureName: 'next/image' | 'next/legacy/image' | 'next/future/image' | 'next/script' | 'next/dynamic' | '@next/font/google' | '@next/font/local' | 'next/font/google' | 'next/font/local' | 'experimental/nextScriptWorkers' | 'experimental/dynamicIO' | 'experimental/optimizeCss' | 'experimental/ppr' | 'swcLoader' | 'swcRelay' | 'swcStyledComponents' | 'swcReactRemoveProperties' | 'swcExperimentalDecorators' | 'swcRemoveConsole' | 'swcImportSource' | 'swcEmotion' | `swc/target/${SWC_TARGET_TRIPLE}` | 'turbotrace' | 'build-lint' | 'vercelImageGeneration' | 'transpilePackages' | 'skipMiddlewareUrlNormalize' | 'skipTrailingSlashRedirect' | 'modularizeImports' | 'esmExternals' | 'webpackPlugins' | UseCacheTrackerKey | 'turbopackPersistentCaching';
    invocationCount: number;
};
export declare function eventBuildFeatureUsage(usages: ReturnType<TelemetryPlugin['usages']>): Array<{
    eventName: string;
    payload: EventBuildFeatureUsage;
}>;
export declare const EVENT_NAME_PACKAGE_USED_IN_GET_SERVER_SIDE_PROPS = "NEXT_PACKAGE_USED_IN_GET_SERVER_SIDE_PROPS";
export type EventPackageUsedInGetServerSideProps = {
    package: string;
};
export declare function eventPackageUsedInGetServerSideProps(packagesUsedInServerSideProps: ReturnType<TelemetryPlugin['packagesUsedInServerSideProps']>): Array<{
    eventName: string;
    payload: EventPackageUsedInGetServerSideProps;
}>;
export declare const ERROR_THROWN_EVENT = "NEXT_ERROR_THROWN";
type ErrorThrownEvent = {
    eventName: typeof ERROR_THROWN_EVENT;
    payload: {
        errorCode: string | undefined;
    };
};
export declare function eventErrorThrown(error: Error): ErrorThrownEvent;
export {};
