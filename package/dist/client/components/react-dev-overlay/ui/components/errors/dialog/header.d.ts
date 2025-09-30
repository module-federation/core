type ErrorOverlayDialogHeaderProps = {
    children?: React.ReactNode;
};
export declare function ErrorOverlayDialogHeader({ children, }: ErrorOverlayDialogHeaderProps): import("react/jsx-runtime").JSX.Element;
export declare const DIALOG_HEADER_STYLES = "\n  .nextjs-container-errors-header {\n    position: relative;\n  }\n  .nextjs-container-errors-header > h1 {\n    font-size: var(--size-20);\n    line-height: var(--size-24);\n    font-weight: bold;\n    margin: calc(16px * 1.5) 0;\n    color: var(--color-title-h1);\n  }\n  .nextjs-container-errors-header small {\n    font-size: var(--size-14);\n    color: var(--color-accents-1);\n    margin-left: 16px;\n  }\n  .nextjs-container-errors-header small > span {\n    font-family: var(--font-stack-monospace);\n  }\n  .nextjs-container-errors-header > div > small {\n    margin: 0;\n    margin-top: 4px;\n  }\n  .nextjs-container-errors-header > p > a {\n    color: inherit;\n    font-weight: bold;\n  }\n  .nextjs-container-errors-header\n    > .nextjs-container-build-error-version-status {\n    position: absolute;\n    top: 16px;\n    right: 16px;\n  }\n";
export {};
