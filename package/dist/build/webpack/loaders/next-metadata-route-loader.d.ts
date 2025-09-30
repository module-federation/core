import type webpack from 'webpack';
export type MetadataRouteLoaderOptions = {
    filePath: string;
    isDynamicRouteExtension: '1' | '0';
};
export declare function getFilenameAndExtension(resourcePath: string): {
    name: string;
    ext: string;
};
declare const nextMetadataRouterLoader: webpack.LoaderDefinitionFunction<MetadataRouteLoaderOptions>;
export default nextMetadataRouterLoader;
