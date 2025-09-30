import type { ErrorInfo } from 'react';
export declare function onCaughtError(err: unknown, errorInfo: ErrorInfo & {
    errorBoundary?: React.Component;
}): void;
export declare function onUncaughtError(err: unknown, errorInfo: React.ErrorInfo): void;
