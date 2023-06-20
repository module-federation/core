/* eslint-disable @typescript-eslint/no-non-null-assertion */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TypescriptCompiler", {
    enumerable: true,
    get: function() {
        return TypescriptCompiler;
    }
});
const _extends = require("@swc/helpers/_/_extends");
const _interop_require_default = require("@swc/helpers/_/_interop_require_default");
const _typescript = /*#__PURE__*/ _interop_require_default._(require("typescript"));
const _path = /*#__PURE__*/ _interop_require_default._(require("path"));
const _fs = /*#__PURE__*/ _interop_require_default._(require("fs"));
const _utilities = require("@module-federation/utilities");
const _Caching = require("./Caching");
let vueTs;
try {
    vueTs = require('vue-tsc');
} catch (e) {
// vue-tsc is an optional dependency.
}
let TypescriptCompiler = class TypescriptCompiler {
    generateDeclarationFiles(exposedComponents, additionalFilesToCompile = []) {
        const exposeSrcToDestMap = {};
        const normalizedExposedComponents = this.normalizeFiles(Object.entries(exposedComponents), ([exposeDest, exposeSrc])=>{
            const pathWithExt = this.getNormalizedPathWithExt(exposeSrc);
            exposeSrcToDestMap[pathWithExt] = exposeDest;
            return pathWithExt;
        });
        const normalizedAdditionalFiles = this.normalizeFiles(additionalFilesToCompile, this.getNormalizedPathWithExt.bind(this));
        const host = this.createHost(exposeSrcToDestMap);
        const rootNames = [
            ...normalizedAdditionalFiles,
            ...normalizedExposedComponents
        ];
        const program = this.getCompilerProgram({
            rootNames,
            options: this.compilerOptions,
            host
        });
        const { diagnostics , emitSkipped  } = program.emit();
        if (!emitSkipped) {
            return this.tsDefinitionFilesObj;
        }
        diagnostics.forEach(this.reportCompileDiagnostic.bind(this));
        throw new Error('something went wrong generating declaration files');
    }
    getCompilerProgram(programOptions) {
        const { compiler  } = this.options;
        switch(compiler){
            case 'vue-tsc':
                if (!vueTs) {
                    throw new Error('vue-tsc must be installed when using the vue-tsc compiler option');
                }
                return vueTs.createProgram(programOptions);
            case 'tsc':
            default:
                return _typescript.default.createProgram(programOptions);
        }
    }
    normalizeFiles(files, mapFn) {
        return files.map(mapFn).filter((entry)=>/\.tsx?$/.test(entry));
    }
    getNormalizedPathWithExt(exposeSrc) {
        const cwd = this.options.webpackCompilerOptions.context || process.cwd();
        const [rootDir, entry] = exposeSrc.split(/\/(?=[^/]+$)/);
        const normalizedRootDir = _path.default.resolve(cwd, rootDir);
        const filenameWithExt = this.getFilenameWithExtension(normalizedRootDir, entry);
        const pathWithExt = _path.default.resolve(normalizedRootDir, filenameWithExt);
        return _path.default.normalize(pathWithExt);
    }
    createHost(exposeSrcToDestMap) {
        const host = _typescript.default.createCompilerHost(this.compilerOptions);
        const originalWriteFile = host.writeFile;
        host.writeFile = (filepath, text, writeOrderByteMark, onError, sourceFiles, data)=>{
            this.tsDefinitionFilesObj[filepath] = text;
            originalWriteFile(filepath, text, writeOrderByteMark, onError, sourceFiles, data);
            // create exports matching the `exposes` config
            const sourceFilename = _path.default.normalize((sourceFiles == null ? void 0 : sourceFiles[0].fileName) || '');
            const exposedDestFilePath = exposeSrcToDestMap[sourceFilename];
            // create reexport file only if the file was marked for exposing
            if (exposedDestFilePath) {
                const normalizedExposedDestFilePath = _path.default.resolve(this.options.distDir, `${exposedDestFilePath}.d.ts`);
                const relativePathToCompiledFile = _path.default.relative(_path.default.dirname(normalizedExposedDestFilePath), filepath);
                // add ./ so it's always relative, remove d.ts because it's not needed and can throw warnings
                let importPath = './' + relativePathToCompiledFile.replace(/\.d\.ts$/, '');
                // If we're on Windows, need to convert "\" to "/" in the import path since it
                // was derived from platform-specific file system path.
                if (_path.default.sep === '\\') {
                    importPath = importPath.replaceAll(_path.default.sep, '/');
                }
                const reexport = `export * from '${importPath}';\nexport { default } from '${importPath}';`;
                this.tsDefinitionFilesObj[normalizedExposedDestFilePath] = reexport;
                // reuse originalWriteFile as it creates folders if they don't exist
                originalWriteFile(normalizedExposedDestFilePath, reexport, writeOrderByteMark);
            }
        };
        return host;
    }
    reportCompileDiagnostic(diagnostic) {
        const { line  } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        this.logger.log('TS Error', diagnostic.code, ':', _typescript.default.flattenDiagnosticMessageText(diagnostic.messageText, _typescript.default.sys.newLine));
        this.logger.log('         at', `${diagnostic.file.fileName}:${line + 1}`, _typescript.default.sys.newLine // '\n'
        );
    }
    getTSConfigCompilerOptions() {
        const context = this.options.webpackCompilerOptions.context;
        const tsconfigPath = _typescript.default.findConfigFile(context, _typescript.default.sys.fileExists, 'tsconfig.json');
        if (!tsconfigPath) {
            this.logger.error('ERROR: Could not find a valid tsconfig.json');
            process.exit(1);
        }
        const readResult = _typescript.default.readConfigFile(tsconfigPath, _typescript.default.sys.readFile);
        const configContent = _typescript.default.parseJsonConfigFileContent(readResult.config, _typescript.default.sys, context);
        return configContent.options;
    }
    getFilenameWithExtension(rootDir, entry) {
        // Check path exists and it's a directory
        if (!_fs.default.existsSync(rootDir) || !_fs.default.lstatSync(rootDir).isDirectory()) {
            throw new Error('rootDir must be a directory');
        }
        let filename;
        try {
            // Try to resolve exposed component using index
            const files = _Caching.TypesCache.getFsFiles(_path.default.join(rootDir, entry));
            filename = files == null ? void 0 : files.find((file)=>file.split('.')[0] === 'index');
            if (!filename) {
                throw new Error(`filename ${filename} not found`);
            }
            return `${entry}/${filename}`;
        } catch (err) {
            const files = _Caching.TypesCache.getFsFiles(rootDir);
            // Handle case where directory contains similar filenames
            // or where a filename like `Component.base.tsx` is used
            filename = files == null ? void 0 : files.find((file)=>{
                const baseFile = _path.default.basename(file, _path.default.extname(file));
                const baseEntry = _path.default.basename(entry, _path.default.extname(entry));
                return baseFile === baseEntry;
            });
            if (!filename) {
                throw new Error(`filename ${filename} not found`);
            }
            return filename;
        }
    }
    constructor(options){
        this.options = options;
        this.tsDefinitionFilesObj = {};
        this.logger = _utilities.Logger.getLogger();
        const tsConfigCompilerOptions = this.getTSConfigCompilerOptions();
        this.compilerOptions = _extends._({}, tsConfigCompilerOptions, options.tsCompilerOptions);
    }
};

//# sourceMappingURL=TypescriptCompiler.js.map