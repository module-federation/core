import { UNDERSCORE_NOT_FOUND_ROUTE, UNDERSCORE_NOT_FOUND_ROUTE_ENTRY } from '../../../../shared/lib/constants';
import path from 'path';
import { bold } from '../../../../lib/picocolors';
import { getModuleBuildInfo } from '../get-module-build-info';
import { verifyRootLayout } from '../../../../lib/verify-root-layout';
import * as Log from '../../../output/log';
import { APP_DIR_ALIAS } from '../../../../lib/constants';
import { createMetadataExportsCode, createStaticMetadataFromRoute } from '../metadata/discover';
import { promises as fs } from 'fs';
import { isAppRouteRoute } from '../../../../lib/is-app-route-route';
import { AppPathnameNormalizer } from '../../../../server/normalizers/built/app/app-pathname-normalizer';
import { isAppBuiltinNotFoundPage } from '../../../utils';
import { loadEntrypoint } from '../../../load-entrypoint';
import { isGroupSegment, DEFAULT_SEGMENT_KEY, PAGE_SEGMENT_KEY } from '../../../../shared/lib/segment';
import { getFilesInDir } from '../../../../lib/get-files-in-dir';
import { PARALLEL_ROUTE_DEFAULT_PATH } from '../../../../client/components/parallel-route-default';
import { createAppRouteCode } from './create-app-route-code';
const HTTP_ACCESS_FALLBACKS = {
    'not-found': 'not-found',
    forbidden: 'forbidden',
    unauthorized: 'unauthorized'
};
const defaultHTTPAccessFallbackPaths = {
    'not-found': 'next/dist/client/components/not-found-error',
    forbidden: 'next/dist/client/components/forbidden-error',
    unauthorized: 'next/dist/client/components/unauthorized-error'
};
const FILE_TYPES = {
    layout: 'layout',
    template: 'template',
    error: 'error',
    loading: 'loading',
    'global-error': 'global-error',
    ...HTTP_ACCESS_FALLBACKS
};
const GLOBAL_ERROR_FILE_TYPE = 'global-error';
const PAGE_SEGMENT = 'page$';
const PARALLEL_CHILDREN_SEGMENT = 'children$';
const defaultGlobalErrorPath = 'next/dist/client/components/error-boundary';
const defaultLayoutPath = 'next/dist/client/components/default-layout';
const normalizeParallelKey = (key)=>key.startsWith('@') ? key.slice(1) : key;
const isDirectory = async (pathname)=>{
    try {
        const stat = await fs.stat(pathname);
        return stat.isDirectory();
    } catch (err) {
        return false;
    }
};
async function createTreeCodeFromPath(pagePath, { page, resolveDir, resolver, resolveParallelSegments, metadataResolver, pageExtensions, basePath, collectedDeclarations }) {
    const splittedPath = pagePath.split(/[\\/]/, 1);
    const isNotFoundRoute = page === UNDERSCORE_NOT_FOUND_ROUTE_ENTRY;
    const isDefaultNotFound = isAppBuiltinNotFoundPage(pagePath);
    const appDirPrefix = isDefaultNotFound ? APP_DIR_ALIAS : splittedPath[0];
    const pages = [];
    let rootLayout;
    let globalError;
    async function resolveAdjacentParallelSegments(segmentPath) {
        const absoluteSegmentPath = await resolveDir(`${appDirPrefix}${segmentPath}`);
        if (!absoluteSegmentPath) {
            return [];
        }
        const segmentIsDirectory = await isDirectory(absoluteSegmentPath);
        if (!segmentIsDirectory) {
            return [];
        }
        // We need to resolve all parallel routes in this level.
        const files = await fs.opendir(absoluteSegmentPath);
        const parallelSegments = [
            'children'
        ];
        for await (const dirent of files){
            // Make sure name starts with "@" and is a directory.
            if (dirent.isDirectory() && dirent.name.charCodeAt(0) === 64) {
                parallelSegments.push(dirent.name);
            }
        }
        return parallelSegments;
    }
    async function createSubtreePropsFromSegmentPath(segments, nestedCollectedDeclarations) {
        const segmentPath = segments.join('/');
        // Existing tree are the children of the current segment
        const props = {};
        // Root layer could be 1st layer of normal routes
        const isRootLayer = segments.length === 0;
        const isRootLayoutOrRootPage = segments.length <= 1;
        // We need to resolve all parallel routes in this level.
        const parallelSegments = [];
        if (isRootLayer) {
            parallelSegments.push([
                'children',
                ''
            ]);
        } else {
            parallelSegments.push(...resolveParallelSegments(segmentPath));
        }
        let metadata = null;
        const routerDirPath = `${appDirPrefix}${segmentPath}`;
        // For default not-found, don't traverse the directory to find metadata.
        const resolvedRouteDir = isDefaultNotFound ? '' : await resolveDir(routerDirPath);
        if (resolvedRouteDir) {
            metadata = await createStaticMetadataFromRoute(resolvedRouteDir, {
                basePath,
                segment: segmentPath,
                metadataResolver,
                isRootLayoutOrRootPage,
                pageExtensions
            });
        }
        for (const [parallelKey, parallelSegment] of parallelSegments){
            // if parallelSegment is the page segment (ie, `page$` and not ['page$']), it gets loaded into the __PAGE__ slot
            // as it's the page for the current route.
            if (parallelSegment === PAGE_SEGMENT) {
                const matchedPagePath = `${appDirPrefix}${segmentPath}${parallelKey === 'children' ? '' : `/${parallelKey}`}/page`;
                const resolvedPagePath = await resolver(matchedPagePath);
                if (resolvedPagePath) {
                    pages.push(resolvedPagePath);
                    const varName = `page${nestedCollectedDeclarations.length}`;
                    nestedCollectedDeclarations.push([
                        varName,
                        resolvedPagePath
                    ]);
                    // Use '' for segment as it's the page. There can't be a segment called '' so this is the safest way to add it.
                    props[normalizeParallelKey(parallelKey)] = `['${PAGE_SEGMENT_KEY}', {}, {
          page: [${varName}, ${JSON.stringify(resolvedPagePath)}],
          ${createMetadataExportsCode(metadata)}
        }]`;
                    continue;
                }
            }
            // if the parallelSegment was not matched to the __PAGE__ slot, then it's a parallel route at this level.
            // the code below recursively traverses the parallel slots directory to match the corresponding __PAGE__ for each parallel slot
            // while also filling in layout/default/etc files into the loader tree at each segment level.
            const subSegmentPath = [
                ...segments
            ];
            if (parallelKey !== 'children') {
                // A `children` parallel key should have already been processed in the above segment
                // So we exclude it when constructing the subsegment path for the remaining segment levels
                subSegmentPath.push(parallelKey);
            }
            const normalizedParallelSegment = Array.isArray(parallelSegment) ? parallelSegment[0] : parallelSegment;
            if (normalizedParallelSegment !== PAGE_SEGMENT && normalizedParallelSegment !== PARALLEL_CHILDREN_SEGMENT) {
                // If we don't have a page segment, nor a special $children marker, it means we need to traverse the next directory
                // (ie, `normalizedParallelSegment` would correspond with the folder that contains the next level of pages/layout/etc)
                // we push it to the subSegmentPath so that we can fill in the loader tree for that segment.
                subSegmentPath.push(normalizedParallelSegment);
            }
            const parallelSegmentPath = subSegmentPath.join('/');
            // Fill in the loader tree for all of the special files types (layout, default, etc) at this level
            // `page` is not included here as it's added above.
            const filePaths = await Promise.all(Object.values(FILE_TYPES).map(async (file)=>{
                return [
                    file,
                    await resolver(`${appDirPrefix}${// TODO-APP: parallelSegmentPath sometimes ends in `/` but sometimes it doesn't. This should be consistent.
                    parallelSegmentPath.endsWith('/') ? parallelSegmentPath : parallelSegmentPath + '/'}${file}`)
                ];
            }));
            const definedFilePaths = filePaths.filter(([, filePath])=>filePath !== undefined);
            // Add default access fallback as root fallback if not present
            const existedConventionNames = new Set(definedFilePaths.map(([type])=>type));
            // If the first layer is a group route, we treat it as root layer
            const isFirstLayerGroupRoute = segments.length === 1 && subSegmentPath.filter((seg)=>isGroupSegment(seg)).length === 1;
            if (isRootLayer || isFirstLayerGroupRoute) {
                const accessFallbackTypes = Object.keys(defaultHTTPAccessFallbackPaths);
                for (const type of accessFallbackTypes){
                    const hasRootFallbackFile = await resolver(`${appDirPrefix}/${FILE_TYPES[type]}`);
                    const hasLayerFallbackFile = existedConventionNames.has(type);
                    // If you already have a root access error fallback, don't insert default access error boundary to group routes root
                    if (// Is treated as root layout and without boundary
                    !(hasRootFallbackFile && isFirstLayerGroupRoute) && // Does not have a fallback boundary file
                    !hasLayerFallbackFile) {
                        const defaultFallbackPath = defaultHTTPAccessFallbackPaths[type];
                        definedFilePaths.push([
                            type,
                            defaultFallbackPath
                        ]);
                    }
                }
            }
            if (!rootLayout) {
                var _definedFilePaths_find;
                const layoutPath = (_definedFilePaths_find = definedFilePaths.find(([type])=>type === 'layout')) == null ? void 0 : _definedFilePaths_find[1];
                rootLayout = layoutPath;
                if (isDefaultNotFound && !layoutPath && !rootLayout) {
                    rootLayout = defaultLayoutPath;
                    definedFilePaths.push([
                        'layout',
                        rootLayout
                    ]);
                }
            }
            if (!globalError) {
                const resolvedGlobalErrorPath = await resolver(`${appDirPrefix}/${GLOBAL_ERROR_FILE_TYPE}`);
                if (resolvedGlobalErrorPath) {
                    globalError = resolvedGlobalErrorPath;
                }
            }
            let parallelSegmentKey = Array.isArray(parallelSegment) ? parallelSegment[0] : parallelSegment;
            // normalize the parallel segment key to remove any special markers that we inserted in the
            // earlier logic (such as children$ and page$). These should never appear in the loader tree, and
            // should instead be the corresponding segment keys (ie `__PAGE__`) or the `children` parallel route.
            parallelSegmentKey = parallelSegmentKey === PARALLEL_CHILDREN_SEGMENT ? 'children' : parallelSegmentKey === PAGE_SEGMENT ? PAGE_SEGMENT_KEY : parallelSegmentKey;
            const normalizedParallelKey = normalizeParallelKey(parallelKey);
            let subtreeCode;
            // If it's root not found page, set not-found boundary as children page
            if (isNotFoundRoute && normalizedParallelKey === 'children') {
                var _definedFilePaths_find1;
                const notFoundPath = ((_definedFilePaths_find1 = definedFilePaths.find(([type])=>type === 'not-found')) == null ? void 0 : _definedFilePaths_find1[1]) ?? defaultHTTPAccessFallbackPaths['not-found'];
                const varName = `notFound${nestedCollectedDeclarations.length}`;
                nestedCollectedDeclarations.push([
                    varName,
                    notFoundPath
                ]);
                subtreeCode = `{
          children: [${JSON.stringify(UNDERSCORE_NOT_FOUND_ROUTE)}, {
            children: ['${PAGE_SEGMENT_KEY}', {}, {
              page: [
                ${varName},
                ${JSON.stringify(notFoundPath)}
              ]
            }]
          }, {}]
        }`;
            }
            const modulesCode = `{
        ${definedFilePaths.map(([file, filePath])=>{
                const varName = `module${nestedCollectedDeclarations.length}`;
                nestedCollectedDeclarations.push([
                    varName,
                    filePath
                ]);
                return `'${file}': [${varName}, ${JSON.stringify(filePath)}],`;
            }).join('\n')}
        ${createMetadataExportsCode(metadata)}
      }`;
            if (!subtreeCode) {
                const { treeCode: pageSubtreeCode } = await createSubtreePropsFromSegmentPath(subSegmentPath, nestedCollectedDeclarations);
                subtreeCode = pageSubtreeCode;
            }
            props[normalizedParallelKey] = `[
        '${parallelSegmentKey}',
        ${subtreeCode},
        ${modulesCode}
      ]`;
        }
        const adjacentParallelSegments = await resolveAdjacentParallelSegments(segmentPath);
        for (const adjacentParallelSegment of adjacentParallelSegments){
            if (!props[normalizeParallelKey(adjacentParallelSegment)]) {
                const actualSegment = adjacentParallelSegment === 'children' ? '' : `/${adjacentParallelSegment}`;
                // if a default is found, use that. Otherwise use the fallback, which will trigger a `notFound()`
                const defaultPath = await resolver(`${appDirPrefix}${segmentPath}${actualSegment}/default`) ?? PARALLEL_ROUTE_DEFAULT_PATH;
                const varName = `default${nestedCollectedDeclarations.length}`;
                nestedCollectedDeclarations.push([
                    varName,
                    defaultPath
                ]);
                props[normalizeParallelKey(adjacentParallelSegment)] = `[
          '${DEFAULT_SEGMENT_KEY}',
          {},
          {
            defaultPage: [${varName}, ${JSON.stringify(defaultPath)}],
          }
        ]`;
            }
        }
        return {
            treeCode: `{
        ${Object.entries(props).map(([key, value])=>`${key}: ${value}`).join(',\n')}
      }`
        };
    }
    const { treeCode } = await createSubtreePropsFromSegmentPath([], collectedDeclarations);
    return {
        treeCode: `${treeCode}.children;`,
        pages: `${JSON.stringify(pages)};`,
        rootLayout,
        globalError: globalError ?? defaultGlobalErrorPath
    };
}
function createAbsolutePath(appDir, pathToTurnAbsolute) {
    return pathToTurnAbsolute// Replace all POSIX path separators with the current OS path separator
    .replace(/\//g, path.sep).replace(/^private-next-app-dir/, appDir);
}
const filesInDirMapMap = new WeakMap();
const nextAppLoader = async function nextAppLoader() {
    const loaderOptions = this.getOptions();
    const { name, appDir, appPaths, pagePath, pageExtensions, rootDir, tsconfigPath, isDev, nextConfigOutput, preferredRegion, basePath, middlewareConfig: middlewareConfigBase64, nextConfigExperimentalUseEarlyImport } = loaderOptions;
    const buildInfo = getModuleBuildInfo(this._module);
    const collectedDeclarations = [];
    const page = name.replace(/^app/, '');
    const middlewareConfig = JSON.parse(Buffer.from(middlewareConfigBase64, 'base64').toString());
    buildInfo.route = {
        page,
        absolutePagePath: createAbsolutePath(appDir, pagePath),
        preferredRegion,
        middlewareConfig,
        relatedModules: []
    };
    const extensions = pageExtensions.map((extension)=>`.${extension}`);
    const normalizedAppPaths = typeof appPaths === 'string' ? [
        appPaths
    ] : appPaths || [];
    const resolveParallelSegments = (pathname)=>{
        const matched = {};
        let existingChildrenPath;
        for (const appPath of normalizedAppPaths){
            if (appPath.startsWith(pathname + '/')) {
                const rest = appPath.slice(pathname.length + 1).split('/');
                // It is the actual page, mark it specially.
                if (rest.length === 1 && rest[0] === 'page') {
                    existingChildrenPath = appPath;
                    matched.children = PAGE_SEGMENT;
                    continue;
                }
                const isParallelRoute = rest[0].startsWith('@');
                if (isParallelRoute) {
                    if (rest.length === 2 && rest[1] === 'page') {
                        // We found a parallel route at this level. We don't want to mark it explicitly as the page segment,
                        // as that should be matched to the `children` slot. Instead, we use an array, to signal to `createSubtreePropsFromSegmentPath`
                        // that it needs to recursively fill in the loader tree code for the parallel route at the appropriate levels.
                        matched[rest[0]] = [
                            PAGE_SEGMENT
                        ];
                        continue;
                    }
                    // If it was a parallel route but we weren't able to find the page segment (ie, maybe the page is nested further)
                    // we first insert a special marker to ensure that we still process layout/default/etc at the slot level prior to continuing
                    // on to the page segment.
                    matched[rest[0]] = [
                        PARALLEL_CHILDREN_SEGMENT,
                        ...rest.slice(1)
                    ];
                    continue;
                }
                if (existingChildrenPath && matched.children !== rest[0]) {
                    // If we get here, it means we already set a `page` segment earlier in the loop,
                    // meaning we already matched a page to the `children` parallel segment.
                    const isIncomingParallelPage = appPath.includes('@');
                    const hasCurrentParallelPage = existingChildrenPath.includes('@');
                    if (isIncomingParallelPage) {
                        continue;
                    } else if (!hasCurrentParallelPage && !isIncomingParallelPage) {
                        // Both the current `children` and the incoming `children` are regular pages.
                        throw Object.defineProperty(new Error(`You cannot have two parallel pages that resolve to the same path. Please check ${existingChildrenPath} and ${appPath}. Refer to the route group docs for more information: https://nextjs.org/docs/app/building-your-application/routing/route-groups`), "__NEXT_ERROR_CODE", {
                            value: "E28",
                            enumerable: false,
                            configurable: true
                        });
                    }
                }
                existingChildrenPath = appPath;
                matched.children = rest[0];
            }
        }
        return Object.entries(matched);
    };
    const resolveDir = (pathToResolve)=>{
        return createAbsolutePath(appDir, pathToResolve);
    };
    const resolveAppRoute = (pathToResolve)=>{
        return createAbsolutePath(appDir, pathToResolve);
    };
    // Cached checker to see if a file exists in a given directory.
    // This can be more efficient than checking them with `fs.stat` one by one
    // because all the thousands of files are likely in a few possible directories.
    // Note that it should only be cached for this compilation, not globally.
    const fileExistsInDirectory = async (dirname, fileName)=>{
        // I don't think we should ever hit this code path, but if we do we should handle it gracefully.
        if (this._compilation === undefined) {
            try {
                return (await getFilesInDir(dirname).catch(()=>new Set())).has(fileName);
            } catch (e) {
                return false;
            }
        }
        const map = filesInDirMapMap.get(this._compilation) || new Map();
        if (!filesInDirMapMap.has(this._compilation)) {
            filesInDirMapMap.set(this._compilation, map);
        }
        if (!map.has(dirname)) {
            map.set(dirname, getFilesInDir(dirname).catch(()=>new Set()));
        }
        return (await map.get(dirname) || new Set()).has(fileName);
    };
    const resolver = async (pathname)=>{
        const absolutePath = createAbsolutePath(appDir, pathname);
        const filenameIndex = absolutePath.lastIndexOf(path.sep);
        const dirname = absolutePath.slice(0, filenameIndex);
        const filename = absolutePath.slice(filenameIndex + 1);
        let result;
        for (const ext of extensions){
            const absolutePathWithExtension = `${absolutePath}${ext}`;
            if (!result && await fileExistsInDirectory(dirname, `${filename}${ext}`)) {
                result = absolutePathWithExtension;
            }
            // Call `addMissingDependency` for all files even if they didn't match,
            // because they might be added or removed during development.
            this.addMissingDependency(absolutePathWithExtension);
        }
        return result;
    };
    const metadataResolver = async (dirname, filename, exts)=>{
        const absoluteDir = createAbsolutePath(appDir, dirname);
        let result;
        for (const ext of exts){
            // Compared to `resolver` above the exts do not have the `.` included already, so it's added here.
            const filenameWithExt = `${filename}.${ext}`;
            const absolutePathWithExtension = `${absoluteDir}${path.sep}${filenameWithExt}`;
            if (!result && await fileExistsInDirectory(dirname, filenameWithExt)) {
                result = absolutePathWithExtension;
            }
            // Call `addMissingDependency` for all files even if they didn't match,
            // because they might be added or removed during development.
            this.addMissingDependency(absolutePathWithExtension);
        }
        return result;
    };
    if (isAppRouteRoute(name)) {
        return createAppRouteCode({
            appDir,
            // TODO: investigate if the local `page` is the same as the loaderOptions.page
            page: loaderOptions.page,
            name,
            pagePath,
            resolveAppRoute,
            pageExtensions,
            nextConfigOutput
        });
    }
    let treeCodeResult = await createTreeCodeFromPath(pagePath, {
        page,
        resolveDir,
        resolver,
        metadataResolver,
        resolveParallelSegments,
        loaderContext: this,
        pageExtensions,
        basePath,
        collectedDeclarations
    });
    if (!treeCodeResult.rootLayout) {
        if (!isDev) {
            // If we're building and missing a root layout, exit the build
            Log.error(`${bold(pagePath.replace(`${APP_DIR_ALIAS}/`, ''))} doesn't have a root layout. To fix this error, make sure every page has a root layout.`);
            process.exit(1);
        } else {
            var _filesInDirMapMap_get;
            // In dev we'll try to create a root layout
            const [createdRootLayout, rootLayoutPath] = await verifyRootLayout({
                appDir: appDir,
                dir: rootDir,
                tsconfigPath: tsconfigPath,
                pagePath,
                pageExtensions
            });
            if (!createdRootLayout) {
                let message = `${bold(pagePath.replace(`${APP_DIR_ALIAS}/`, ''))} doesn't have a root layout. `;
                if (rootLayoutPath) {
                    var _this__compiler;
                    message += `We tried to create ${bold(path.relative(((_this__compiler = this._compiler) == null ? void 0 : _this__compiler.context) ?? '', rootLayoutPath))} for you but something went wrong.`;
                } else {
                    message += 'To fix this error, make sure every page has a root layout.';
                }
                throw Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
                    value: "E394",
                    enumerable: false,
                    configurable: true
                });
            }
            // Clear fs cache, get the new result with the created root layout.
            if (this._compilation) (_filesInDirMapMap_get = filesInDirMapMap.get(this._compilation)) == null ? void 0 : _filesInDirMapMap_get.clear();
            treeCodeResult = await createTreeCodeFromPath(pagePath, {
                page,
                resolveDir,
                resolver,
                metadataResolver,
                resolveParallelSegments,
                loaderContext: this,
                pageExtensions,
                basePath,
                collectedDeclarations
            });
        }
    }
    const pathname = new AppPathnameNormalizer().normalize(page);
    // Prefer to modify next/src/server/app-render/entry-base.ts since this is shared with Turbopack.
    // Any changes to this code should be reflected in Turbopack's app_source.rs and/or app-renderer.tsx as well.
    const code = await loadEntrypoint('app-page', {
        VAR_DEFINITION_PAGE: page,
        VAR_DEFINITION_PATHNAME: pathname,
        VAR_MODULE_GLOBAL_ERROR: treeCodeResult.globalError
    }, {
        tree: treeCodeResult.treeCode,
        pages: treeCodeResult.pages,
        __next_app_require__: '__webpack_require__',
        // all modules are in the entry chunk, so we never actually need to load chunks in webpack
        __next_app_load_chunk__: '() => Promise.resolve()'
    });
    const header = nextConfigExperimentalUseEarlyImport && process.env.NODE_ENV === 'production' ? collectedDeclarations.map(([varName, modulePath])=>{
        return `import * as ${varName}_ from ${JSON.stringify(modulePath)};\nconst ${varName} = () => ${varName}_;\n`;
    }).join('') : collectedDeclarations.map(([varName, modulePath])=>{
        return `const ${varName} = () => import(/* webpackMode: "eager" */ ${JSON.stringify(modulePath)});\n`;
    }).join('');
    return header + code;
};
export default nextAppLoader;

//# sourceMappingURL=index.js.map