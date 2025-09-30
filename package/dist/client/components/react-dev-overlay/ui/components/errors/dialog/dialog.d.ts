type ErrorOverlayDialogProps = {
    children?: React.ReactNode;
    onClose?: () => void;
    dialogResizerRef?: React.RefObject<HTMLDivElement | null>;
    footer?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;
export declare function ErrorOverlayDialog({ children, onClose, footer, ...props }: ErrorOverlayDialogProps): import("react/jsx-runtime").JSX.Element;
export declare const DIALOG_STYLES = "\n  .error-overlay-dialog-container {\n    -webkit-font-smoothing: antialiased;\n    display: flex;\n    flex-direction: column;\n    background: var(--color-background-100);\n    background-clip: padding-box;\n    border: var(--next-dialog-border-width) solid var(--color-gray-400);\n    border-radius: 0 0 var(--next-dialog-radius) var(--next-dialog-radius);\n    box-shadow: var(--shadow-menu);\n    position: relative;\n    overflow: hidden;\n  }\n\n  .error-overlay-dialog-scroll {\n    overflow-y: auto;\n    height: 100%;\n  }\n";
export {};
