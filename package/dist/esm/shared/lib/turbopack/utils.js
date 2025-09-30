import { bold, green, magenta, red } from '../../../lib/picocolors';
import isInternal from '../is-internal';
import { decodeMagicIdentifier, MAGIC_IDENTIFIER_REGEX } from '../magic-identifier';
import * as Log from '../../../build/output/log';
import loadJsConfig from '../../../build/load-jsconfig';
import { eventErrorThrown } from '../../../telemetry/events';
import { traceGlobals } from '../../../trace/shared';
// An error generated from emitted Turbopack issues. This can include build
// errors caused by issues with user code.
export class ModuleBuildError extends Error {
    constructor(...args){
        super(...args), this.name = 'ModuleBuildError';
    }
}
// An error caused by an internal issue in Turbopack. These should be written
// to a log file and details should not be shown to the user.
export class TurbopackInternalError extends Error {
    static createAndRecordTelemetry(cause) {
        const error = new TurbopackInternalError(cause);
        const telemetry = traceGlobals.get('telemetry');
        if (telemetry) {
            telemetry.record(eventErrorThrown(error));
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
/**
 * Thin stopgap workaround layer to mimic existing wellknown-errors-plugin in webpack's build
 * to emit certain type of errors into cli.
 */ export function isWellKnownError(issue) {
    const { title } = issue;
    const formattedTitle = renderStyledStringToErrorAnsi(title);
    // TODO: add more well known errors
    if (formattedTitle.includes('Module not found') || formattedTitle.includes('Unknown module type')) {
        return true;
    }
    return false;
}
export function getIssueKey(issue) {
    return issue.severity + "-" + issue.filePath + "-" + JSON.stringify(issue.title) + "-" + JSON.stringify(issue.description);
}
export async function getTurbopackJsConfig(dir, nextConfig) {
    const { jsConfig } = await loadJsConfig(dir, nextConfig);
    return jsConfig != null ? jsConfig : {
        compilerOptions: {}
    };
}
export function processIssues(currentEntryIssues, key, result, throwIssue, logErrors) {
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
                Log.error(formatted);
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
export function formatIssue(issue) {
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
    !isInternal(filePath)) {
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
export function isRelevantWarning(issue) {
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
export function renderStyledStringToErrorAnsi(string) {
    function decodeMagicIdentifiers(str) {
        return str.replaceAll(MAGIC_IDENTIFIER_REGEX, (ident)=>{
            try {
                return magenta("{" + decodeMagicIdentifier(ident) + "}");
            } catch (e) {
                return magenta("{" + ident + " (decoding failed: " + e + ")}");
            }
        });
    }
    switch(string.type){
        case 'text':
            return decodeMagicIdentifiers(string.value);
        case 'strong':
            return bold(red(decodeMagicIdentifiers(string.value)));
        case 'code':
            return green(decodeMagicIdentifiers(string.value));
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
export function isPersistentCachingEnabled(config) {
    var _config_experimental;
    return ((_config_experimental = config.experimental) == null ? void 0 : _config_experimental.turbopackPersistentCaching) || false;
}

//# sourceMappingURL=utils.js.map