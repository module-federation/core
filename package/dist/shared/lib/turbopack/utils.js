"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    ModuleBuildError: null,
    TurbopackInternalError: null,
    formatIssue: null,
    getIssueKey: null,
    getTurbopackJsConfig: null,
    isPersistentCachingEnabled: null,
    isRelevantWarning: null,
    isWellKnownError: null,
    processIssues: null,
    renderStyledStringToErrorAnsi: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    ModuleBuildError: function() {
        return ModuleBuildError;
    },
    TurbopackInternalError: function() {
        return TurbopackInternalError;
    },
    formatIssue: function() {
        return formatIssue;
    },
    getIssueKey: function() {
        return getIssueKey;
    },
    getTurbopackJsConfig: function() {
        return getTurbopackJsConfig;
    },
    isPersistentCachingEnabled: function() {
        return isPersistentCachingEnabled;
    },
    isRelevantWarning: function() {
        return isRelevantWarning;
    },
    isWellKnownError: function() {
        return isWellKnownError;
    },
    processIssues: function() {
        return processIssues;
    },
    renderStyledStringToErrorAnsi: function() {
        return renderStyledStringToErrorAnsi;
    }
});
const _interop_require_default = require("@swc/helpers/_/_interop_require_default");
const _interop_require_wildcard = require("@swc/helpers/_/_interop_require_wildcard");
const _picocolors = require("../../../lib/picocolors");
const _isinternal = /*#__PURE__*/ _interop_require_default._(require("../is-internal"));
const _magicidentifier = require("../magic-identifier");
const _log = /*#__PURE__*/ _interop_require_wildcard._(require("../../../build/output/log"));
const _loadjsconfig = /*#__PURE__*/ _interop_require_default._(require("../../../build/load-jsconfig"));
const _events = require("../../../telemetry/events");
const _shared = require("../../../trace/shared");
class ModuleBuildError extends Error {
    constructor(...args){
        super(...args), this.name = 'ModuleBuildError';
    }
}
class TurbopackInternalError extends Error {
    static createAndRecordTelemetry(cause) {
        const error = new TurbopackInternalError(cause);
        const telemetry = _shared.traceGlobals.get('telemetry');
        if (telemetry) {
            telemetry.record((0, _events.eventErrorThrown)(error));
        } else {
            console.error('Expected `telemetry` to be set in globals');
        }
        return error;
    }
    constructor(cause){
        super(cause.message), this.name = 'TurbopackInternalError', // Manually set this as this isn't statically determinable
        this.__NEXT_ERROR_CODE = 'TurbopackInternalError';
        this.stack = cause.stack;
    }
}
function isWellKnownError(issue) {
    const { title } = issue;
    const formattedTitle = renderStyledStringToErrorAnsi(title);
    // TODO: add more well known errors
    if (formattedTitle.includes('Module not found') || formattedTitle.includes('Unknown module type')) {
        return true;
    }
    return false;
}
function getIssueKey(issue) {
    return issue.severity + "-" + issue.filePath + "-" + JSON.stringify(issue.title) + "-" + JSON.stringify(issue.description);
}
async function getTurbopackJsConfig(dir, nextConfig) {
    const { jsConfig } = await (0, _loadjsconfig.default)(dir, nextConfig);
    return jsConfig != null ? jsConfig : {
        compilerOptions: {}
    };
}
function processIssues(currentEntryIssues, key, result, throwIssue, logErrors) {
    const newIssues = new Map();
    currentEntryIssues.set(key, newIssues);
    const relevantIssues = new Set();
    for (const issue of result.issues){
        if (issue.severity !== 'error' && issue.severity !== 'fatal' && issue.severity !== 'warning') continue;
        const issueKey = getIssueKey(issue);
        newIssues.set(issueKey, issue);
        if (issue.severity !== 'warning') {
            if (throwIssue) {
                const formatted = formatIssue(issue);
                relevantIssues.add(formatted);
            } else if (logErrors && isWellKnownError(issue)) {
                const formatted = formatIssue(issue);
                _log.error(formatted);
            }
        }
    }
    if (relevantIssues.size && throwIssue) {
        throw Object.defineProperty(new ModuleBuildError([
            ...relevantIssues
        ].join('\n\n')), "__NEXT_ERROR_CODE", {
            value: "E394",
            enumerable: false,
            configurable: true
        });
    }
}
function formatIssue(issue) {
    const { filePath, title, description, source } = issue;
    let { documentationLink } = issue;
    let formattedTitle = renderStyledStringToErrorAnsi(title).replace(/\n/g, '\n    ');
    // TODO: Use error codes to identify these
    // TODO: Generalize adapting Turbopack errors to Next.js errors
    if (formattedTitle.includes('Module not found')) {
        // For compatiblity with webpack
        // TODO: include columns in webpack errors.
        documentationLink = 'https://nextjs.org/docs/messages/module-not-found';
    }
    let formattedFilePath = filePath.replace('[project]/', './').replaceAll('/./', '/').replace('\\\\?\\', '');
    let message = '';
    if (source && source.range) {
        const { start } = source.range;
        message = formattedFilePath + ":" + (start.line + 1) + ":" + (start.column + 1) + "\n" + formattedTitle;
    } else if (formattedFilePath) {
        message = formattedFilePath + "\n" + formattedTitle;
    } else {
        message = formattedTitle;
    }
    message += '\n';
    if ((source == null ? void 0 : source.range) && source.source.content && // ignore Next.js/React internals, as these can often be huge bundled files.
    !(0, _isinternal.default)(filePath)) {
        const { start, end } = source.range;
        const { codeFrameColumns } = require('next/dist/compiled/babel/code-frame');
        message += codeFrameColumns(source.source.content, {
            start: {
                line: start.line + 1,
                column: start.column + 1
            },
            end: {
                line: end.line + 1,
                column: end.column + 1
            }
        }, {
            forceColor: true
        }).trim() + '\n\n';
    }
    if (description) {
        message += renderStyledStringToErrorAnsi(description) + '\n\n';
    }
    // TODO: make it possible to enable this for debugging, but not in tests.
    // if (detail) {
    //   message += renderStyledStringToErrorAnsi(detail) + '\n\n'
    // }
    // TODO: Include a trace from the issue.
    if (documentationLink) {
        message += documentationLink + '\n\n';
    }
    return message;
}
function isRelevantWarning(issue) {
    return issue.severity === 'warning' && !isNodeModulesIssue(issue);
}
function isNodeModulesIssue(issue) {
    if (issue.severity === 'warning' && issue.stage === 'config') {
        // Override for the externalize issue
        // `Package foo (serverExternalPackages or default list) can't be external`
        if (renderStyledStringToErrorAnsi(issue.title).includes("can't be external")) {
            return false;
        }
    }
    return issue.severity === 'warning' && (issue.filePath.match(/^(?:.*[\\/])?node_modules(?:[\\/].*)?$/) !== null || // Ignore Next.js itself when running next directly in the monorepo where it is not inside
    // node_modules anyway.
    // TODO(mischnic) prevent matches when this is published to npm
    issue.filePath.startsWith('[project]/packages/next/'));
}
function renderStyledStringToErrorAnsi(string) {
    function decodeMagicIdentifiers(str) {
        return str.replaceAll(_magicidentifier.MAGIC_IDENTIFIER_REGEX, (ident)=>{
            try {
                return (0, _picocolors.magenta)("{" + (0, _magicidentifier.decodeMagicIdentifier)(ident) + "}");
            } catch (e) {
                return (0, _picocolors.magenta)("{" + ident + " (decoding failed: " + e + ")}");
            }
        });
    }
    switch(string.type){
        case 'text':
            return decodeMagicIdentifiers(string.value);
        case 'strong':
            return (0, _picocolors.bold)((0, _picocolors.red)(decodeMagicIdentifiers(string.value)));
        case 'code':
            return (0, _picocolors.green)(decodeMagicIdentifiers(string.value));
        case 'line':
            return string.value.map(renderStyledStringToErrorAnsi).join('');
        case 'stack':
            return string.value.map(renderStyledStringToErrorAnsi).join('\n');
        default:
            throw Object.defineProperty(new Error('Unknown StyledString type', string), "__NEXT_ERROR_CODE", {
                value: "E138",
                enumerable: false,
                configurable: true
            });
    }
}
function isPersistentCachingEnabled(config) {
    var _config_experimental;
    return ((_config_experimental = config.experimental) == null ? void 0 : _config_experimental.turbopackPersistentCaching) || false;
}

//# sourceMappingURL=utils.js.map