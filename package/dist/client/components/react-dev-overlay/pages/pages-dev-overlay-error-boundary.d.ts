import React from 'react';
type PagesDevOverlayErrorBoundaryProps = {
    children?: React.ReactNode;
    onError: (error: Error, componentStack: string | null) => void;
};
type PagesDevOverlayErrorBoundaryState = {
    error: Error | null;
};
export declare class PagesDevOverlayErrorBoundary extends React.PureComponent<PagesDevOverlayErrorBoundaryProps, PagesDevOverlayErrorBoundaryState> {
    state: {
        error: null;
    };
    static getDerivedStateFromError(error: Error): {
        error: Error;
    };
    componentDidCatch(error: Error, errorInfo?: {
        componentStack?: string | null;
    }): void;
    render(): React.ReactNode;
}
export {};
