"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _constant = require("../constant");
const _utils = require("../utils");
const TYPE_ANNOTATION = ': Metadata | null';
const TYPE_ANNOTATION_ASYNC = ': Promise<Metadata | null>';
const TYPE_IMPORT = `\n\nimport type { Metadata } from 'next'`;
// Find the `export const metadata = ...` node.
function getMetadataExport(fileName, position) {
    const source = (0, _utils.getSource)(fileName);
    let metadataExport;
    if (source) {
        const ts = (0, _utils.getTs)();
        ts.forEachChild(source, function visit(node) {
            if (metadataExport) return;
            // Covered by this node
            if ((0, _utils.isPositionInsideNode)(position, node)) {
                var _node_modifiers;
                // Export variable
                if (ts.isVariableStatement(node) && ((_node_modifiers = node.modifiers) == null ? void 0 : _node_modifiers.some((m)=>m.kind === ts.SyntaxKind.ExportKeyword))) {
                    if (ts.isVariableDeclarationList(node.declarationList)) {
                        for (const declaration of node.declarationList.declarations){
                            if ((0, _utils.isPositionInsideNode)(position, declaration) && declaration.name.getText() === 'metadata') {
                                // `export const metadata = ...`
                                metadataExport = declaration;
                                return;
                            }
                        }
                    }
                }
            }
        });
    }
    return metadataExport;
}
function updateVirtualFileWithType(fileName, node, isGenerateMetadata) {
    const source = (0, _utils.getSource)(fileName);
    if (!source) return;
    // We annotate with the type in a virtual language service
    const sourceText = source.getFullText();
    let nodeEnd;
    let annotation;
    const ts = (0, _utils.getTs)();
    if (ts.isFunctionDeclaration(node)) {
        if (isGenerateMetadata) {
            var _node_modifiers;
            nodeEnd = node.body.getFullStart();
            const isAsync = (_node_modifiers = node.modifiers) == null ? void 0 : _node_modifiers.some((m)=>m.kind === ts.SyntaxKind.AsyncKeyword);
            annotation = isAsync ? TYPE_ANNOTATION_ASYNC : TYPE_ANNOTATION;
        } else {
            return;
        }
    } else {
        nodeEnd = node.name.getFullStart() + node.name.getFullWidth();
        annotation = TYPE_ANNOTATION;
    }
    const newSource = sourceText.slice(0, nodeEnd) + annotation + sourceText.slice(nodeEnd) + TYPE_IMPORT;
    if (_utils.virtualTsEnv.getSourceFile(fileName)) {
        (0, _utils.log)('Updating file: ' + fileName);
        _utils.virtualTsEnv.updateFile(fileName, newSource);
    } else {
        (0, _utils.log)('Creating file: ' + fileName);
        _utils.virtualTsEnv.createFile(fileName, newSource);
    }
    return [
        nodeEnd,
        annotation.length
    ];
}
function isTyped(node) {
    return node.type !== undefined;
}
function proxyDiagnostics(fileName, pos, n) {
    // Get diagnostics
    const diagnostics = _utils.virtualTsEnv.languageService.getSemanticDiagnostics(fileName);
    const source = (0, _utils.getSourceFromVirtualTsEnv)(fileName);
    // Filter and map the results
    return diagnostics.filter((d)=>{
        if (d.start === undefined || d.length === undefined) return false;
        if (d.start < n.getFullStart()) return false;
        if (d.start + d.length >= n.getFullStart() + n.getFullWidth() + pos[1]) return false;
        return true;
    }).map((d)=>{
        return {
            file: source,
            category: d.category,
            code: d.code,
            messageText: d.messageText,
            start: d.start < pos[0] ? d.start : d.start - pos[1],
            length: d.length
        };
    });
}
const metadata = {
    filterCompletionsAtPosition (fileName, position, _options, prior) {
        const node = getMetadataExport(fileName, position);
        if (!node) return prior;
        if (isTyped(node)) return prior;
        // We annotate with the type in a virtual language service
        const pos = updateVirtualFileWithType(fileName, node);
        if (pos === undefined) return prior;
        // Get completions
        const newPos = position <= pos[0] ? position : position + pos[1];
        const completions = _utils.virtualTsEnv.languageService.getCompletionsAtPosition(fileName, newPos, undefined);
        if (completions) {
            const ts = (0, _utils.getTs)();
            completions.isIncomplete = true;
            // https://github.com/microsoft/TypeScript/blob/4dc677b292354f4b9162452b2e00f4d7dd118221/src/services/types.ts#L1428-L1433
            if (completions.optionalReplacementSpan) {
                // Adjust the start position of the text span to original source.
                completions.optionalReplacementSpan.start -= newPos - position;
            }
            completions.entries = completions.entries.filter((e)=>{
                return [
                    ts.ScriptElementKind.memberVariableElement,
                    ts.ScriptElementKind.typeElement,
                    ts.ScriptElementKind.string
                ].includes(e.kind);
            }).map((e)=>{
                const insertText = e.kind === ts.ScriptElementKind.memberVariableElement && /^[a-zA-Z0-9_]+$/.test(e.name) ? e.name + ': ' : e.name;
                return {
                    name: e.name,
                    insertText,
                    kind: e.kind,
                    kindModifiers: e.kindModifiers,
                    sortText: '!' + e.name,
                    labelDetails: {
                        description: `Next.js metadata`
                    },
                    data: e.data
                };
            });
            return completions;
        }
        return prior;
    },
    getSemanticDiagnosticsForExportVariableStatementInClientEntry (fileName, node) {
        const source = (0, _utils.getSource)(fileName);
        const ts = (0, _utils.getTs)();
        // It is not allowed to export `metadata` or `generateMetadata` in client entry
        if (ts.isFunctionDeclaration(node)) {
            var _node_name;
            if (((_node_name = node.name) == null ? void 0 : _node_name.getText()) === 'generateMetadata') {
                return [
                    {
                        file: source,
                        category: ts.DiagnosticCategory.Error,
                        code: _constant.NEXT_TS_ERRORS.INVALID_METADATA_EXPORT,
                        messageText: `The Next.js 'generateMetadata' API is not allowed in a client component.`,
                        start: node.name.getStart(),
                        length: node.name.getWidth()
                    }
                ];
            }
        } else {
            for (const declaration of node.declarationList.declarations){
                const name = declaration.name.getText();
                if (name === 'metadata') {
                    return [
                        {
                            file: source,
                            category: ts.DiagnosticCategory.Error,
                            code: _constant.NEXT_TS_ERRORS.INVALID_METADATA_EXPORT,
                            messageText: `The Next.js 'metadata' API is not allowed in a client component.`,
                            start: declaration.name.getStart(),
                            length: declaration.name.getWidth()
                        }
                    ];
                }
            }
        }
        return [];
    },
    getSemanticDiagnosticsForExportVariableStatement (fileName, node) {
        const ts = (0, _utils.getTs)();
        if (ts.isFunctionDeclaration(node)) {
            var _node_name;
            if (((_node_name = node.name) == null ? void 0 : _node_name.getText()) === 'generateMetadata') {
                if (isTyped(node)) return [];
                // We annotate with the type in a virtual language service
                const pos = updateVirtualFileWithType(fileName, node, true);
                if (!pos) return [];
                return proxyDiagnostics(fileName, pos, node);
            }
        } else {
            for (const declaration of node.declarationList.declarations){
                if (declaration.name.getText() === 'metadata') {
                    if (isTyped(declaration)) break;
                    // We annotate with the type in a virtual language service
                    const pos = updateVirtualFileWithType(fileName, declaration);
                    if (!pos) break;
                    return proxyDiagnostics(fileName, pos, declaration);
                }
            }
        }
        return [];
    },
    getSemanticDiagnosticsForExportDeclarationInClientEntry (fileName, node) {
        const ts = (0, _utils.getTs)();
        const source = (0, _utils.getSource)(fileName);
        const diagnostics = [];
        const exportClause = node.exportClause;
        if (exportClause && ts.isNamedExports(exportClause)) {
            for (const e of exportClause.elements){
                if ([
                    'generateMetadata',
                    'metadata'
                ].includes(e.name.getText())) {
                    diagnostics.push({
                        file: source,
                        category: ts.DiagnosticCategory.Error,
                        code: _constant.NEXT_TS_ERRORS.INVALID_METADATA_EXPORT,
                        messageText: `The Next.js '${e.name.getText()}' API is not allowed in a client component.`,
                        start: e.name.getStart(),
                        length: e.name.getWidth()
                    });
                }
            }
        }
        return diagnostics;
    },
    getSemanticDiagnosticsForExportDeclaration (fileName, node) {
        const ts = (0, _utils.getTs)();
        const exportClause = node.exportClause;
        if (exportClause && ts.isNamedExports(exportClause)) {
            for (const e of exportClause.elements){
                if (e.name.getText() === 'metadata') {
                    // Get the original declaration node of element
                    const typeChecker = (0, _utils.getTypeChecker)();
                    if (typeChecker) {
                        const symbol = typeChecker.getSymbolAtLocation(e.name);
                        if (symbol) {
                            const metadataSymbol = typeChecker.getAliasedSymbol(symbol);
                            if (metadataSymbol && metadataSymbol.declarations) {
                                const declaration = metadataSymbol.declarations[0];
                                if (declaration && ts.isVariableDeclaration(declaration)) {
                                    if (isTyped(declaration)) break;
                                    const declarationFileName = declaration.getSourceFile().fileName;
                                    const isSameFile = declarationFileName === fileName;
                                    // We annotate with the type in a virtual language service
                                    const pos = updateVirtualFileWithType(declarationFileName, declaration);
                                    if (!pos) break;
                                    const diagnostics = proxyDiagnostics(declarationFileName, pos, declaration);
                                    if (diagnostics.length) {
                                        if (isSameFile) {
                                            return diagnostics;
                                        } else {
                                            return [
                                                {
                                                    file: (0, _utils.getSource)(fileName),
                                                    category: ts.DiagnosticCategory.Error,
                                                    code: _constant.NEXT_TS_ERRORS.INVALID_METADATA_EXPORT,
                                                    messageText: `The 'metadata' export value is not typed correctly, please make sure it is typed as 'Metadata':\nhttps://nextjs.org/docs/app/building-your-application/optimizing/metadata#static-metadata`,
                                                    start: e.name.getStart(),
                                                    length: e.name.getWidth()
                                                }
                                            ];
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return [];
    },
    getCompletionEntryDetails (fileName, position, entryName, formatOptions, source, preferences, data) {
        const node = getMetadataExport(fileName, position);
        if (!node) return;
        if (isTyped(node)) return;
        // We annotate with the type in a virtual language service
        const pos = updateVirtualFileWithType(fileName, node);
        if (pos === undefined) return;
        const newPos = position <= pos[0] ? position : position + pos[1];
        const details = _utils.virtualTsEnv.languageService.getCompletionEntryDetails(fileName, newPos, entryName, formatOptions, source, preferences, data);
        return details;
    },
    getQuickInfoAtPosition (fileName, position) {
        const node = getMetadataExport(fileName, position);
        if (!node) return;
        if (isTyped(node)) return;
        // We annotate with the type in a virtual language service
        const pos = updateVirtualFileWithType(fileName, node);
        if (pos === undefined) return;
        const newPos = position <= pos[0] ? position : position + pos[1];
        const insight = _utils.virtualTsEnv.languageService.getQuickInfoAtPosition(fileName, newPos);
        return insight;
    },
    getDefinitionAndBoundSpan (fileName, position) {
        const node = getMetadataExport(fileName, position);
        if (!node) return;
        if (isTyped(node)) return;
        if (!(0, _utils.isPositionInsideNode)(position, node)) return;
        // We annotate with the type in a virtual language service
        const pos = updateVirtualFileWithType(fileName, node);
        if (pos === undefined) return;
        const newPos = position <= pos[0] ? position : position + pos[1];
        const definitionInfoAndBoundSpan = _utils.virtualTsEnv.languageService.getDefinitionAndBoundSpan(fileName, newPos);
        if (definitionInfoAndBoundSpan) {
            // Adjust the start position of the text span
            if (definitionInfoAndBoundSpan.textSpan.start > pos[0]) {
                definitionInfoAndBoundSpan.textSpan.start -= pos[1];
            }
        }
        return definitionInfoAndBoundSpan;
    }
};
const _default = metadata;

//# sourceMappingURL=metadata.js.map