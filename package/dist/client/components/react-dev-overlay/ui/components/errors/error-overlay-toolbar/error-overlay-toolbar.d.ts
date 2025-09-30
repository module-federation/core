import type { DebugInfo } from '../../../../types';
type ErrorOverlayToolbarProps = {
    error: Error;
    debugInfo: DebugInfo | undefined;
};
export declare function ErrorOverlayToolbar({ error, debugInfo, }: ErrorOverlayToolbarProps): import("react/jsx-runtime").JSX.Element;
export declare const styles = "\n  .error-overlay-toolbar {\n    display: flex;\n    gap: 6px;\n  }\n\n  .nodejs-inspector-button,\n  .copy-stack-trace-button,\n  .docs-link-button {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n\n    width: var(--size-28);\n    height: var(--size-28);\n    background: var(--color-background-100);\n    background-clip: padding-box;\n    border: 1px solid var(--color-gray-alpha-400);\n    box-shadow: var(--shadow-small);\n    border-radius: var(--rounded-full);\n\n    svg {\n      width: var(--size-14);\n      height: var(--size-14);\n    }\n\n    &:focus {\n      outline: var(--focus-ring);\n    }\n\n    &:not(:disabled):hover {\n      background: var(--color-gray-alpha-100);\n    }\n\n    &:not(:disabled):active {\n      background: var(--color-gray-alpha-200);\n    }\n\n    &:disabled {\n      background-color: var(--color-gray-100);\n      cursor: not-allowed;\n    }\n  }\n\n  .error-overlay-toolbar-button-icon {\n    color: var(--color-gray-900);\n  }\n";
export {};
