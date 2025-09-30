import type { OverlayState } from '../shared';
export declare function DevOverlay({ state, isErrorOverlayOpen, setIsErrorOverlayOpen, }: {
    state: OverlayState;
    isErrorOverlayOpen: boolean;
    setIsErrorOverlayOpen: (isErrorOverlayOpen: boolean | ((prev: boolean) => boolean)) => void;
}): import("react/jsx-runtime").JSX.Element;
