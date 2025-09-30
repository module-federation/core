import { BUILD_MANIFEST, REACT_LOADABLE_MANIFEST, CLIENT_REFERENCE_MANIFEST, SERVER_REFERENCE_MANIFEST, DYNAMIC_CSS_MANIFEST, SUBRESOURCE_INTEGRITY_MANIFEST } from '../shared/lib/constants';
import { join } from 'path';
import { requirePage } from './require';
import { interopDefault } from '../lib/interop-default';
import { getTracer } from './lib/trace/tracer';
import { LoadComponentsSpan } from './lib/trace/constants';
import { evalManifest, loadManifest } from './load-manifest';
import { wait } from '../lib/wait';
import { setReferenceManifestsSingleton } from './app-render/encryption-utils';
import { createServerModuleMap } from './app-render/action-utils';
import { normalizePagePath } from '../shared/lib/page-path/normalize-page-path';
import { isStaticMetadataRoute } from '../lib/metadata/is-metadata-route';
/**
 * Load manifest file with retries, defaults to 3 attempts.
 */ export async function loadManifestWithRetries(manifestPath, attempts = 3) {
    while(true){
        try {
            return loadManifest(manifestPath);
        } catch (err) {
            attempts--;
            if (attempts <= 0) throw err;
            await wait(100);
        }
    }
}
/**
 * Load manifest file with retries, defaults to 3 attempts, or return undefined.
 */ export async function tryLoadManifestWithRetries(manifestPath, attempts = 3) {
    try {
        return await loadManifestWithRetries(manifestPath, attempts);
    } catch (err) {
        return undefined;
    }
}
/**
 * Load manifest file with retries, defaults to 3 attempts.
 */ export async function evalManifestWithRetries(manifestPath, attempts = 3) {
    while(true){
        try {
            return evalManifest(manifestPath);
        } catch (err) {
            attempts--;
            if (attempts <= 0) throw err;
            await wait(100);
        }
    }
}
async function tryLoadClientReferenceManifest(manifestPath, entryName, attempts) {
    try {
        const context = await evalManifestWithRetries(manifestPath, attempts);
        return context.__RSC_MANIFEST[entryName];
    } catch (err) {
        return undefined;
    }
}
async function loadComponentsImpl({ distDir, page, isAppPath, isDev, sriEnabled }) {
    let DocumentMod = {};
    let AppMod = {};
    if (!isAppPath) {
        ;
        [DocumentMod, AppMod] = await Promise.all([
            requirePage('/_document', distDir, false),
            requirePage('/_app', distDir, false)
        ]);
    }
    // In dev mode we retry loading a manifest file to handle a race condition
    // that can occur while app and pages are compiling at the same time, and the
    // build-manifest is still being written to disk while an app path is
    // attempting to load.
    const manifestLoadAttempts = isDev ? 3 : 1;
    let reactLoadableManifestPath;
    if (!process.env.TURBOPACK) {
        reactLoadableManifestPath = join(distDir, REACT_LOADABLE_MANIFEST);
    } else if (isAppPath) {
        reactLoadableManifestPath = join(distDir, 'server', 'app', page, REACT_LOADABLE_MANIFEST);
    } else {
        reactLoadableManifestPath = join(distDir, 'server', 'pages', normalizePagePath(page), REACT_LOADABLE_MANIFEST);
    }
    // Make sure to avoid loading the manifest for static metadata routes for better performance.
    const hasClientManifest = !isStaticMetadataRoute(page);
    // Load the manifest files first
    //
    // Loading page-specific manifests shouldn't throw an error if the manifest couldn't be found, so
    // that the `requirePage` call below will throw the correct error in that case
    // (a `PageNotFoundError`).
    const [buildManifest, reactLoadableManifest, dynamicCssManifest, clientReferenceManifest, serverActionsManifest, subresourceIntegrityManifest] = await Promise.all([
        loadManifestWithRetries(join(distDir, BUILD_MANIFEST), manifestLoadAttempts),
        tryLoadManifestWithRetries(reactLoadableManifestPath, manifestLoadAttempts),
        // This manifest will only exist in Pages dir && Production && Webpack.
        isAppPath || process.env.TURBOPACK ? undefined : loadManifestWithRetries(join(distDir, `${DYNAMIC_CSS_MANIFEST}.json`), manifestLoadAttempts).catch(()=>undefined),
        isAppPath && hasClientManifest ? tryLoadClientReferenceManifest(join(distDir, 'server', 'app', page.replace(/%5F/g, '_') + '_' + CLIENT_REFERENCE_MANIFEST + '.js'), page.replace(/%5F/g, '_'), manifestLoadAttempts) : undefined,
        isAppPath ? loadManifestWithRetries(join(distDir, 'server', SERVER_REFERENCE_MANIFEST + '.json'), manifestLoadAttempts).catch(()=>null) : null,
        sriEnabled ? loadManifestWithRetries(join(distDir, 'server', SUBRESOURCE_INTEGRITY_MANIFEST + '.json')).catch(()=>undefined) : undefined
    ]);
    // Before requiring the actual page module, we have to set the reference
    // manifests to our global store so Server Action's encryption util can access
    // to them at the top level of the page module.
    if (serverActionsManifest && clientReferenceManifest) {
        setReferenceManifestsSingleton({
            page,
            clientReferenceManifest,
            serverActionsManifest,
            serverModuleMap: createServerModuleMap({
                serverActionsManifest
            })
        });
    }
    const ComponentMod = await requirePage(page, distDir, isAppPath);
    const Component = interopDefault(ComponentMod);
    const Document = interopDefault(DocumentMod);
    const App = interopDefault(AppMod);
    const { getServerSideProps, getStaticProps, getStaticPaths, routeModule } = ComponentMod;
    return {
        App,
        Document,
        Component,
        buildManifest,
        subresourceIntegrityManifest,
        reactLoadableManifest: reactLoadableManifest || {},
        dynamicCssManifest,
        pageConfig: ComponentMod.config || {},
        ComponentMod,
        getServerSideProps,
        getStaticProps,
        getStaticPaths,
        clientReferenceManifest,
        serverActionsManifest,
        isAppPath,
        page,
        routeModule
    };
}
export const loadComponents = getTracer().wrap(LoadComponentsSpan.loadComponents, loadComponentsImpl);

//# sourceMappingURL=load-components.js.map