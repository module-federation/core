import type { PageExtensions } from '../../build/page-extensions-type';
export declare const STATIC_METADATA_IMAGES: {
    readonly icon: {
        readonly filename: "icon";
        readonly extensions: readonly ["ico", "jpg", "jpeg", "png", "svg"];
    };
    readonly apple: {
        readonly filename: "apple-icon";
        readonly extensions: readonly ["jpg", "jpeg", "png"];
    };
    readonly favicon: {
        readonly filename: "favicon";
        readonly extensions: readonly ["ico"];
    };
    readonly openGraph: {
        readonly filename: "opengraph-image";
        readonly extensions: readonly ["jpg", "jpeg", "png", "gif"];
    };
    readonly twitter: {
        readonly filename: "twitter-image";
        readonly extensions: readonly ["jpg", "jpeg", "png", "gif"];
    };
};
export declare const DEFAULT_METADATA_ROUTE_EXTENSIONS: string[];
export declare const getExtensionRegexString: (staticExtensions: readonly string[], dynamicExtensions: readonly string[] | null) => string;
/**
 * Determine if the file is a metadata route file entry
 * @param appDirRelativePath the relative file path to app/
 * @param pageExtensions the js extensions, such as ['js', 'jsx', 'ts', 'tsx']
 * @param strictlyMatchExtensions if it's true, match the file with page extension, otherwise match the file with default corresponding extension
 * @returns {boolean} if the file is a metadata route file
 */
export declare function isMetadataRouteFile(appDirRelativePath: string, pageExtensions: PageExtensions, strictlyMatchExtensions: boolean): boolean;
export declare function isStaticMetadataRoute(route: string): boolean;
/**
 * Determine if a page or pathname is a metadata page.
 *
 * The input is a page or pathname, which can be with or without page suffix /foo/page or /foo.
 * But it will not contain the /route suffix.
 *
 * .e.g
 * /robots -> true
 * /sitemap -> true
 * /foo -> false
 */
export declare function isMetadataPage(page: string): boolean;
export declare function isMetadataRoute(route: string): boolean;
