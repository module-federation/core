import { PureComponent } from 'react';
import { type GlobalErrorComponent } from '../../error-boundary';
type AppDevOverlayErrorBoundaryProps = {
    children: React.ReactNode;
    globalError: [GlobalErrorComponent, React.ReactNode];
    onError: (value: boolean) => void;
};
type AppDevOverlayErrorBoundaryState = {
    isReactError: boolean;
    reactError: unknown;
};
export declare class AppDevOverlayErrorBoundary extends PureComponent<AppDevOverlayErrorBoundaryProps, AppDevOverlayErrorBoundaryState> {
    state: {
        isReactError: boolean;
        reactError: null;
    };
    static getDerivedStateFromError(error: Error): {
        isReactError: boolean;
        reactError: null;
    } | {
        isReactError: boolean;
        reactError: Error;
    };
    componentDidCatch(): void;
    render(): string | number | bigint | boolean | Iterable<import("react").ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | import("react").ReactPortal | Iterable<import("react").ReactNode> | null | undefined> | import("react/jsx-runtime").JSX.Element | null | undefined;
}
export {};
