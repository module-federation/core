"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "normalizeOptions", {
    enumerable: true,
    get: function() {
        return normalizeOptions;
    }
});
const _extends = require("@swc/helpers/_/_extends");
const _interop_require_default = require("@swc/helpers/_/_interop_require_default");
const _object_without_properties_loose = require("@swc/helpers/_/_object_without_properties_loose");
const _lodashget = /*#__PURE__*/ _interop_require_default._(require("lodash.get"));
const _path = /*#__PURE__*/ _interop_require_default._(require("path"));
const _constants = require("../constants");
const defaultOptions = {
    compiler: 'tsc',
    disableDownloadingRemoteTypes: false,
    disableTypeCompilation: false,
    typescriptFolderName: _constants.TYPESCRIPT_FOLDER_NAME,
    typescriptCompiledFolderName: _constants.TYPESCRIPT_COMPILED_FOLDER_NAME,
    additionalFilesToCompile: [],
    downloadRemoteTypesTimeout: 2000
};
const normalizeOptions = (options, compiler)=>{
    const webpackCompilerOptions = compiler.options;
    const { context , watchOptions  } = webpackCompilerOptions;
    const _ref = _extends._({}, defaultOptions, options), { federationConfig , typescriptFolderName , typescriptCompiledFolderName  } = _ref, restOptions = _object_without_properties_loose._(_ref, [
        "federationConfig",
        "typescriptFolderName",
        "typescriptCompiledFolderName"
    ]);
    const federationFileName = federationConfig.filename;
    const distPath = (0, _lodashget.default)(webpackCompilerOptions, 'devServer.static.directory') || (0, _lodashget.default)(webpackCompilerOptions, 'output.path') || 'dist';
    const typesPath = federationFileName.substring(0, federationFileName.lastIndexOf('/'));
    const typesIndexJsonFilePath = _path.default.join(typesPath, _constants.TYPES_INDEX_JSON_FILE_NAME);
    const distDir = _path.default.join(distPath, typesPath, typescriptFolderName);
    const tsCompilerOptions = {
        declaration: true,
        emitDeclarationOnly: true,
        outDir: _path.default.join(distDir, `/${typescriptCompiledFolderName}/`),
        noEmit: false
    };
    const webpackPublicPath = webpackCompilerOptions.output.publicPath;
    const publicPath = typeof webpackPublicPath === 'string' ? webpackPublicPath === 'auto' ? '' : webpackPublicPath : '';
    const watchOptionsToIgnore = [
        _path.default.normalize(_path.default.join(context, typescriptFolderName))
    ];
    const ignoredWatchOptions = Array.isArray(watchOptions.ignored) ? [
        ...watchOptions.ignored,
        ...watchOptionsToIgnore
    ] : watchOptionsToIgnore;
    return _extends._({}, restOptions, {
        distDir,
        publicPath,
        tsCompilerOptions,
        typesIndexJsonFileName: _constants.TYPES_INDEX_JSON_FILE_NAME,
        typesIndexJsonFilePath,
        typescriptFolderName,
        webpackCompilerOptions,
        ignoredWatchOptions
    });
};

//# sourceMappingURL=normalizeOptions.js.map