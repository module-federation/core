declare namespace _exports {
    export { SyntaxParser, SyntaxPrinter };
}
declare namespace _exports {
    const parser: SyntaxParser;
    const printer: SyntaxPrinter;
    const toEstreeObject: SyntaxParser["toEstreeObject"];
}
export = _exports;
type SyntaxParser = typeof import("./syntax-parser");
type SyntaxPrinter = typeof import("./syntax-printer");
