import React, { Component, ErrorInfo, ReactNode } from "react";
import { LogPrefix } from "../utilities/constants";

interface ReactErrorBoundaryProps {
    children?: ReactNode;
    fallback: ReactNode;
    logCallback?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ReactErrorBoundaryState {
    hasError: boolean;
}

class ReactErrorBoundary extends Component<ReactErrorBoundaryProps, ReactErrorBoundaryState> {
    public state: ReactErrorBoundaryState = {
        hasError: false
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static getDerivedStateFromError(error: Error): ReactErrorBoundaryState {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        if (this.props.logCallback !== undefined) {
            this.props.logCallback(error, errorInfo);
            return;
        }
        console.error(`${LogPrefix} Uncaught error:`, error, errorInfo);
    }

    public render() {
        const { children, fallback } = this.props;
        const { hasError } = this.state;
        return hasError ? fallback : children
    }
}

export default ReactErrorBoundary;
