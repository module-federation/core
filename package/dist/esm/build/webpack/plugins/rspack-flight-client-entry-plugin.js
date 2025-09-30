import { getInvalidator, getEntries, EntryTypes, getEntryKey } from '../../../server/dev/on-demand-entry-handler';
import { COMPILER_NAMES } from '../../../shared/lib/constants';
import { getProxiedPluginState } from '../../build-context';
import { PAGE_TYPES } from '../../../lib/page-types';
import { getRspackCore } from '../../../shared/lib/get-rspack';
const pluginState = getProxiedPluginState({
    // A map to track "action" -> "list of bundles".
    serverActions: {},
    edgeServerActions: {},
    serverActionModules: {},
    edgeServerActionModules: {},
    ssrModules: {},
    edgeSsrModules: {},
    rscModules: {},
    edgeRscModules: {},
    injectedClientEntries: {}
});
export class RspackFlightClientEntryPlugin {
    constructor(options){
        const { FlightClientEntryPlugin } = getRspackCore();
        this.plugin = new FlightClientEntryPlugin({
            ...options,
            builtinAppLoader: !!process.env.BUILTIN_SWC_LOADER,
            shouldInvalidateCb: ({ bundlePath, entryName, absolutePagePath, clientBrowserLoader })=>{
                let shouldInvalidate = false;
                const compiler = this.compiler;
                const entries = getEntries(compiler.outputPath);
                const pageKey = getEntryKey(COMPILER_NAMES.client, PAGE_TYPES.APP, bundlePath);
                if (!entries[pageKey]) {
                    entries[pageKey] = {
                        type: EntryTypes.CHILD_ENTRY,
                        parentEntries: new Set([
                            entryName
                        ]),
                        absoluteEntryFilePath: absolutePagePath,
                        bundlePath,
                        request: clientBrowserLoader,
                        dispose: false,
                        lastActiveTime: Date.now()
                    };
                    shouldInvalidate = true;
                } else {
                    const entryData = entries[pageKey];
                    // New version of the client loader
                    if (entryData.request !== clientBrowserLoader) {
                        entryData.request = clientBrowserLoader;
                        shouldInvalidate = true;
                    }
                    if (entryData.type === EntryTypes.CHILD_ENTRY) {
                        entryData.parentEntries.add(entryName);
                    }
                    entryData.dispose = false;
                    entryData.lastActiveTime = Date.now();
                }
                return shouldInvalidate;
            },
            invalidateCb: ()=>{
                const compiler = this.compiler;
                // Invalidate in development to trigger recompilation
                const invalidator = getInvalidator(compiler.outputPath);
                // Check if any of the entry injections need an invalidation
                if (invalidator) {
                    invalidator.invalidate([
                        COMPILER_NAMES.client
                    ]);
                }
            },
            stateCb: (state)=>{
                Object.assign(pluginState.serverActions, state.serverActions);
                Object.assign(pluginState.edgeServerActions, state.edgeServerActions);
                Object.assign(pluginState.serverActionModules, state.serverActionModules);
                Object.assign(pluginState.edgeServerActionModules, state.edgeServerActionModules);
                Object.assign(pluginState.ssrModules, state.ssrModules);
                Object.assign(pluginState.edgeSsrModules, state.edgeSsrModules);
                Object.assign(pluginState.rscModules, state.rscModules);
                Object.assign(pluginState.edgeRscModules, state.edgeRscModules);
                Object.assign(pluginState.injectedClientEntries, state.injectedClientEntries);
            }
        });
    }
    apply(compiler) {
        this.compiler = compiler;
        this.plugin.apply(compiler);
    }
}

//# sourceMappingURL=rspack-flight-client-entry-plugin.js.map