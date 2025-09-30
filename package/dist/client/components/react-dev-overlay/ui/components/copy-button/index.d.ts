import * as React from 'react';
export declare function CopyButton({ actionLabel, successLabel, content, icon, disabled, ...props }: React.HTMLProps<HTMLButtonElement> & {
    actionLabel: string;
    successLabel: string;
    content: string;
    icon?: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare const COPY_BUTTON_STYLES = "\n  .nextjs-data-copy-button {\n    color: inherit;\n\n    svg {\n      width: var(--size-16);\n      height: var(--size-16);\n    }\n  }\n  .nextjs-data-copy-button--initial:hover {\n    cursor: pointer;\n  }\n  .nextjs-data-copy-button--error,\n  .nextjs-data-copy-button--error:hover {\n    color: var(--color-ansi-red);\n  }\n  .nextjs-data-copy-button--success {\n    color: var(--color-ansi-green);\n  }\n";
