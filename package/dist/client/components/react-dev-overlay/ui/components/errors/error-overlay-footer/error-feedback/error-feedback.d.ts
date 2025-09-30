interface ErrorFeedbackProps {
    errorCode: string;
    className?: string;
}
export declare function ErrorFeedback({ errorCode, className }: ErrorFeedbackProps): import("react/jsx-runtime").JSX.Element;
export declare const styles = "\n  .error-feedback {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    white-space: nowrap;\n    color: var(--color-gray-900);\n  }\n\n  .error-feedback-thanks {\n    height: var(--size-24);\n    display: flex;\n    align-items: center;\n    padding-right: 4px; /* To match the 4px inner padding of the thumbs up and down icons */\n  }\n\n  .feedback-button {\n    background: none;\n    border: none;\n    border-radius: var(--rounded-md);\n    width: var(--size-24);\n    height: var(--size-24);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    cursor: pointer;\n\n    &:focus {\n      outline: var(--focus-ring);\n    }\n\n    &:hover {\n      background: var(--color-gray-alpha-100);\n    }\n\n    &:active {\n      background: var(--color-gray-alpha-200);\n    }\n  }\n\n  .feedback-button[aria-disabled='true'] {\n    opacity: 0.7;\n    cursor: not-allowed;\n  }\n\n  .feedback-button.voted {\n    background: var(--color-gray-alpha-200);\n  }\n\n  .thumbs-up-icon,\n  .thumbs-down-icon {\n    color: var(--color-gray-900);\n    width: var(--size-16);\n    height: var(--size-16);\n  }\n";
export {};
