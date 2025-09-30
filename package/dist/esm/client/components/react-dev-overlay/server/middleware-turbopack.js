import { getOriginalCodeFrame } from './shared';
import { middlewareResponse } from './middleware-response';
import fs, { constants as FS } from 'fs/promises';
import path from 'path';
import url from 'url';
import { launchEditor } from '../utils/launch-editor';
import { SourceMapConsumer } from 'next/dist/compiled/source-map08';
import { getSourceMapFromFile } from '../utils/get-source-map-from-file';
import { findSourceMap } from 'node:module';
import { pathToFileURL } from 'node:url';
import { inspect } from 'node:util';
function shouldIgnorePath(modulePath) {
    return modulePath.includes('node_modules') || // Only relevant for when Next.js is symlinked e.g. in the Next.js monorepo
    modulePath.includes('next/dist') || modulePath.startsWith('node:');
}
const currentSourcesByFile = new Map();
async function batchedTraceSource(project, frame) {
    const file = frame.file ? decodeURIComponent(frame.file) : undefined;
    if (!file) return;
    // For node internals they cannot traced the actual source code with project.traceSource,
    // we need an early return to indicate it's ignored to avoid the unknown scheme error from `project.traceSource`.
    if (file.startsWith('node:')) {
        var _frame_line, _frame_column, _frame_methodName;
        return {
            frame: {
                file,
                lineNumber: (_frame_line = frame.line) != null ? _frame_line : 0,
                column: (_frame_column = frame.column) != null ? _frame_column : 0,
                methodName: (_frame_methodName = frame.methodName) != null ? _frame_methodName : '<unknown>',
                ignored: true,
                arguments: []
            },
            source: null
        };
    }
    const currentDirectoryFileUrl = pathToFileURL(process.cwd()).href;
    const sourceFrame = await project.traceSource(frame, currentDirectoryFileUrl);
    if (!sourceFrame) {
        var _frame_line1, _frame_column1, _frame_methodName1;
        return {
            frame: {
                file,
                lineNumber: (_frame_line1 = frame.line) != null ? _frame_line1 : 0,
                column: (_frame_column1 = frame.column) != null ? _frame_column1 : 0,
                methodName: (_frame_methodName1 = frame.methodName) != null ? _frame_methodName1 : '<unknown>',
                ignored: shouldIgnorePath(file),
                arguments: []
            },
            source: null
        };
    }
    let source = null;
    const originalFile = sourceFrame.originalFile;
    // Don't look up source for node_modules or internals. These can often be large bundled files.
    const ignored = shouldIgnorePath(originalFile != null ? originalFile : sourceFrame.file) || // isInternal means resource starts with turbopack:///[turbopack]
    !!sourceFrame.isInternal;
    if (originalFile && !ignored) {
        let sourcePromise = currentSourcesByFile.get(originalFile);
        if (!sourcePromise) {
            sourcePromise = project.getSourceForAsset(originalFile);
            currentSourcesByFile.set(originalFile, sourcePromise);
            setTimeout(()=>{
                // Cache file reads for 100ms, as frames will often reference the same
                // files and can be large.
                currentSourcesByFile.delete(originalFile);
            }, 100);
        }
        source = await sourcePromise;
    }
    var _sourceFrame_line, _sourceFrame_column, // We ignore the sourcemapped name since it won't be the correct name.
    // The callsite will point to the column of the variable name instead of the
    // name of the enclosing function.
    // TODO(NDX-531): Spy on prepareStackTrace to get the enclosing line number for method name mapping.
    _frame_methodName2;
    // TODO: get ignoredList from turbopack source map
    const ignorableFrame = {
        file: sourceFrame.file,
        lineNumber: (_sourceFrame_line = sourceFrame.line) != null ? _sourceFrame_line : 0,
        column: (_sourceFrame_column = sourceFrame.column) != null ? _sourceFrame_column : 0,
        methodName: (_frame_methodName2 = frame.methodName) != null ? _frame_methodName2 : '<unknown>',
        ignored,
        arguments: []
    };
    return {
        frame: ignorableFrame,
        source
    };
}
function parseFile(fileParam) {
    if (!fileParam) {
        return undefined;
    }
    // rsc://React/Server/file://<filename>?42 => file://<filename>
    return fileParam.replace(/^rsc:\/\/React\/[^/]+\//, '').replace(/\?\d+$/, '');
}
function createStackFrames(body) {
    const { frames, isServer } = body;
    return frames.map((frame)=>{
        const file = parseFile(frame.file);
        if (!file) {
            return undefined;
        }
        var _frame_methodName, _frame_lineNumber, _frame_column;
        return {
            file,
            methodName: (_frame_methodName = frame.methodName) != null ? _frame_methodName : '<unknown>',
            line: (_frame_lineNumber = frame.lineNumber) != null ? _frame_lineNumber : 0,
            column: (_frame_column = frame.column) != null ? _frame_column : 0,
            isServer
        };
    }).filter((f)=>f !== undefined);
}
function createStackFrame(searchParams) {
    const file = parseFile(searchParams.get('file'));
    if (!file) {
        return undefined;
    }
    var _searchParams_get, _searchParams_get1, _searchParams_get2;
    return {
        file,
        methodName: (_searchParams_get = searchParams.get('methodName')) != null ? _searchParams_get : '<unknown>',
        line: parseInt((_searchParams_get1 = searchParams.get('lineNumber')) != null ? _searchParams_get1 : '0', 10) || 0,
        column: parseInt((_searchParams_get2 = searchParams.get('column')) != null ? _searchParams_get2 : '0', 10) || 0,
        isServer: searchParams.get('isServer') === 'true'
    };
}
/**
 * Finds the sourcemap payload applicable to a given frame.
 * Equal to the input unless an Index Source Map is used.
 */ function findApplicableSourceMapPayload(frame, payload) {
    if ('sections' in payload) {
        var _frame_line;
        const frameLine = (_frame_line = frame.line) != null ? _frame_line : 0;
        var _frame_column;
        const frameColumn = (_frame_column = frame.column) != null ? _frame_column : 0;
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
/**
 * @returns 1-based lines and 0-based columns
 */ async function nativeTraceSource(frame) {
    const sourceURL = decodeURIComponent(frame.file);
    let sourceMapPayload;
    try {
        var _findSourceMap;
        sourceMapPayload = (_findSourceMap = findSourceMap(sourceURL)) == null ? void 0 : _findSourceMap.payload;
    } catch (cause) {
        throw Object.defineProperty(new Error("" + sourceURL + ": Invalid source map. Only conformant source maps can be used to find the original code.", {
            cause
        }), "__NEXT_ERROR_CODE", {
            value: "E635",
            enumerable: false,
            configurable: true
        });
    }
    if (sourceMapPayload !== undefined) {
        let consumer;
        try {
            consumer = await new SourceMapConsumer(sourceMapPayload);
        } catch (cause) {
            throw Object.defineProperty(new Error("" + sourceURL + ": Invalid source map. Only conformant source maps can be used to find the original code.", {
                cause
            }), "__NEXT_ERROR_CODE", {
                value: "E635",
                enumerable: false,
                configurable: true
            });
        }
        let traced;
        try {
            var _frame_line, _frame_column;
            const originalPosition = consumer.originalPositionFor({
                line: (_frame_line = frame.line) != null ? _frame_line : 1,
                // 0-based columns out requires 0-based columns in.
                column: ((_frame_column = frame.column) != null ? _frame_column : 1) - 1
            });
            if (originalPosition.source === null) {
                traced = null;
            } else {
                var _consumer_sourceContentFor;
                const sourceContent = (_consumer_sourceContentFor = consumer.sourceContentFor(originalPosition.source, /* returnNullOnMissing */ true)) != null ? _consumer_sourceContentFor : null;
                traced = {
                    originalPosition,
                    sourceContent
                };
            }
        } finally{
            consumer.destroy();
        }
        if (traced !== null) {
            var // We ignore the sourcemapped name since it won't be the correct name.
            // The callsite will point to the column of the variable name instead of the
            // name of the enclosing function.
            // TODO(NDX-531): Spy on prepareStackTrace to get the enclosing line number for method name mapping.
            _frame_methodName_replace, _frame_methodName;
            const { originalPosition, sourceContent } = traced;
            const applicableSourceMap = findApplicableSourceMapPayload(frame, sourceMapPayload);
            // TODO(veil): Upstream a method to sourcemap consumer that immediately says if a frame is ignored or not.
            let ignored = false;
            if (applicableSourceMap === undefined) {
                console.error('No applicable source map found in sections for frame', frame);
            } else {
                var _applicableSourceMap_ignoreList;
                // TODO: O(n^2). Consider moving `ignoreList` into a Set
                const sourceIndex = applicableSourceMap.sources.indexOf(originalPosition.source);
                var _applicableSourceMap_ignoreList_includes;
                ignored = (_applicableSourceMap_ignoreList_includes = (_applicableSourceMap_ignoreList = applicableSourceMap.ignoreList) == null ? void 0 : _applicableSourceMap_ignoreList.includes(sourceIndex)) != null ? _applicableSourceMap_ignoreList_includes : // When sourcemap is not available, fallback to checking `frame.file`.
                // e.g. In pages router, nextjs server code is not bundled into the page.
                shouldIgnorePath(frame.file);
            }
            var _originalPosition_column, _originalPosition_line;
            const originalStackFrame = {
                methodName: ((_frame_methodName = frame.methodName) == null ? void 0 : (_frame_methodName_replace = _frame_methodName.replace('__WEBPACK_DEFAULT_EXPORT__', 'default')) == null ? void 0 : _frame_methodName_replace.replace('__webpack_exports__.', '')) || '<unknown>',
                column: ((_originalPosition_column = originalPosition.column) != null ? _originalPosition_column : 0) + 1,
                file: originalPosition.source,
                lineNumber: (_originalPosition_line = originalPosition.line) != null ? _originalPosition_line : 0,
                // TODO: c&p from async createOriginalStackFrame but why not frame.arguments?
                arguments: [],
                ignored
            };
            return {
                frame: originalStackFrame,
                source: sourceContent
            };
        }
    }
    return undefined;
}
async function createOriginalStackFrame(project, projectPath, frame) {
    var _ref;
    const traced = (_ref = await nativeTraceSource(frame)) != null ? _ref : // TODO(veil): When would the bundler know more than native?
    // If it's faster, try the bundler first and fall back to native later.
    await batchedTraceSource(project, frame);
    if (!traced) {
        return null;
    }
    let normalizedStackFrameLocation = traced.frame.file;
    if (normalizedStackFrameLocation !== null && normalizedStackFrameLocation.startsWith('file://')) {
        normalizedStackFrameLocation = path.relative(projectPath, url.fileURLToPath(normalizedStackFrameLocation));
    }
    return {
        originalStackFrame: {
            arguments: traced.frame.arguments,
            column: traced.frame.column,
            file: normalizedStackFrameLocation,
            ignored: traced.frame.ignored,
            lineNumber: traced.frame.lineNumber,
            methodName: traced.frame.methodName
        },
        originalCodeFrame: getOriginalCodeFrame(traced.frame, traced.source)
    };
}
export function getOverlayMiddleware(project, projectPath) {
    return async function(req, res, next) {
        const { pathname, searchParams } = new URL(req.url, 'http://n');
        if (pathname === '/__nextjs_original-stack-frames') {
            if (req.method !== 'POST') {
                return middlewareResponse.badRequest(res);
            }
            const body = await new Promise((resolve, reject)=>{
                let data = '';
                req.on('data', (chunk)=>{
                    data += chunk;
                });
                req.on('end', ()=>resolve(data));
                req.on('error', reject);
            });
            const request = JSON.parse(body);
            const stackFrames = createStackFrames(request);
            const result = await Promise.all(stackFrames.map(async (frame)=>{
                try {
                    const stackFrame = await createOriginalStackFrame(project, projectPath, frame);
                    if (stackFrame === null) {
                        return {
                            status: 'rejected',
                            reason: 'Failed to create original stack frame'
                        };
                    }
                    return {
                        status: 'fulfilled',
                        value: stackFrame
                    };
                } catch (error) {
                    return {
                        status: 'rejected',
                        reason: inspect(error, {
                            colors: false
                        })
                    };
                }
            }));
            return middlewareResponse.json(res, result);
        } else if (pathname === '/__nextjs_launch-editor') {
            const frame = createStackFrame(searchParams);
            if (!frame) return middlewareResponse.badRequest(res);
            const fileExists = await fs.access(frame.file, FS.F_OK).then(()=>true, ()=>false);
            if (!fileExists) return middlewareResponse.notFound(res);
            try {
                var _frame_line, _frame_column;
                launchEditor(frame.file, (_frame_line = frame.line) != null ? _frame_line : 1, (_frame_column = frame.column) != null ? _frame_column : 1);
            } catch (err) {
                console.log('Failed to launch editor:', err);
                return middlewareResponse.internalServerError(res);
            }
            return middlewareResponse.noContent(res);
        }
        return next();
    };
}
export function getSourceMapMiddleware(project) {
    return async function(req, res, next) {
        const { pathname, searchParams } = new URL(req.url, 'http://n');
        if (pathname !== '/__nextjs_source-map') {
            return next();
        }
        let filename = searchParams.get('filename');
        if (!filename) {
            return middlewareResponse.badRequest(res);
        }
        // TODO(veil): Always try the native version first.
        // Externals could also be files that aren't bundled via Webpack.
        if (filename.startsWith('webpack://') || filename.startsWith('webpack-internal:///')) {
            const sourceMap = findSourceMap(filename);
            if (sourceMap) {
                return middlewareResponse.json(res, sourceMap.payload);
            }
            return middlewareResponse.noContent(res);
        }
        try {
            // Turbopack chunk filenames might be URL-encoded.
            filename = decodeURI(filename);
            if (path.isAbsolute(filename)) {
                filename = url.pathToFileURL(filename).href;
            }
            const sourceMapString = await project.getSourceMap(filename);
            if (sourceMapString) {
                return middlewareResponse.jsonString(res, sourceMapString);
            }
            if (filename.startsWith('file:')) {
                const sourceMap = await getSourceMapFromFile(filename);
                if (sourceMap) {
                    return middlewareResponse.json(res, sourceMap);
                }
            }
        } catch (error) {
            console.error('Failed to get source map:', error);
        }
        middlewareResponse.noContent(res);
    };
}

//# sourceMappingURL=middleware-turbopack.js.map