"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    getEntryInfo: null,
    getInfo: null,
    getSource: null,
    getSourceFromVirtualTsEnv: null,
    getTs: null,
    getTypeChecker: null,
    init: null,
    isAppEntryFile: null,
    isDefaultFunctionExport: null,
    isInsideApp: null,
    isPageFile: null,
    isPositionInsideNode: null,
    log: null,
    removeStringQuotes: null,
    virtualTsEnv: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getEntryInfo: function() {
        return getEntryInfo;
    },
    getInfo: function() {
        return getInfo;
    },
    getSource: function() {
        return getSource;
    },
    getSourceFromVirtualTsEnv: function() {
        return getSourceFromVirtualTsEnv;
    },
    getTs: function() {
        return getTs;
    },
    getTypeChecker: function() {
        return getTypeChecker;
    },
    init: function() {
        return init;
    },
    isAppEntryFile: function() {
        return isAppEntryFile;
    },
    isDefaultFunctionExport: function() {
        return isDefaultFunctionExport;
    },
    isInsideApp: function() {
        return isInsideApp;
    },
    isPageFile: function() {
        return isPageFile;
    },
    isPositionInsideNode: function() {
        return isPositionInsideNode;
    },
    log: function() {
        return log;
    },
    removeStringQuotes: function() {
        return removeStringQuotes;
    },
    virtualTsEnv: function() {
        return virtualTsEnv;
    }
});
const _vfs = require("next/dist/compiled/@typescript/vfs");
const _path = /*#__PURE__*/ _interop_require_wildcard(require("path"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
let ts;
let info;
let appDirRegExp;
let virtualTsEnv;
function log(message) {
    info.project.projectService.logger.info('[next] ' + message);
}
function init(opts) {
    const projectDir = opts.info.project.getCurrentDirectory();
    ts = opts.ts;
    info = opts.info;
    appDirRegExp = new RegExp('^' + (projectDir + '(/src)?/app').replace(/[\\/]/g, '[\\/]'));
    log('Initializing Next.js TypeScript plugin: ' + projectDir);
    const compilerOptions = info.project.getCompilerOptions();
    const fsMap = (0, _vfs.createDefaultMapFromNodeModules)(compilerOptions, ts, (0, _path.join)(projectDir, 'node_modules/typescript/lib'));
    const system = (0, _vfs.createFSBackedSystem)(fsMap, projectDir, ts);
    virtualTsEnv = (0, _vfs.createVirtualTypeScriptEnvironment)(system, [], ts, compilerOptions);
    if (!virtualTsEnv) {
        log('Failed to create virtual TypeScript environment. This is a bug in Next.js TypeScript plugin. Please report it by opening an issue at https://github.com/vercel/next.js/issues.');
        return false;
    }
    log('Successfully initialized Next.js TypeScript plugin!');
    return true;
}
function getTs() {
    return ts;
}
function getInfo() {
    return info;
}
function getTypeChecker() {
    var _info_languageService_getProgram;
    return (_info_languageService_getProgram = info.languageService.getProgram()) == null ? void 0 : _info_languageService_getProgram.getTypeChecker();
}
function getSource(fileName) {
    var _info_languageService_getProgram;
    return (_info_languageService_getProgram = info.languageService.getProgram()) == null ? void 0 : _info_languageService_getProgram.getSourceFile(fileName);
}
function getSourceFromVirtualTsEnv(fileName) {
    if (virtualTsEnv.sys.fileExists(fileName)) {
        return virtualTsEnv.getSourceFile(fileName);
    }
    return getSource(fileName);
}
function removeStringQuotes(str) {
    return str.replace(/^['"`]|['"`]$/g, '');
}
const isPositionInsideNode = (position, node)=>{
    const start = node.getFullStart();
    return start <= position && position <= node.getFullWidth() + start;
};
const isDefaultFunctionExport = (node)=>{
    if (ts.isFunctionDeclaration(node)) {
        let hasExportKeyword = false;
        let hasDefaultKeyword = false;
        if (node.modifiers) {
            for (const modifier of node.modifiers){
                if (modifier.kind === ts.SyntaxKind.ExportKeyword) {
                    hasExportKeyword = true;
                } else if (modifier.kind === ts.SyntaxKind.DefaultKeyword) {
                    hasDefaultKeyword = true;
                }
            }
        }
        // `export default function`
        if (hasExportKeyword && hasDefaultKeyword) {
            return true;
        }
    }
    return false;
};
const isInsideApp = (filePath)=>{
    return appDirRegExp.test(filePath);
};
const isAppEntryFile = (filePath)=>{
    return appDirRegExp.test(filePath) && /^(page|layout)\.(mjs|js|jsx|ts|tsx)$/.test(_path.default.basename(filePath));
};
const isPageFile = (filePath)=>{
    return appDirRegExp.test(filePath) && /^page\.(mjs|js|jsx|ts|tsx)$/.test(_path.default.basename(filePath));
};
function getEntryInfo(fileName, throwOnInvalidDirective) {
    const source = getSource(fileName);
    if (source) {
        let isDirective = true;
        let isClientEntry = false;
        let isServerEntry = false;
        ts.forEachChild(source, (node)=>{
            if (ts.isExpressionStatement(node) && ts.isStringLiteral(node.expression)) {
                if (node.expression.text === 'use client') {
                    if (isDirective) {
                        isClientEntry = true;
                    } else {
                        if (throwOnInvalidDirective) {
                            const e = {
                                messageText: 'The `"use client"` directive must be put at the top of the file.',
                                start: node.expression.getStart(),
                                length: node.expression.getWidth()
                            };
                            throw e;
                        }
                    }
                } else if (node.expression.text === 'use server') {
                    if (isDirective) {
                        isServerEntry = true;
                    } else {
                        if (throwOnInvalidDirective) {
                            const e = {
                                messageText: 'The `"use server"` directive must be put at the top of the file.',
                                start: node.expression.getStart(),
                                length: node.expression.getWidth()
                            };
                            throw e;
                        }
                    }
                }
                if (isClientEntry && isServerEntry) {
                    const e = {
                        messageText: 'Cannot use both "use client" and "use server" directives in the same file.',
                        start: node.expression.getStart(),
                        length: node.expression.getWidth()
                    };
                    throw e;
                }
            } else {
                isDirective = false;
            }
        });
        return {
            client: isClientEntry,
            server: isServerEntry
        };
    }
    return {
        client: false,
        server: false
    };
}

//# sourceMappingURL=utils.js.map