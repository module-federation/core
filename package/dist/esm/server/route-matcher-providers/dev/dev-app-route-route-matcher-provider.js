import { AppRouteRouteMatcher } from '../../route-matchers/app-route-route-matcher';
import { RouteKind } from '../../route-kind';
import { FileCacheRouteMatcherProvider } from './file-cache-route-matcher-provider';
import { isAppRouteRoute } from '../../../lib/is-app-route-route';
import { DevAppNormalizers } from '../../normalizers/built/app';
import { isMetadataRouteFile, isStaticMetadataRoute } from '../../../lib/metadata/is-metadata-route';
import { normalizeMetadataPageToRoute } from '../../../lib/metadata/get-metadata-route';
import path from '../../../shared/lib/isomorphic/path';
export class DevAppRouteRouteMatcherProvider extends FileCacheRouteMatcherProvider {
    constructor(appDir, extensions, reader){
        super(appDir, reader);
        this.appDir = appDir;
        this.normalizers = new DevAppNormalizers(appDir, extensions);
    }
    async transform(files) {
        const matchers = [];
        for (const filename of files){
            const page = this.normalizers.page.normalize(filename);
            // If the file isn't a match for this matcher, then skip it.
            if (!isAppRouteRoute(page)) continue;
            // Validate that this is not an ignored page.
            if (page.includes('/_')) continue;
            const pathname = this.normalizers.pathname.normalize(filename);
            const bundlePath = this.normalizers.bundlePath.normalize(filename);
            const ext = path.extname(filename).slice(1);
            const isEntryMetadataRouteFile = isMetadataRouteFile(filename.replace(this.appDir, ''), [
                ext
            ], true);
            if (isEntryMetadataRouteFile && !isStaticMetadataRoute(page)) {
                // Matching dynamic metadata routes.
                // Add 2 possibilities for both single and multiple routes:
                {
                    // single:
                    // /sitemap.ts -> /sitemap.xml/route
                    // /icon.ts -> /icon/route
                    // We'll map the filename before normalization:
                    // sitemap.ts -> sitemap.xml/route.ts
                    // icon.ts -> icon/route.ts
                    const metadataPage = normalizeMetadataPageToRoute(page, false);
                    const metadataPathname = normalizeMetadataPageToRoute(pathname, false);
                    const metadataBundlePath = normalizeMetadataPageToRoute(bundlePath, false);
                    const matcher = new AppRouteRouteMatcher({
                        kind: RouteKind.APP_ROUTE,
                        page: metadataPage,
                        pathname: metadataPathname,
                        bundlePath: metadataBundlePath,
                        filename
                    });
                    matchers.push(matcher);
                }
                {
                    // multiple:
                    // /sitemap.ts -> /sitemap/[__metadata_id__]/route
                    // /icon.ts -> /icon/[__metadata_id__]/route
                    // We'll map the filename before normalization:
                    // sitemap.ts -> sitemap.xml/[__metadata_id__].ts
                    // icon.ts -> icon/[__metadata_id__].ts
                    const metadataPage = normalizeMetadataPageToRoute(page, true);
                    const metadataPathname = normalizeMetadataPageToRoute(pathname, true);
                    const metadataBundlePath = normalizeMetadataPageToRoute(bundlePath, true);
                    const matcher = new AppRouteRouteMatcher({
                        kind: RouteKind.APP_ROUTE,
                        page: metadataPage,
                        pathname: metadataPathname,
                        bundlePath: metadataBundlePath,
                        filename
                    });
                    matchers.push(matcher);
                }
            } else {
                // Normal app routes and static metadata routes.
                matchers.push(new AppRouteRouteMatcher({
                    kind: RouteKind.APP_ROUTE,
                    page,
                    pathname,
                    bundlePath,
                    filename
                }));
            }
        }
        return matchers;
    }
}

//# sourceMappingURL=dev-app-route-route-matcher-provider.js.map