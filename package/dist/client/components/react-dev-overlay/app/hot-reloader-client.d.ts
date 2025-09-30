import type { ReactNode } from 'react';
import type { VersionInfo } from '../../../../server/dev/parse-version-info';
import type { DebugInfo } from '../types';
import type { GlobalErrorComponent } from '../../error-boundary';
import type { DevIndicatorServerState } from '../../../../server/dev/dev-indicator-server-state';
export interface Dispatcher {
    onBuildOk(): void;
    onBuildError(message: string): void;
    onVersionInfo(versionInfo: VersionInfo): void;
    onDebugInfo(debugInfo: DebugInfo): void;
    onBeforeRefresh(): void;
    onRefresh(): void;
    onStaticIndicator(status: boolean): void;
    onDevIndicator(devIndicator: DevIndicatorServerState): void;
}
export declare function waitForWebpackRuntimeHotUpdate(): Promise<void>;
export default function HotReload({ assetPrefix, children, globalError, }: {
    assetPrefix: string;
    children: ReactNode;
    globalError: [GlobalErrorComponent, React.ReactNode];
}): import("react/jsx-runtime").JSX.Element;
