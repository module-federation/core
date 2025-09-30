export type ErrorType = 'Build Error' | 'Runtime Error' | 'Console Error' | 'Missing Required HTML Tag';
type ErrorTypeLabelProps = {
    errorType: ErrorType;
};
export declare function ErrorTypeLabel({ errorType }: ErrorTypeLabelProps): import("react/jsx-runtime").JSX.Element;
export declare const styles = "\n  .nextjs__container_errors_label {\n    padding: 2px 6px;\n    margin: 0;\n    border-radius: var(--rounded-md-2);\n    background: var(--color-red-100);\n    font-weight: 600;\n    font-size: var(--size-12);\n    color: var(--color-red-900);\n    font-family: var(--font-stack-monospace);\n    line-height: var(--size-20);\n  }\n";
export {};
