import type { OverlayState } from '../../../../shared';
import type { ReadyRuntimeError } from '../../../../utils/get-error-by-type';
export interface ErrorBaseProps {
    rendered: boolean;
    transitionDurationMs: number;
    isTurbopack: boolean;
    versionInfo: OverlayState['versionInfo'];
}
export declare function ErrorOverlay({ state, runtimeErrors, isErrorOverlayOpen, setIsErrorOverlayOpen, }: {
    state: OverlayState;
    runtimeErrors: ReadyRuntimeError[];
    isErrorOverlayOpen: boolean;
    setIsErrorOverlayOpen: (value: boolean) => void;
}): import("react/jsx-runtime").JSX.Element;
