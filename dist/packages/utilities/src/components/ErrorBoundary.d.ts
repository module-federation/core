import React, { type ErrorInfo } from 'react';
export interface ErrorBoundaryProps {
    children: React.ReactNode;
}
export interface ErrorBoundaryState {
    hasError: boolean;
}
/**
 * Generic error boundary component.
 */
declare class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps);
    static getDerivedStateFromError(): {
        hasError: boolean;
    };
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    render(): React.ReactNode;
}
export default ErrorBoundary;
