import type { OverlayState } from '../shared';
import type { GlobalErrorComponent } from '../../error-boundary';
export declare function AppDevOverlay({ state, globalError, children, }: {
    state: OverlayState;
    globalError: [GlobalErrorComponent, React.ReactNode];
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
