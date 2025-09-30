import { findSourceMap as nativeFindSourceMap } from 'module';
import * as path from 'path';
import * as url from 'url';
import { SourceMapConsumer as SyncSourceMapConsumer } from 'next/dist/compiled/source-map';
import { parseStack } from '../client/components/react-dev-overlay/server/middleware-webpack';
import { getOriginalCodeFrame } from '../client/components/react-dev-overlay/server/shared';
import { workUnitAsyncStorage } from './app-render/work-unit-async-storage.external';
import { dim } from '../lib/picocolors';
// Find a source map using the bundler's API.
// This is only a fallback for when Node.js fails to due to bugs e.g. https://github.com/nodejs/node/issues/52102
// TODO: Remove once all supported Node.js versions are fixed.
// TODO(veil): Set from Webpack as well
let bundlerFindSourceMapPayload = ()=>undefined;
export function setBundlerFindSourceMapImplementation(findSourceMapImplementation) {
    bundlerFindSourceMapPayload = findSourceMapImplementation;
}
function frameToString(frame) {
    let sourceLocation = frame.lineNumber !== null ? `:${frame.lineNumber}` : '';
    if (frame.column !== null && sourceLocation !== '') {
        sourceLocation += `:${frame.column}`;
    }
    let fileLocation;
    if (frame.file !== null && frame.file.startsWith('file://') && URL.canParse(frame.file)) {
        // If not relative to CWD, the path is ambiguous to IDEs and clicking will prompt to select the file first.
        // In a multi-app repo, this leads to potentially larger file names but will make clicking snappy.
        // There's no tradeoff for the cases where `dir` in `next dev [dir]` is omitted
        // since relative to cwd is both the shortest and snappiest.
        fileLocation = path.relative(process.cwd(), url.fileURLToPath(frame.file));
    } else if (frame.file !== null && frame.file.startsWith('/')) {
        fileLocation = path.relative(process.cwd(), frame.file);
    } else {
        fileLocation = frame.file;
    }
    return frame.methodName ? `    at ${frame.methodName} (${fileLocation}${sourceLocation})` : `    at ${fileLocation}${sourceLocation}`;
}
function computeErrorName(error) {
    // TODO: Node.js seems to use a different algorithm
    // class ReadonlyRequestCookiesError extends Error {}` would read `ReadonlyRequestCookiesError: [...]`
    // in the stack i.e. seems like under certain conditions it favors the constructor name.
    return error.name || 'Error';
}
function prepareUnsourcemappedStackTrace(error, structuredStackTrace) {
    const name = computeErrorName(error);
    const message = error.message || '';
    let stack = name + ': ' + message;
    for(let i = 0; i < structuredStackTrace.length; i++){
        stack += '\n    at ' + structuredStackTrace[i].toString();
    }
    return stack;
}
function shouldIgnoreListGeneratedFrame(file) {
    return file.startsWith('node:') || file.includes('node_modules');
}
function shouldIgnoreListOriginalFrame(file) {
    return file.includes('node_modules');
}
/**
 * Finds the sourcemap payload applicable to a given frame.
 * Equal to the input unless an Index Source Map is used.
 */ function findApplicableSourceMapPayload(frame, payload) {
    if ('sections' in payload) {
        const frameLine = frame.lineNumber ?? 0;
        const frameColumn = frame.column ?? 0;
        // Sections must not overlap and must be sorted: https://tc39.es/source-map/#section-object
        // Therefore the last section that has an offset less than or equal to the frame is the applicable one.
        // TODO(veil): Binary search
        let section = payload.sections[0];
        for(let i = 0; i < payload.sections.length && payload.sections[i].offset.line <= frameLine && payload.sections[i].offset.column <= frameColumn; i++){
            section = payload.sections[i];
        }
        return section === undefined ? undefined : section.map;
    } else {
        return payload;
    }
}
function createUnsourcemappedFrame(frame) {
    return {
        stack: {
            arguments: frame.arguments,
            column: frame.column,
            file: frame.file,
            lineNumber: frame.lineNumber,
            methodName: frame.methodName,
            ignored: shouldIgnoreListGeneratedFrame(frame.file)
        },
        code: null
    };
}
/**
 * @param frame
 * @param sourceMapCache
 * @returns The original frame if not sourcemapped.
 */ function getSourcemappedFrameIfPossible(frame, sourceMapCache, inspectOptions) {
    var _frame_methodName_replace, _frame_methodName;
    const sourceMapCacheEntry = sourceMapCache.get(frame.file);
    let sourceMapConsumer;
    let sourceMapPayload;
    if (sourceMapCacheEntry === undefined) {
        let sourceURL = frame.file;
        // e.g. "/APP/.next/server/chunks/ssr/[root-of-the-server]__2934a0._.js"
        // will be keyed by Node.js as "file:///APP/.next/server/chunks/ssr/[root-of-the-server]__2934a0._.js".
        // This is likely caused by `callsite.toString()` in `Error.prepareStackTrace converting file URLs to paths.
        if (sourceURL.startsWith('/')) {
            sourceURL = url.pathToFileURL(frame.file).toString();
        }
        let maybeSourceMapPayload;
        try {
            const sourceMap = nativeFindSourceMap(sourceURL);
            maybeSourceMapPayload = sourceMap == null ? void 0 : sourceMap.payload;
        } catch (cause) {
            // We should not log an actual error instance here because that will re-enter
            // this codepath during error inspection and could lead to infinite recursion.
            console.error(`${sourceURL}: Invalid source map. Only conformant source maps can be used to find the original code. Cause: ${cause}`);
            // If loading fails once, it'll fail every time.
            // So set the cache to avoid duplicate errors.
            sourceMapCache.set(frame.file, null);
            // Don't even fall back to the bundler because it might be not as strict
            // with regards to parsing and then we fail later once we consume the
            // source map payload.
            // This essentially avoids a redundant error where we fail here and then
            // later on consumption because the bundler just handed back an invalid
            // source map.
            return createUnsourcemappedFrame(frame);
        }
        if (maybeSourceMapPayload === undefined) {
            maybeSourceMapPayload = bundlerFindSourceMapPayload(sourceURL);
        }
        if (maybeSourceMapPayload === undefined) {
            return createUnsourcemappedFrame(frame);
        }
        sourceMapPayload = maybeSourceMapPayload;
        try {
            sourceMapConsumer = new SyncSourceMapConsumer(// @ts-expect-error -- Module.SourceMap['version'] is number but SyncSourceMapConsumer wants a string
            sourceMapPayload);
        } catch (cause) {
            // We should not log an actual error instance here because that will re-enter
            // this codepath during error inspection and could lead to infinite recursion.
            console.error(`${sourceURL}: Invalid source map. Only conformant source maps can be used to find the original code. Cause: ${cause}`);
            // If creating the consumer fails once, it'll fail every time.
            // So set the cache to avoid duplicate errors.
            sourceMapCache.set(frame.file, null);
            return createUnsourcemappedFrame(frame);
        }
        sourceMapCache.set(frame.file, {
            map: sourceMapConsumer,
            payload: sourceMapPayload
        });
    } else if (sourceMapCacheEntry === null) {
        // We failed earlier getting the payload or consumer.
        // Just return an unsourcemapped frame.
        // Errors will already be logged.
        return createUnsourcemappedFrame(frame);
    } else {
        sourceMapConsumer = sourceMapCacheEntry.map;
        sourceMapPayload = sourceMapCacheEntry.payload;
    }
    const sourcePosition = sourceMapConsumer.originalPositionFor({
        column: frame.column ?? 0,
        line: frame.lineNumber ?? 1
    });
    if (sourcePosition.source === null) {
        return {
            stack: {
                arguments: frame.arguments,
                column: frame.column,
                file: frame.file,
                lineNumber: frame.lineNumber,
                methodName: frame.methodName,
                ignored: shouldIgnoreListGeneratedFrame(frame.file)
            },
            code: null
        };
    }
    const sourceContent = sourceMapConsumer.sourceContentFor(sourcePosition.source, /* returnNullOnMissing */ true) ?? null;
    const applicableSourceMap = findApplicableSourceMapPayload(frame, sourceMapPayload);
    // TODO(veil): Upstream a method to sourcemap consumer that immediately says if a frame is ignored or not.
    let ignored = false;
    if (applicableSourceMap === undefined) {
        console.error('No applicable source map found in sections for frame', frame);
    } else if (shouldIgnoreListOriginalFrame(sourcePosition.source)) {
        // Externals may be libraries that don't ship ignoreLists.
        // This is really taking control away from libraries.
        // They should still ship `ignoreList` so that attached debuggers ignore-list their frames.
        // TODO: Maybe only ignore library sourcemaps if `ignoreList` is absent?
        // Though keep in mind that Turbopack omits empty `ignoreList`.
        // So if we establish this convention, we should communicate it to the ecosystem.
        ignored = true;
    } else {
        var _applicableSourceMap_ignoreList;
        // TODO: O(n^2). Consider moving `ignoreList` into a Set
        const sourceIndex = applicableSourceMap.sources.indexOf(sourcePosition.source);
        ignored = ((_applicableSourceMap_ignoreList = applicableSourceMap.ignoreList) == null ? void 0 : _applicableSourceMap_ignoreList.includes(sourceIndex)) ?? false;
    }
    const originalFrame = {
        // We ignore the sourcemapped name since it won't be the correct name.
        // The callsite will point to the column of the variable name instead of the
        // name of the enclosing function.
        // TODO(NDX-531): Spy on prepareStackTrace to get the enclosing line number for method name mapping.
        methodName: (_frame_methodName = frame.methodName) == null ? void 0 : (_frame_methodName_replace = _frame_methodName.replace('__WEBPACK_DEFAULT_EXPORT__', 'default')) == null ? void 0 : _frame_methodName_replace.replace('__webpack_exports__.', ''),
        column: sourcePosition.column,
        file: sourcePosition.source,
        lineNumber: sourcePosition.line,
        // TODO: c&p from async createOriginalStackFrame but why not frame.arguments?
        arguments: [],
        ignored
    };
    const codeFrame = process.env.NODE_ENV !== 'production' ? getOriginalCodeFrame(originalFrame, sourceContent, inspectOptions.colors) : null;
    return {
        stack: originalFrame,
        code: codeFrame
    };
}
function parseAndSourceMap(error, inspectOptions) {
    // TODO(veil): Expose as CLI arg or config option. Useful for local debugging.
    const showIgnoreListed = false;
    // We overwrote Error.prepareStackTrace earlier so error.stack is not sourcemapped.
    let unparsedStack = String(error.stack);
    // We could just read it from `error.stack`.
    // This works around cases where a 3rd party `Error.prepareStackTrace` implementation
    // doesn't implement the name computation correctly.
    const errorName = computeErrorName(error);
    let idx = unparsedStack.indexOf('react-stack-bottom-frame');
    if (idx !== -1) {
        idx = unparsedStack.lastIndexOf('\n', idx);
    }
    if (idx !== -1 && !showIgnoreListed) {
        // Cut off everything after the bottom frame since it'll be React internals.
        unparsedStack = unparsedStack.slice(0, idx);
    }
    const unsourcemappedStack = parseStack(unparsedStack);
    const sourceMapCache = new Map();
    let sourceMappedStack = '';
    let sourceFrameDEV = null;
    for (const frame of unsourcemappedStack){
        if (frame.file === null) {
            sourceMappedStack += '\n' + frameToString(frame);
        } else {
            const sourcemappedFrame = getSourcemappedFrameIfPossible(// We narrowed this earlier by bailing if `frame.file` is null.
            frame, sourceMapCache, inspectOptions);
            if (process.env.NODE_ENV !== 'production' && sourcemappedFrame.code !== null && sourceFrameDEV === null && // TODO: Is this the right choice?
            !sourcemappedFrame.stack.ignored) {
                sourceFrameDEV = sourcemappedFrame.code;
            }
            if (!sourcemappedFrame.stack.ignored) {
                // TODO: Consider what happens if every frame is ignore listed.
                sourceMappedStack += '\n' + frameToString(sourcemappedFrame.stack);
            } else if (showIgnoreListed && !inspectOptions.colors) {
                sourceMappedStack += '\n' + frameToString(sourcemappedFrame.stack);
            } else if (showIgnoreListed) {
                sourceMappedStack += '\n' + dim(frameToString(sourcemappedFrame.stack));
            }
        }
    }
    return errorName + ': ' + error.message + sourceMappedStack + (sourceFrameDEV !== null ? '\n' + sourceFrameDEV : '');
}
function sourceMapError(error, inspectOptions) {
    // Create a new Error object with the source mapping applied and then use native
    // Node.js formatting on the result.
    const newError = error.cause !== undefined ? Object.defineProperty(new Error(error.message, {
        cause: error.cause
    }), "__NEXT_ERROR_CODE", {
        value: "E394",
        enumerable: false,
        configurable: true
    }) : Object.defineProperty(new Error(error.message), "__NEXT_ERROR_CODE", {
        value: "E394",
        enumerable: false,
        configurable: true
    });
    // TODO: Ensure `class MyError extends Error {}` prints `MyError` as the name
    newError.stack = parseAndSourceMap(error, inspectOptions);
    for(const key in error){
        if (!Object.prototype.hasOwnProperty.call(newError, key)) {
            // @ts-expect-error -- We're copying all enumerable properties.
            // So they definitely exist on `this` and obviously have no type on `newError` (yet)
            newError[key] = error[key];
        }
    }
    return newError;
}
export function patchErrorInspectNodeJS(errorConstructor) {
    const inspectSymbol = Symbol.for('nodejs.util.inspect.custom');
    errorConstructor.prepareStackTrace = prepareUnsourcemappedStackTrace;
    // @ts-expect-error -- TODO upstream types
    // eslint-disable-next-line no-extend-native -- We're not extending but overriding.
    errorConstructor.prototype[inspectSymbol] = function(depth, inspectOptions, inspect) {
        // avoid false-positive dynamic i/o warnings e.g. due to usage of `Math.random` in `source-map`.
        return workUnitAsyncStorage.exit(()=>{
            const newError = sourceMapError(this, inspectOptions);
            const originalCustomInspect = newError[inspectSymbol];
            // Prevent infinite recursion.
            // { customInspect: false } would result in `error.cause` not using our inspect.
            Object.defineProperty(newError, inspectSymbol, {
                value: undefined,
                enumerable: false,
                writable: true
            });
            try {
                return inspect(newError, {
                    ...inspectOptions,
                    depth: (inspectOptions.depth ?? // Default in Node.js
                    2) - depth
                });
            } finally{
                ;
                newError[inspectSymbol] = originalCustomInspect;
            }
        });
    };
}
export function patchErrorInspectEdgeLite(errorConstructor) {
    const inspectSymbol = Symbol.for('edge-runtime.inspect.custom');
    errorConstructor.prepareStackTrace = prepareUnsourcemappedStackTrace;
    // @ts-expect-error -- TODO upstream types
    // eslint-disable-next-line no-extend-native -- We're not extending but overriding.
    errorConstructor.prototype[inspectSymbol] = function({ format }) {
        // avoid false-positive dynamic i/o warnings e.g. due to usage of `Math.random` in `source-map`.
        return workUnitAsyncStorage.exit(()=>{
            const newError = sourceMapError(this, {});
            const originalCustomInspect = newError[inspectSymbol];
            // Prevent infinite recursion.
            Object.defineProperty(newError, inspectSymbol, {
                value: undefined,
                enumerable: false,
                writable: true
            });
            try {
                return format(newError);
            } finally{
                ;
                newError[inspectSymbol] = originalCustomInspect;
            }
        });
    };
}

//# sourceMappingURL=patch-error-inspect.js.map