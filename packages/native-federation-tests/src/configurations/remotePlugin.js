import { existsSync } from 'fs';
import { join } from 'path';
const defaultOptions = {
    testsFolder: '@mf-tests',
    distFolder: './dist',
    deleteTestsFolder: true,
    additionalBundlerConfig: {},
};
const EXTENSIONS = ['ts', 'tsx', 'js', 'jsx', 'mjs'];
const resolveWithExtension = (exposedPath) => {
    const cwd = process.cwd();
    for (const extension of EXTENSIONS) {
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
    const externalDeps = Object.keys(options.moduleFederationConfig.shared || {}).concat(Object.keys(options.moduleFederationConfig.remotes || {}));
    const compiledFilesFolder = join(remoteOptions.distFolder, remoteOptions.testsFolder);
    return {
        remoteOptions,
        externalDeps,
        compiledFilesFolder,
        mapComponentsToExpose,
    };
};
