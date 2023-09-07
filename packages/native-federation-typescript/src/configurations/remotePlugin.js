import { existsSync } from 'fs';
import { dirname, join, resolve } from 'path';
import typescript from 'typescript';
const defaultOptions = {
    tsConfigPath: './tsconfig.json',
    typesFolder: '@mf-types',
    compiledTypesFolder: 'compiled-types',
    deleteTypesFolder: true,
    additionalFilesToCompile: [],
    compilerInstance: 'tsc',
};
const readTsConfig = ({ tsConfigPath, typesFolder, compiledTypesFolder, }) => {
    const resolvedTsConfigPath = resolve(tsConfigPath);
    const readResult = typescript.readConfigFile(resolvedTsConfigPath, typescript.sys.readFile);
    const configContent = typescript.parseJsonConfigFileContent(readResult.config, typescript.sys, dirname(resolvedTsConfigPath));
    const outDir = join(configContent.options.outDir || 'dist', typesFolder, compiledTypesFolder);
    return Object.assign(Object.assign({}, configContent.options), { emitDeclarationOnly: true, noEmit: false, declaration: true, outDir });
};
const TS_EXTENSIONS = ['ts', 'tsx', 'vue', 'svelte'];
const resolveWithExtension = (exposedPath) => {
    const cwd = process.cwd();
    for (const extension of TS_EXTENSIONS) {
        const exposedPathWithExtension = join(cwd, `${exposedPath}.${extension}`);
        if (existsSync(exposedPathWithExtension)) {
            return exposedPathWithExtension;
        }
    }
    return undefined;
};
const resolveExposes = (remoteOptions) => {
    return Object.entries(remoteOptions.moduleFederationConfig.exposes).reduce((accumulator, [exposedEntry, exposedPath]) => {
        accumulator[exposedEntry] =
            resolveWithExtension(exposedPath) ||
                resolveWithExtension(join(exposedPath, 'index')) ||
                exposedPath;
        return accumulator;
    }, {});
};
export const retrieveRemoteConfig = (options) => {
    if (!options.moduleFederationConfig) {
        throw new Error('moduleFederationConfig is required');
    }
    const remoteOptions = Object.assign(Object.assign({}, defaultOptions), options);
    const mapComponentsToExpose = resolveExposes(remoteOptions);
    const tsConfig = readTsConfig(remoteOptions);
    return {
        tsConfig,
        mapComponentsToExpose,
        remoteOptions,
    };
};
