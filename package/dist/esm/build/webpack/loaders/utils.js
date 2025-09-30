import { RSC_MODULE_TYPES } from '../../../shared/lib/constants';
import { getModuleBuildInfo } from './get-module-build-info';
const imageExtensions = [
    'jpg',
    'jpeg',
    'png',
    'webp',
    'avif',
    'ico',
    'svg'
];
const imageRegex = new RegExp(`\\.(${imageExtensions.join('|')})$`);
// Determine if the whole module is client action, 'use server' in nested closure in the client module
function isActionClientLayerModule(mod) {
    const rscInfo = getModuleBuildInfo(mod).rsc;
    return !!((rscInfo == null ? void 0 : rscInfo.actionIds) && (rscInfo == null ? void 0 : rscInfo.type) === RSC_MODULE_TYPES.client);
}
export function isClientComponentEntryModule(mod) {
    const rscInfo = getModuleBuildInfo(mod).rsc;
    const hasClientDirective = rscInfo == null ? void 0 : rscInfo.isClientRef;
    const isActionLayerEntry = isActionClientLayerModule(mod);
    return hasClientDirective || isActionLayerEntry || imageRegex.test(mod.resource);
}
export const regexCSS = /\.(css|scss|sass)(\?.*)?$/;
// This function checks if a module is able to emit CSS resources. You should
// never only rely on a single regex to do that.
export function isCSSMod(mod) {
    var _mod_loaders;
    return !!(mod.type === 'css/mini-extract' || mod.resource && regexCSS.test(mod.resource) || ((_mod_loaders = mod.loaders) == null ? void 0 : _mod_loaders.some(({ loader })=>loader.includes('next-style-loader/index.js') || process.env.NEXT_RSPACK && loader.includes('rspack.CssExtractRspackPlugin.loader') || loader.includes('mini-css-extract-plugin/loader.js') || loader.includes('@vanilla-extract/webpack-plugin/loader/'))));
}
export function encodeToBase64(obj) {
    return Buffer.from(JSON.stringify(obj)).toString('base64');
}
export function decodeFromBase64(str) {
    return JSON.parse(Buffer.from(str, 'base64').toString('utf8'));
}
export async function getLoaderModuleNamedExports(resourcePath, context) {
    var _mod_dependencies;
    const mod = await new Promise((res, rej)=>{
        context.loadModule(resourcePath, (err, _source, _sourceMap, module)=>{
            if (err) {
                return rej(err);
            }
            res(module);
        });
    });
    const exportNames = ((_mod_dependencies = mod.dependencies) == null ? void 0 : _mod_dependencies.filter((dep)=>{
        return [
            'HarmonyExportImportedSpecifierDependency',
            'HarmonyExportSpecifierDependency'
        ].includes(dep.constructor.name) && 'name' in dep && dep.name !== 'default';
    }).map((dep)=>{
        return dep.name;
    })) || [];
    return exportNames;
}

//# sourceMappingURL=utils.js.map