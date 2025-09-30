export default function nextInvalidImportErrorLoader() {
    const { message } = this.getOptions();
    throw Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
        value: "E394",
        enumerable: false,
        configurable: true
    });
}

//# sourceMappingURL=next-invalid-import-error-loader.js.map