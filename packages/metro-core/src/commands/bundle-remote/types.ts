export type BundleFederatedRemoteArgs = {
  entryFile: string;
  platform: string;
  dev: boolean;
  minify?: boolean;
  bundleEncoding?: 'utf8' | 'utf16le' | 'ascii';
  maxWorkers?: string;
  sourcemapOutput?: string;
  sourcemapSourcesRoot?: string;
  sourcemapUseAbsolutePath?: boolean;
  assetsDest?: string;
  assetCatalogDest?: string;
  resetCache?: boolean;
  config?: string;
  output?: string;
};
