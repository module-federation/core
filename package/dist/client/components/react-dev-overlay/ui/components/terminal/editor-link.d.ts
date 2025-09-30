type EditorLinkProps = {
    file: string;
    isSourceFile: boolean;
    location?: {
        line: number;
        column: number;
    };
};
export declare function EditorLink({ file, location }: EditorLinkProps): import("react/jsx-runtime").JSX.Element;
export declare const EDITOR_LINK_STYLES = "\n  [data-with-open-in-editor-link] svg {\n    width: auto;\n    height: var(--size-14);\n    margin-left: 8px;\n  }\n  [data-with-open-in-editor-link] {\n    cursor: pointer;\n  }\n  [data-with-open-in-editor-link]:hover {\n    text-decoration: underline dotted;\n  }\n  [data-with-open-in-editor-link-import-trace] {\n    margin-left: 16px;\n  }\n";
export {};
