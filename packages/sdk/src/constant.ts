export const FederationModuleManifest = 'federation-manifest.json';
export const MANIFEST_EXT = '.json';

export const BROWSER_LOG_KEY = 'FEDERATION_DEBUG';

export const NameTransformSymbol = {
  AT: '@',
  HYPHEN: '-',
  SLASH: '/',
} as const;
export const NameTransformMap = {
  [NameTransformSymbol.AT]: 'scope_',
  [NameTransformSymbol.HYPHEN]: '_',
  [NameTransformSymbol.SLASH]: '__',
} as const;

export const EncodedNameTransformMap = {
  [NameTransformMap[NameTransformSymbol.AT]]: NameTransformSymbol.AT,
  [NameTransformMap[NameTransformSymbol.HYPHEN]]: NameTransformSymbol.HYPHEN,
  [NameTransformMap[NameTransformSymbol.SLASH]]: NameTransformSymbol.SLASH,
};

export const SEPARATOR = ':';

export const ManifestFileName = 'mf-manifest.json';
export const StatsFileName = 'mf-stats.json';

export const MFModuleType = {
  NPM: 'npm',
  APP: 'app',
};

export const MODULE_DEVTOOL_IDENTIFIER = '__MF_DEVTOOLS_MODULE_INFO__';
export const ENCODE_NAME_PREFIX = 'ENCODE_NAME_PREFIX';
export const TEMP_DIR = '.federation';

export const MFPrefetchCommon = {
  identifier: 'MFDataPrefetch',
  globalKey: '__PREFETCH__',
  library: 'mf-data-prefetch',
  exportsKey: '__PREFETCH_EXPORTS__',
  fileName: 'bootstrap.js',
};

export const enum TreeshakeStatus {
  /**
   * Not handled by deploy server, needs to infer by the real runtime period.
   */
  UNKNOWN = 1,
  /**
   * It means the shared has been calculated , runtime should take this shared as first choice.
   */
  CALCULATED = 2,
  /**
   * It means the shared has been calculated, and marked as no used
   */
  NO_USE = 0,
}
