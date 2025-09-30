import type { VersionInfo } from '../../../../../../../server/dev/parse-version-info';
import type { ReadyRuntimeError } from '../../../../utils/get-error-by-type';
type ErrorOverlayNavProps = {
    runtimeErrors?: ReadyRuntimeError[];
    activeIdx?: number;
    setActiveIndex?: (index: number) => void;
    versionInfo?: VersionInfo;
    isTurbopack?: boolean;
};
export declare function ErrorOverlayNav({ runtimeErrors, activeIdx, setActiveIndex, versionInfo, }: ErrorOverlayNavProps): import("react/jsx-runtime").JSX.Element;
export declare const styles = "\n  [data-nextjs-error-overlay-nav] {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n\n    width: 100%;\n\n    position: relative;\n    z-index: 2;\n    outline: none;\n    translate: 1px 1px;\n    max-width: var(--next-dialog-max-width);\n\n    .error-overlay-notch {\n      --stroke-color: var(--color-gray-400);\n      --background-color: var(--color-background-100);\n\n      translate: -1px 0;\n      width: auto;\n      height: var(--next-dialog-notch-height);\n      padding: 12px;\n      background: var(--background-color);\n      border: 1px solid var(--stroke-color);\n      border-bottom: none;\n      position: relative;\n\n      &[data-side='left'] {\n        padding-right: 0;\n        border-radius: var(--rounded-xl) 0 0 0;\n\n        .error-overlay-notch-tail {\n          right: -54px;\n        }\n\n        > *:not(.error-overlay-notch-tail) {\n          margin-right: -10px;\n        }\n      }\n\n      &[data-side='right'] {\n        padding-left: 0;\n        border-radius: 0 var(--rounded-xl) 0 0;\n\n        .error-overlay-notch-tail {\n          left: -54px;\n          transform: rotateY(180deg);\n        }\n\n        > *:not(.error-overlay-notch-tail) {\n          margin-left: -12px;\n        }\n      }\n\n      .error-overlay-notch-tail {\n        position: absolute;\n        top: -1px;\n        pointer-events: none;\n        z-index: -1;\n        height: calc(100% + 1px);\n      }\n    }\n  }\n";
export {};
