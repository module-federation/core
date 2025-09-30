"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    TERMINAL_STYLES: null,
    Terminal: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    TERMINAL_STYLES: function() {
        return TERMINAL_STYLES;
    },
    Terminal: function() {
        return Terminal;
    }
});
const _interop_require_default = require("@swc/helpers/_/_interop_require_default");
const _interop_require_wildcard = require("@swc/helpers/_/_interop_require_wildcard");
const _jsxruntime = require("react/jsx-runtime");
const _anser = /*#__PURE__*/ _interop_require_default._(require("next/dist/compiled/anser"));
const _react = /*#__PURE__*/ _interop_require_wildcard._(require("react"));
const _hotlinkedtext = require("../hot-linked-text");
const _editorlink = require("./editor-link");
const _external = require("../../icons/external");
const _stackframe = require("../../../utils/stack-frame");
const _useopenineditor = require("../../utils/use-open-in-editor");
const _file = require("../../icons/file");
function getFile(lines) {
    const contentFileName = lines.shift();
    if (!contentFileName) return null;
    const [fileName, line, column] = contentFileName.split(':', 3);
    const parsedLine = Number(line);
    const parsedColumn = Number(column);
    const hasLocation = !Number.isNaN(parsedLine) && !Number.isNaN(parsedColumn);
    return {
        fileName: hasLocation ? fileName : contentFileName,
        location: hasLocation ? {
            line: parsedLine,
            column: parsedColumn
        } : undefined
    };
}
function getImportTraceFiles(lines) {
    if (lines.some((line)=>/ReactServerComponentsError:/.test(line)) || lines.some((line)=>/Import trace for requested module:/.test(line))) {
        // Grab the lines at the end containing the files
        const files = [];
        while(/.+\..+/.test(lines[lines.length - 1]) && !lines[lines.length - 1].includes(':')){
            const file = lines.pop().trim();
            files.unshift(file);
        }
        return files;
    }
    return [];
}
function getEditorLinks(content) {
    const lines = content.split('\n');
    const file = getFile(lines);
    const importTraceFiles = getImportTraceFiles(lines);
    return {
        file,
        source: lines.join('\n'),
        importTraceFiles
    };
}
const Terminal = function Terminal(param) {
    let { content } = param;
    var _file_location, _file_location1, _file_location2, _file_location3, _stackFrame_file;
    const { file, source, importTraceFiles } = _react.useMemo(()=>getEditorLinks(content), [
        content
    ]);
    const decoded = _react.useMemo(()=>{
        return _anser.default.ansiToJson(source, {
            json: true,
            use_classes: true,
            remove_empty: true
        });
    }, [
        source
    ]);
    var _file_location_line, _file_location_column;
    const open = (0, _useopenineditor.useOpenInEditor)({
        file: file == null ? void 0 : file.fileName,
        lineNumber: (_file_location_line = file == null ? void 0 : (_file_location = file.location) == null ? void 0 : _file_location.line) != null ? _file_location_line : 1,
        column: (_file_location_column = file == null ? void 0 : (_file_location1 = file.location) == null ? void 0 : _file_location1.column) != null ? _file_location_column : 0
    });
    var _file_fileName, _file_location_line1, _file_location_column1;
    const stackFrame = {
        file: (_file_fileName = file == null ? void 0 : file.fileName) != null ? _file_fileName : null,
        methodName: '',
        arguments: [],
        lineNumber: (_file_location_line1 = file == null ? void 0 : (_file_location2 = file.location) == null ? void 0 : _file_location2.line) != null ? _file_location_line1 : null,
        column: (_file_location_column1 = file == null ? void 0 : (_file_location3 = file.location) == null ? void 0 : _file_location3.column) != null ? _file_location_column1 : null
    };
    const fileExtension = stackFrame == null ? void 0 : (_stackFrame_file = stackFrame.file) == null ? void 0 : _stackFrame_file.split('.').pop();
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        "data-nextjs-codeframe": true,
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "code-frame-header",
                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "code-frame-link",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                            className: "code-frame-icon",
                            children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_file.FileIcon, {
                                lang: fileExtension
                            })
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                            "data-text": true,
                            children: (0, _stackframe.getFrameSource)(stackFrame)
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            "aria-label": "Open in editor",
                            "data-with-open-in-editor-link-source-file": true,
                            onClick: open,
                            children: /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "code-frame-icon",
                                "data-icon": "right",
                                children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_external.ExternalIcon, {
                                    width: 16,
                                    height: 16
                                })
                            })
                        })
                    ]
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("pre", {
                className: "code-frame-pre",
                children: [
                    decoded.map((entry, index)=>/*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                            style: {
                                color: entry.fg ? "var(--color-" + entry.fg + ")" : undefined,
                                ...entry.decoration === 'bold' ? // having longer width than expected on Geist Mono font-weight
                                // above 600, hence a temporary fix is to use 500 for bold.
                                {
                                    fontWeight: 500
                                } : entry.decoration === 'italic' ? {
                                    fontStyle: 'italic'
                                } : undefined
                            },
                            children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_hotlinkedtext.HotlinkedText, {
                                text: entry.content
                            })
                        }, "terminal-entry-" + index)),
                    importTraceFiles.map((importTraceFile)=>/*#__PURE__*/ (0, _jsxruntime.jsx)(_editorlink.EditorLink, {
                            isSourceFile: false,
                            file: importTraceFile
                        }, importTraceFile))
                ]
            })
        ]
    });
};
const TERMINAL_STYLES = "\n  [data-nextjs-terminal]::selection,\n  [data-nextjs-terminal] *::selection {\n    background-color: var(--color-ansi-selection);\n  }\n\n  [data-nextjs-terminal] * {\n    color: inherit;\n    background-color: transparent;\n    font-family: var(--font-stack-monospace);\n  }\n\n  [data-nextjs-terminal] > div > p {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    cursor: pointer;\n    margin: 0;\n  }\n  [data-nextjs-terminal] > div > p:hover {\n    text-decoration: underline dotted;\n  }\n  [data-nextjs-terminal] div > pre {\n    overflow: hidden;\n    display: inline-block;\n  }\n";

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=terminal.js.map